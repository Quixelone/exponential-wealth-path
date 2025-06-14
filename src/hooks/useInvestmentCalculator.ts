
import { useState, useMemo, useCallback, useEffect } from 'react';
import { InvestmentConfig, InvestmentData, PACConfig } from '@/types/investment';
import { useSupabaseConfig } from '@/hooks/useSupabaseConfig';

export const useInvestmentCalculator = () => {
  const [config, setConfig] = useState<InvestmentConfig>({
    initialCapital: 1000,
    timeHorizon: 1000,
    dailyReturnRate: 0.2, // 0.2% giornaliero
    pacConfig: {
      amount: 100,
      frequency: 'weekly',
      startDate: new Date()
    }
  });

  const [dailyReturns, setDailyReturns] = useState<{ [day: number]: number }>({});
  const [dailyPACOverrides, setDailyPACOverrides] = useState<{ [day: number]: number }>({});
  const [currentConfigId, setCurrentConfigId] = useState<string | null>(null);
  const [currentConfigName, setCurrentConfigName] = useState<string>('');

  const {
    loading: supabaseLoading,
    savedConfigs,
    saveConfiguration,
    updateConfiguration,
    loadConfigurations,
    deleteConfiguration
  } = useSupabaseConfig();

  // Caricare le configurazioni salvate all'avvio
  useEffect(() => {
    loadConfigurations();
  }, [loadConfigurations]);

  const isPACDay = useCallback((day: number, pacConfig: PACConfig): boolean => {
    // La logica PAC ora inizia dal primo periodo completo, non dal giorno 0
    switch (pacConfig.frequency) {
      case 'daily':
        return day >= 1; // Primo pagamento dal giorno 1
      case 'weekly':
        return day >= 7 && day % 7 === 0; // Primo pagamento al giorno 7, poi ogni 7 giorni
      case 'monthly':
        return day >= 30 && day % 30 === 0; // Primo pagamento al giorno 30, poi ogni 30 giorni
      case 'custom':
        const customDays = pacConfig.customDays || 10;
        return day >= customDays && day % customDays === 0; // Primo pagamento al giorno personalizzato
      default:
        return false;
    }
  }, []);

  const calculateInvestment = useMemo((): InvestmentData[] => {
    const results: InvestmentData[] = [];
    let currentCapital = config.initialCapital;
    let totalPACInvested = 0;

    for (let day = 0; day <= config.timeHorizon; day++) {
      const currentDate = new Date(config.pacConfig.startDate);
      currentDate.setDate(currentDate.getDate() + day);

      const capitalBeforePAC = currentCapital;

      // Use custom PAC amount if set for this day, else default logic
      let pacAmount = 0;
      let isCustomPAC = false;
      if (dailyPACOverrides.hasOwnProperty(day)) {
        pacAmount = dailyPACOverrides[day];
        isCustomPAC = true;
      } else if (isPACDay(day, config.pacConfig)) {
        pacAmount = config.pacConfig.amount;
      }
      currentCapital += pacAmount;
      totalPACInvested += pacAmount;

      const capitalAfterPAC = currentCapital;

      const dailyReturn = dailyReturns[day] ?? config.dailyReturnRate;
      const isCustomReturn = dailyReturns.hasOwnProperty(day);

      // Calculate interest earned for the day
      const interestEarnedDaily = capitalAfterPAC * (dailyReturn / 100);
      currentCapital += interestEarnedDaily;

      const totalInterest = currentCapital - config.initialCapital - totalPACInvested;

      results.push({
        day,
        date: currentDate.toISOString().split('T')[0],
        capitalBeforePAC,
        pacAmount,
        capitalAfterPAC,
        dailyReturn,
        interestEarnedDaily,
        finalCapital: currentCapital,
        totalPACInvested,
        totalInterest,
        isCustomReturn,
        isCustomPAC,
      });
    }

    return results;
  }, [config, dailyReturns, dailyPACOverrides, isPACDay]);

  const updateConfig = useCallback((newConfig: Partial<InvestmentConfig>, resetCustomData: boolean = false) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    setCurrentConfigId(null); // Indica che la configurazione è stata modificata
    
    // Se resetCustomData è true o se stiamo cambiando parametri fondamentali, azzera i dati personalizzati
    if (resetCustomData || 
        newConfig.initialCapital !== undefined || 
        newConfig.timeHorizon !== undefined ||
        newConfig.pacConfig?.frequency !== undefined) {
      setDailyReturns({});
      setDailyPACOverrides({});
    }
  }, []);

  const createNewConfiguration = useCallback(() => {
    // Crea una nuova configurazione pulita azzerando tutti i dati personalizzati
    setDailyReturns({});
    setDailyPACOverrides({});
    setCurrentConfigId(null);
    setCurrentConfigName('');
    setConfig({
      initialCapital: 1000,
      timeHorizon: 1000,
      dailyReturnRate: 0.2,
      pacConfig: {
        amount: 100,
        frequency: 'weekly',
        startDate: new Date()
      }
    });
  }, []);

  const updateDailyReturn = useCallback((day: number, returnRate: number) => {
    setDailyReturns(prev => ({
      ...prev,
      [day]: returnRate
    }));
    setCurrentConfigId(null); // Indica che la configurazione è stata modificata
  }, []);

  const removeDailyReturn = useCallback((day: number) => {
    setDailyReturns(prev => {
      const newReturns = { ...prev };
      delete newReturns[day];
      return newReturns;
    });
    setCurrentConfigId(null); // Indica che la configurazione è stata modificata
  }, []);

  const saveCurrentConfiguration = useCallback(async (name: string) => {
    const configId = await saveConfiguration(name, config, dailyReturns);
    if (configId) {
      setCurrentConfigId(configId);
      setCurrentConfigName(name);
      loadConfigurations(); // Ricarica la lista
    }
  }, [config, dailyReturns, saveConfiguration, loadConfigurations]);

  const updateCurrentConfiguration = useCallback(async (configId: string, name: string) => {
    const success = await updateConfiguration(configId, name, config, dailyReturns);
    if (success) {
      setCurrentConfigId(configId);
      setCurrentConfigName(name);
      loadConfigurations(); // Ricarica la lista
    }
  }, [config, dailyReturns, updateConfiguration, loadConfigurations]);

  const loadSavedConfiguration = useCallback((savedConfig: any) => {
    setConfig(savedConfig.config);
    setDailyReturns(savedConfig.dailyReturns);
    setDailyPACOverrides({}); // Azzera sempre gli override PAC quando si carica una configurazione salvata
    setCurrentConfigId(savedConfig.id);
    setCurrentConfigName(savedConfig.name);
  }, []);

  const exportToCSV = useCallback(() => {
    const csvContent = [
      ['Giorno', 'Data', 'Capitale Iniziale', 'PAC', 'Capitale Post-PAC', 'Ricavo Giorno', '% Ricavo', 'Custom', 'Capitale Finale', 'PAC Totale', 'Interessi Totali'],
      ...calculateInvestment.map(row => [
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
  }, [calculateInvestment]);

  const updatePACForDay = useCallback((day: number, pacAmount: number) => {
    setDailyPACOverrides(prev => ({
      ...prev,
      [day]: pacAmount
    }));
    setCurrentConfigId(null);
  }, []);

  const removePACOverride = useCallback((day: number) => {
    setDailyPACOverrides(prev => {
      const updated = { ...prev };
      delete updated[day];
      return updated;
    });
    setCurrentConfigId(null);
  }, []);

  // Funzione helper per ottenere informazioni su quando inizierà il primo pagamento PAC
  const getNextPACInfo = useCallback(() => {
    const { frequency, customDays } = config.pacConfig;
    let nextPACDay = 0;
    let description = '';

    switch (frequency) {
      case 'daily':
        nextPACDay = 1;
        description = 'Il primo versamento PAC avverrà dal giorno 1';
        break;
      case 'weekly':
        nextPACDay = 7;
        description = 'Il primo versamento PAC avverrà al giorno 7, poi ogni settimana';
        break;
      case 'monthly':
        nextPACDay = 30;
        description = 'Il primo versamento PAC avverrà al giorno 30, poi ogni mese';
        break;
      case 'custom':
        nextPACDay = customDays || 10;
        description = `Il primo versamento PAC avverrà al giorno ${nextPACDay}, poi ogni ${nextPACDay} giorni`;
        break;
    }

    return { nextPACDay, description };
  }, [config.pacConfig]);

  return {
    config,
    updateConfig,
    createNewConfiguration,
    investmentData: calculateInvestment,
    dailyReturns,
    updateDailyReturn,
    removeDailyReturn,
    exportToCSV,
    dailyPACOverrides,
    updatePACForDay,
    removePACOverride,
    currentConfigId,
    currentConfigName,
    savedConfigs,
    saveCurrentConfiguration,
    updateCurrentConfiguration,
    loadSavedConfiguration,
    deleteConfiguration,
    supabaseLoading,
    getNextPACInfo,

    summary: {
      finalCapital: calculateInvestment[calculateInvestment.length - 1]?.finalCapital || 0,
      totalInvested: config.initialCapital + (calculateInvestment[calculateInvestment.length - 1]?.totalPACInvested || 0),
      totalInterest: calculateInvestment[calculateInvestment.length - 1]?.totalInterest || 0,
      totalReturn: ((calculateInvestment[calculateInvestment.length - 1]?.finalCapital || 0) / 
                   (config.initialCapital + (calculateInvestment[calculateInvestment.length - 1]?.totalPACInvested || 0)) - 1) * 100 || 0
    }
  };
};
