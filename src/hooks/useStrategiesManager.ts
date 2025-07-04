import { useState, useCallback, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Strategy, StrategyConfig } from '@/types/strategy';
import { useStrategyDatabase } from './useStrategyDatabase';
import { useStrategyCalculations } from './useStrategyCalculations';
import { useToast } from '@/hooks/use-toast';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';

// Configurazione di default per una nuova strategia
const getDefaultStrategyConfig = (): StrategyConfig => ({
  initialCapital: 1000,
  timeHorizon: 1000,
  dailyReturnRate: 0.2,
  currency: 'EUR',
  pacConfig: {
    amount: 100,
    frequency: 'weekly',
    startDate: new Date(),
  }
});

export const useStrategiesManager = (user: User | null, authLoading: boolean) => {
  const { toast } = useToast();
  const calculator = useInvestmentCalculator();
  const [currentStrategy, setCurrentStrategy] = useState<Strategy | null>(null);
  const [strategyConfig, setStrategyConfig] = useState<StrategyConfig>(getDefaultStrategyConfig());
  const [dailyReturns, setDailyReturns] = useState<{ [day: number]: number }>({});
  const [dailyPACOverrides, setDailyPACOverrides] = useState<{ [day: number]: number }>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeInCalculator, setActiveInCalculator] = useState(false);

  const {
    loading,
    strategies,
    loadStrategies,
    saveStrategy,
    updateStrategy,
    deleteStrategy,
  } = useStrategyDatabase(user);

  const calculations = useStrategyCalculations(strategyConfig, dailyReturns, dailyPACOverrides);

  // Carica strategie solo quando l'autenticazione è stabile
  useEffect(() => {
    if (!authLoading && user) {
      loadStrategies();
    }
  }, [loadStrategies, user, authLoading]);

  // Monitora i cambiamenti per unsaved changes
  useEffect(() => {
    if (currentStrategy) {
      const hasConfigChanges = JSON.stringify(strategyConfig) !== JSON.stringify(currentStrategy.config);
      const hasReturnsChanges = JSON.stringify(dailyReturns) !== JSON.stringify(currentStrategy.dailyReturns);
      const hasPACChanges = JSON.stringify(dailyPACOverrides) !== JSON.stringify(currentStrategy.dailyPACOverrides);
      
      setHasUnsavedChanges(hasConfigChanges || hasReturnsChanges || hasPACChanges);
    } else {
      // Se non c'è strategia corrente, controlla se ci sono modifiche rispetto al default
      const defaultConfig = getDefaultStrategyConfig();
      const hasConfigChanges = JSON.stringify(strategyConfig) !== JSON.stringify(defaultConfig);
      const hasReturnsChanges = Object.keys(dailyReturns).length > 0;
      const hasPACChanges = Object.keys(dailyPACOverrides).length > 0;
      
      setHasUnsavedChanges(hasConfigChanges || hasReturnsChanges || hasPACChanges);
    }
  }, [strategyConfig, dailyReturns, dailyPACOverrides, currentStrategy]);

  const loadStrategy = useCallback((strategy: Strategy, activateInCalculator = false) => {
    setCurrentStrategy(strategy);
    
    // Assicuriamoci che la configurazione abbia tutti i campi necessari
    const configToLoad = {
      ...strategy.config,
      pacConfig: {
        ...strategy.config.pacConfig,
        // Assicuriamoci che startDate sia un oggetto Date
        startDate: strategy.config.pacConfig.startDate instanceof Date 
          ? strategy.config.pacConfig.startDate 
          : new Date(strategy.config.pacConfig.startDate)
      }
    };
    
    // Caricamento in sequenza per evitare problemi di stato
    setStrategyConfig(configToLoad);
    setDailyReturns(strategy.dailyReturns || {});
    setDailyPACOverrides(strategy.dailyPACOverrides || {});
    setHasUnsavedChanges(false);
    
    // Sync with investment calculator if requested
    console.log('✅ Strategia caricata con successo:', strategy.name);
    return strategy;
  }, []);

  // Funzione per sincronizzare con il calcolatore principale
  const syncWithCalculator = useCallback((strategy: Strategy) => {
    // Prepara la configurazione con date valide
    const config = {
      initialCapital: strategy.config.initialCapital,
      timeHorizon: strategy.config.timeHorizon,
      dailyReturnRate: strategy.config.dailyReturnRate,
      currency: strategy.config.currency,
      pacConfig: {
        ...strategy.config.pacConfig,
        startDate: strategy.config.pacConfig.startDate instanceof Date 
          ? strategy.config.pacConfig.startDate 
          : new Date(strategy.config.pacConfig.startDate)
      }
    };
    
    // Aggiorna il calcolatore con i dati della strategia
    calculator.setConfig(config);
    calculator.setDailyReturns(strategy.dailyReturns || {});
    calculator.setDailyPACOverrides(strategy.dailyPACOverrides || {});
    calculator.setCurrentConfigId(null); // Resetta l'ID della configurazione
    calculator.setCurrentConfigName(strategy.name);
    
    return true;
  }, [calculator]);

  // Funzione separata per attivare una strategia nel calcolatore principale
  const activateStrategy = useCallback((strategy: Strategy) => {
    // Carica prima la strategia nell'interfaccia
    loadStrategy(strategy, false);
    
    // Sincronizza con il calcolatore
    const success = syncWithCalculator(strategy);
    
    if (success) {
      setActiveInCalculator(true);
    }
    
    // Notifica l'attivazione
    toast({
      title: "Strategia attivata",
      description: `La strategia "${strategy.name}" è stata attivata nel calcolatore`
    });
    
    // Restituisci la strategia per l'uso esterno
    return strategy;
  }, [loadStrategy, toast, syncWithCalculator]);

  const createNewStrategy = useCallback(() => {
    setCurrentStrategy(null);
    setStrategyConfig(getDefaultStrategyConfig());
    setDailyReturns({});
    setDailyPACOverrides({});
    setHasUnsavedChanges(false);
  }, []);

  const saveCurrentStrategy = useCallback(async (name: string) => {
    const strategyId = await saveStrategy(name, strategyConfig, dailyReturns, dailyPACOverrides);
    if (strategyId) {
      try {
        // Ricarica le strategie per aggiornare la lista
        await loadStrategies();
        
        // Cerca la strategia appena salvata
        const savedStrategy = strategies.find(s => s.id === strategyId);
        if (savedStrategy) {
          setCurrentStrategy(savedStrategy);
        }
        setHasUnsavedChanges(false);
        console.log('✅ Strategia salvata con successo:', name);
      } catch (error) {
        console.error('❌ Errore dopo il salvataggio della strategia:', error);
      }
    }
    return strategyId;
  }, [saveStrategy, strategyConfig, dailyReturns, dailyPACOverrides, loadStrategies, strategies]);

  const updateCurrentStrategy = useCallback(async (strategyId: string, name: string) => {
    const success = await updateStrategy(strategyId, name, strategyConfig, dailyReturns, dailyPACOverrides);
    if (success) {
      try {
        // Ricarica le strategie per aggiornare la lista
        await loadStrategies();
        
        // Aggiorna la strategia corrente
        if (currentStrategy) {
          const updatedStrategy = strategies.find(s => s.id === strategyId);
          if (updatedStrategy) {
            setCurrentStrategy(updatedStrategy);
          }
        }
        setHasUnsavedChanges(false);
        console.log('✅ Strategia aggiornata con successo:', name);
      } catch (error: any) {
        console.error('❌ Errore dopo l\'aggiornamento della strategia:', error);
      }
    }
    return success;
  }, [updateStrategy, strategyConfig, dailyReturns, dailyPACOverrides, loadStrategies, strategies, currentStrategy]);

  const updateStrategyConfig = useCallback((newConfig: Partial<StrategyConfig>) => {
    setStrategyConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const updateDailyReturn = useCallback((day: number, returnRate: number) => {
    setDailyReturns(prev => ({ ...prev, [day]: returnRate }));
  }, []);

  const removeDailyReturn = useCallback((day: number) => {
    setDailyReturns(prev => {
      const newReturns = { ...prev };
      delete newReturns[day];
      return newReturns;
    });
  }, []);

  const updatePACForDay = useCallback((day: number, pacAmount: number) => {
    setDailyPACOverrides(prev => ({ ...prev, [day]: pacAmount }));
  }, []);

  const removePACOverride = useCallback((day: number) => {
    setDailyPACOverrides(prev => {
      const newOverrides = { ...prev };
      delete newOverrides[day];
      return newOverrides;
    });
  }, []);

  const exportToCSV = useCallback(() => {
    const csvContent = [
      ['Giorno', 'Data', 'Capitale Iniziale', 'PAC', 'Capitale Post-PAC', 'Ricavo Giorno', '% Ricavo', 'Custom', 'Capitale Finale', 'PAC Totale', 'Interessi Totali'],
      ...calculations.strategyData.map(row => [
        row.day,
        row.date,
        row.capitalBeforePAC.toFixed(2),
        row.pacAmount.toFixed(2),
        row.capitalAfterPAC.toFixed(2),
        row.interestEarnedDaily.toFixed(2),
        row.dailyReturn.toFixed(4),
        row.isCustomReturn ? 'Sì' : 'No',
        row.finalCapital.toFixed(2),
        row.totalPACInvested.toFixed(2),
        row.totalInterest.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `strategia-${currentStrategy?.name || 'nuova'}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }, [calculations.strategyData, currentStrategy]);

  return {
    // Stato
    loading,
    strategies,
    currentStrategy,
    strategyConfig,
    dailyReturns,
    dailyPACOverrides,
    hasUnsavedChanges,
    
    // Calcoli
    ...calculations,
    activeInCalculator,
    
    // Operazioni strategie
    loadStrategy,
    createNewStrategy,
    saveCurrentStrategy,
    updateCurrentStrategy,
    deleteStrategy,
    
    // Operazioni configurazione
    updateStrategyConfig,
    updateDailyReturn,
    removeDailyReturn,
    updatePACForDay,
    removePACOverride,
    
    // Utilità
    exportToCSV,
    refreshStrategies: loadStrategies,
    activateStrategy
  };
};