
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
  const [currentConfigId, setCurrentConfigId] = useState<string | null>(null);
  const [currentConfigName, setCurrentConfigName] = useState<string>('');

  const {
    loading: supabaseLoading,
    savedConfigs,
    saveConfiguration,
    loadConfigurations,
    deleteConfiguration
  } = useSupabaseConfig();

  // Caricare le configurazioni salvate all'avvio
  useEffect(() => {
    loadConfigurations();
  }, [loadConfigurations]);

  const isPACDay = useCallback((day: number, pacConfig: PACConfig): boolean => {
    switch (pacConfig.frequency) {
      case 'daily':
        return true;
      case 'weekly':
        return day % 7 === 0;
      case 'monthly':
        return day % 30 === 0;
      case 'custom':
        return pacConfig.customDays ? day % pacConfig.customDays === 0 : false;
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
      
      // Aggiungi PAC se è il giorno giusto
      const pacAmount = isPACDay(day, config.pacConfig) ? config.pacConfig.amount : 0;
      currentCapital += pacAmount;
      totalPACInvested += pacAmount;

      const capitalAfterPAC = currentCapital;

      // Applica il rendimento giornaliero (custom o standard)
      const dailyReturn = dailyReturns[day] ?? config.dailyReturnRate;
      const isCustomReturn = dailyReturns.hasOwnProperty(day);
      const interestGained = currentCapital * (dailyReturn / 100);
      currentCapital += interestGained;

      const totalInterest = currentCapital - config.initialCapital - totalPACInvested;

      results.push({
        day,
        date: currentDate.toISOString().split('T')[0],
        capitalBeforePAC,
        pacAmount,
        capitalAfterPAC,
        dailyReturn,
        finalCapital: currentCapital,
        totalPACInvested,
        totalInterest,
        isCustomReturn
      });
    }

    return results;
  }, [config, dailyReturns, isPACDay]);

  const updateConfig = useCallback((newConfig: Partial<InvestmentConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    setCurrentConfigId(null); // Indica che la configurazione è stata modificata
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

  const loadSavedConfiguration = useCallback((savedConfig: any) => {
    setConfig(savedConfig.config);
    setDailyReturns(savedConfig.dailyReturns);
    setCurrentConfigId(savedConfig.id);
    setCurrentConfigName(savedConfig.name);
  }, []);

  const exportToCSV = useCallback(() => {
    const csvContent = [
      ['Giorno', 'Data', 'Capitale Iniziale', 'PAC', 'Capitale Post-PAC', 'Rendimento %', 'Custom', 'Capitale Finale', 'PAC Totale', 'Interessi'],
      ...calculateInvestment.map(row => [
        row.day,
        row.date,
        row.capitalBeforePAC.toFixed(2),
        row.pacAmount.toFixed(2),
        row.capitalAfterPAC.toFixed(2),
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

  return {
    config,
    updateConfig,
    investmentData: calculateInvestment,
    dailyReturns,
    updateDailyReturn,
    removeDailyReturn,
    exportToCSV,
    
    // Nuove funzionalità del database
    currentConfigId,
    currentConfigName,
    savedConfigs,
    saveCurrentConfiguration,
    loadSavedConfiguration,
    deleteConfiguration,
    supabaseLoading,
    
    summary: {
      finalCapital: calculateInvestment[calculateInvestment.length - 1]?.finalCapital || 0,
      totalInvested: config.initialCapital + calculateInvestment[calculateInvestment.length - 1]?.totalPACInvested || 0,
      totalInterest: calculateInvestment[calculateInvestment.length - 1]?.totalInterest || 0,
      totalReturn: ((calculateInvestment[calculateInvestment.length - 1]?.finalCapital || 0) / (config.initialCapital + (calculateInvestment[calculateInvestment.length - 1]?.totalPACInvested || 0)) - 1) * 100
    }
  };
};
