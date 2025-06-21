import React from 'react';
import { useMemo, useCallback, useRef } from 'react';
import { InvestmentConfig, InvestmentData } from '@/types/investment';
import { useSupabaseConfig } from '@/hooks/useSupabaseConfig';
import { useInvestmentConfigState, getDefaultConfig } from './investmentConfigState';
import { calculateInvestment, isPACDay, getNextPACInfo } from './investmentCalculationUtils';

// funzione di deep compare (shallow per oggetti semplici)
const deepEqual = (a: any, b: any): boolean => {
  return JSON.stringify(a) === JSON.stringify(b);
};

// Custom hook principale per usare il calcolatore d'investimento e tutte le sue API
export const useInvestmentCalculator = () => {
  const {
    configState,
    setConfig,
    setDailyReturns,
    setDailyPACOverrides,
    setCurrentConfigId,
    setCurrentConfigName,
    createNewConfiguration,
    resetCustomData,
  } = useInvestmentConfigState();

  const {
    loading: supabaseLoading,
    savedConfigs,
    saveConfiguration,
    updateConfiguration,
    loadConfigurations,
    deleteConfiguration
  } = useSupabaseConfig();

  const loadInitialized = useRef(false);

  // Load configurations only once on mount
  React.useEffect(() => {
    if (!loadInitialized.current) {
      loadInitialized.current = true;
      loadConfigurations();
    }
  }, []);

  // Calcolo investimento
  const investmentData: InvestmentData[] = useMemo(() => {
    return calculateInvestment({
      config: configState.config,
      dailyReturns: configState.dailyReturns,
      dailyPACOverrides: configState.dailyPACOverrides
    });
  }, [configState.config, configState.dailyReturns, configState.dailyPACOverrides]);

  // Calcolo del giorno attuale basato sulla data di inizio
  const currentDayIndex = useMemo(() => {
    const startDate = new Date(
      typeof configState.config.pacConfig.startDate === "string"
        ? configState.config.pacConfig.startDate
        : configState.config.pacConfig.startDate
    );
    startDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, Math.min(diffDays, configState.config.timeHorizon));
  }, [configState.config.pacConfig.startDate, configState.config.timeHorizon]);

  // Determina configurazione "salvata" attuale
  const savedConfig = React.useMemo(() =>
    configState.currentConfigId
      ? savedConfigs.find(c => c.id === configState.currentConfigId)
      : null,
    [savedConfigs, configState.currentConfigId]
  );

  // Enhanced unsaved changes detection
  const hasUnsavedChanges = React.useMemo(() => {
    if (!savedConfig) {
      // Se non c'è una configurazione salvata corrente, controlla se ci sono dati personalizzati
      const hasCustomReturns = Object.keys(configState.dailyReturns).length > 0;
      const hasCustomPAC = Object.keys(configState.dailyPACOverrides).length > 0;
      const hasNonDefaultConfig = 
        configState.config.initialCapital !== 1000 ||
        configState.config.timeHorizon !== 365 ||
        configState.config.dailyReturnRate !== 0.1 ||
        configState.config.pacConfig.amount !== 100;
      
      return hasCustomReturns || hasCustomPAC || hasNonDefaultConfig;
    }
    
    const stateToCompare = {
      config: {
        ...configState.config,
        pacConfig: {
          ...configState.config.pacConfig,
          startDate: (typeof configState.config.pacConfig.startDate === "string"
            ? configState.config.pacConfig.startDate
            : configState.config.pacConfig.startDate.toISOString().split('T')[0])
        },
      },
      dailyReturns: configState.dailyReturns,
      dailyPACOverrides: configState.dailyPACOverrides,
    };
    const savedToCompare = {
      config: {
        ...savedConfig.config,
        pacConfig: {
          ...savedConfig.config.pacConfig,
          startDate: (typeof savedConfig.config.pacConfig.startDate === "string"
            ? savedConfig.config.pacConfig.startDate
            : savedConfig.config.pacConfig.startDate.toISOString().split('T')[0])
        },
      },
      dailyReturns: savedConfig.dailyReturns,
      dailyPACOverrides: savedConfig.dailyPACOverrides || {},
    };
    return !deepEqual(stateToCompare, savedToCompare);
  }, [configState.config, configState.dailyReturns, configState.dailyPACOverrides, savedConfig]);

  // Enhanced updateConfig with unsaved changes tracking
  const updateConfig = useCallback((newConfig: Partial<InvestmentConfig>, reset: boolean = false) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    
    // Mark as unsaved if we have a current config
    if (configState.currentConfigId) {
      setCurrentConfigId(null);
    }
    
    if (
      reset ||
      newConfig.initialCapital !== undefined ||
      newConfig.timeHorizon !== undefined ||
      newConfig.pacConfig?.frequency !== undefined
    ) {
      setDailyReturns({});
      setDailyPACOverrides({});
    }
  }, [setConfig, setDailyReturns, setDailyPACOverrides, setCurrentConfigId, configState.currentConfigId]);

  const updateDailyReturn = useCallback((day: number, returnRate: number) => {
    setDailyReturns(prev => ({
      ...prev,
      [day]: returnRate
    }));
    
    // Mark as unsaved
    if (configState.currentConfigId) {
      setCurrentConfigId(null);
    }
  }, [setDailyReturns, setCurrentConfigId, configState.currentConfigId]);

  const removeDailyReturn = useCallback((day: number) => {
    setDailyReturns(prev => {
      const newReturns = { ...prev };
      delete newReturns[day];
      return newReturns;
    });
    
    // Mark as unsaved
    if (configState.currentConfigId) {
      setCurrentConfigId(null);
    }
  }, [setDailyReturns, setCurrentConfigId, configState.currentConfigId]);

  const exportToCSV = useCallback(() => {
    const csvContent = [
      ['Giorno', 'Data', 'Capitale Iniziale', 'PAC', 'Capitale Post-PAC', 'Ricavo Giorno', '% Ricavo', 'Custom', 'Capitale Finale', 'PAC Totale', 'Interessi Totali'],
      ...investmentData.map(row => [
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
    link.download = `wealth-compass-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }, [investmentData]);

  const updatePACForDay = useCallback((day: number, pacAmount: number) => {
    setDailyPACOverrides(prev => {
      const updated = {
        ...prev,
        [day]: pacAmount
      };
      return updated;
    });
    
    // Mark as unsaved
    if (configState.currentConfigId) {
      setCurrentConfigId(null);
    }
  }, [setDailyPACOverrides, setCurrentConfigId, configState.currentConfigId]);

  const removePACOverride = useCallback((day: number) => {
    setDailyPACOverrides(prev => {
      const updated = { ...prev };
      delete updated[day];
      return updated;
    });
    
    // Mark as unsaved
    if (configState.currentConfigId) {
      setCurrentConfigId(null);
    }
  }, [setDailyPACOverrides, setCurrentConfigId, configState.currentConfigId]);

  const saveCurrentConfiguration = useCallback(async (name: string) => {
    const configId = await saveConfiguration(name, configState.config, configState.dailyReturns, configState.dailyPACOverrides);
    if (configId) {
      setCurrentConfigId(configId);
      setCurrentConfigName(name);
    }
  }, [saveConfiguration, configState.config, configState.dailyReturns, configState.dailyPACOverrides, setCurrentConfigId, setCurrentConfigName]);

  const updateCurrentConfiguration = useCallback(async (configId: string, name: string) => {
    const success = await updateConfiguration(configId, name, configState.config, configState.dailyReturns, configState.dailyPACOverrides);
    if (success) {
      setCurrentConfigId(configId);
      setCurrentConfigName(name);
    }
  }, [updateConfiguration, configState.config, configState.dailyReturns, configState.dailyPACOverrides, setCurrentConfigId, setCurrentConfigName]);

  const loadSavedConfiguration = useCallback((savedConfig: any) => {
    setConfig(savedConfig.config);
    setDailyReturns(savedConfig.dailyReturns);
    setDailyPACOverrides(savedConfig.dailyPACOverrides || {});
    setCurrentConfigId(savedConfig.id);
    setCurrentConfigName(savedConfig.name);
  }, [setConfig, setDailyReturns, setDailyPACOverrides, setCurrentConfigId, setCurrentConfigName]);

  // Calcola info prossimo PAC
  const nextPACInfo = useMemo(
    () => getNextPACInfo(configState.config.pacConfig),
    [configState.config.pacConfig]
  );

  // Dati attuali e finali
  const currentData = investmentData[currentDayIndex] || investmentData[0];
  const finalData = investmentData[investmentData.length - 1] || investmentData[0];

  return {
    config: configState.config,
    updateConfig,
    createNewConfiguration,
    investmentData,
    dailyReturns: configState.dailyReturns,
    updateDailyReturn,
    removeDailyReturn,
    exportToCSV,
    dailyPACOverrides: configState.dailyPACOverrides,
    updatePACForDay,
    removePACOverride,
    currentConfigId: configState.currentConfigId,
    currentConfigName: configState.currentConfigName,
    savedConfigs,
    saveCurrentConfiguration,
    updateCurrentConfiguration,
    loadSavedConfiguration,
    deleteConfiguration,
    supabaseLoading,
    getNextPACInfo: () => nextPACInfo,
    hasUnsavedChanges,
    currentDayIndex,
    summary: {
      current: {
        finalCapital: currentData?.finalCapital || 0,
        totalInvested: configState.config.initialCapital + (currentData?.totalPACInvested || 0),
        totalInterest: currentData?.totalInterest || 0,
        totalReturn: currentData 
          ? ((currentData.finalCapital / (configState.config.initialCapital + currentData.totalPACInvested) - 1) * 100)
          : 0,
        day: currentDayIndex
      },
      final: {
        finalCapital: finalData?.finalCapital || 0,
        totalInvested: configState.config.initialCapital + (finalData?.totalPACInvested || 0),
        totalInterest: finalData?.totalInterest || 0,
        totalReturn: finalData
          ? ((finalData.finalCapital / (configState.config.initialCapital + finalData.totalPACInvested) - 1) * 100)
          : 0,
        day: configState.config.timeHorizon
      }
    }
  };
};
