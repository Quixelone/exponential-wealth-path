
import { useCallback } from 'react';
import { InvestmentConfig } from '@/types/investment';

interface UseInvestmentOperationsProps {
  configState: {
    config: InvestmentConfig;
    dailyReturns: { [day: number]: number };
    dailyPACOverrides: { [day: number]: number };
    currentConfigId: string | null;
    currentConfigName: string;
  };
  setConfig: (config: InvestmentConfig | ((prev: InvestmentConfig) => InvestmentConfig)) => void;
  setDailyReturns: (returns: { [day: number]: number } | ((prev: { [day: number]: number }) => { [day: number]: number })) => void;
  setDailyPACOverrides: (overrides: { [day: number]: number } | ((prev: { [day: number]: number }) => { [day: number]: number })) => void;
  setCurrentConfigId: (id: string | null) => void;
  investmentData: any[];
  saveConfigurationToHistory: (description: string) => void;
  updateCurrentConfiguration?: (
    configId: string, 
    name: string, 
    config: InvestmentConfig,
    dailyReturns: { [day: number]: number },
    dailyPACOverrides: { [day: number]: number }
  ) => Promise<void>;
  saveCurrentConfiguration?: (name: string) => Promise<void>;
}

export const useInvestmentOperations = ({
  configState,
  setConfig,
  setDailyReturns,
  setDailyPACOverrides,
  setCurrentConfigId,
  investmentData,
  saveConfigurationToHistory,
  updateCurrentConfiguration,
  saveCurrentConfiguration
}: UseInvestmentOperationsProps) => {
  
  // Auto-save helper function - accepts updated data directly to avoid race conditions
  const autoSave = useCallback(async (
    updatedDailyReturns: { [day: number]: number },
    updatedDailyPACOverrides: { [day: number]: number }
  ) => {
    if (configState.currentConfigId && configState.currentConfigName && updateCurrentConfiguration) {
      // Pass the updated data directly, not from configState
      await updateCurrentConfiguration(
        configState.currentConfigId, 
        configState.currentConfigName,
        configState.config,
        updatedDailyReturns,
        updatedDailyPACOverrides
      );
    }
  }, [configState.currentConfigId, configState.currentConfigName, configState.config, updateCurrentConfiguration]);
  
  const updateConfig = useCallback((newConfig: Partial<InvestmentConfig>, reset: boolean = false) => {
    // Save to history before making changes
    const description = getConfigUpdateDescription(newConfig);
    saveConfigurationToHistory(description);
    
    // Ensure currency is always defined when updating
    const configWithCurrency = {
      ...newConfig,
      currency: newConfig.currency || configState.config.currency || 'EUR'
    };
    
    setConfig(prev => ({ ...prev, ...configWithCurrency }));
    
    // No longer automatically mark as unsaved - user controls when to save
    
    if (
      reset ||
      newConfig.initialCapital !== undefined ||
      newConfig.timeHorizon !== undefined ||
      newConfig.pacConfig?.frequency !== undefined
    ) {
      setDailyReturns({});
      setDailyPACOverrides({});
    }
  }, [setConfig, setDailyReturns, setDailyPACOverrides, setCurrentConfigId, configState.currentConfigId, saveConfigurationToHistory]);

  const updateDailyReturn = useCallback(async (day: number, returnRate: number) => {
    saveConfigurationToHistory(`Modifica rendimento giorno ${day}: ${returnRate}%`);
    
    // 1. Calculate new data BEFORE updating state
    const newDailyReturns = {
      ...configState.dailyReturns,
      [day]: returnRate
    };
    
    // 2. Update React state
    setDailyReturns(newDailyReturns);
    
    // 3. Auto-save with calculated data (not stale state)
    await autoSave(newDailyReturns, configState.dailyPACOverrides);
  }, [setDailyReturns, saveConfigurationToHistory, autoSave, configState.dailyReturns, configState.dailyPACOverrides]);

  const removeDailyReturn = useCallback(async (day: number) => {
    saveConfigurationToHistory(`Rimozione rendimento personalizzato giorno ${day}`);
    
    // 1. Calculate new data
    const newDailyReturns = { ...configState.dailyReturns };
    delete newDailyReturns[day];
    
    // 2. Update React state
    setDailyReturns(newDailyReturns);
    
    // 3. Auto-save with calculated data
    await autoSave(newDailyReturns, configState.dailyPACOverrides);
  }, [setDailyReturns, saveConfigurationToHistory, autoSave, configState.dailyReturns, configState.dailyPACOverrides]);

  const updatePACForDay = useCallback(async (day: number, pacAmount: number | null) => {
    let newDailyPACOverrides: { [day: number]: number };
    
    if (pacAmount === null) {
      // Remove the PAC override
      saveConfigurationToHistory(`Rimozione PAC personalizzato giorno ${day}`);
      
      // 1. Calculate new data
      newDailyPACOverrides = { ...configState.dailyPACOverrides };
      delete newDailyPACOverrides[day];
      
      // 2. Update React state
      setDailyPACOverrides(newDailyPACOverrides);
    } else {
      // Update or add PAC override
      saveConfigurationToHistory(`Modifica PAC giorno ${day}: €${pacAmount}`);
      
      // 1. Calculate new data
      newDailyPACOverrides = {
        ...configState.dailyPACOverrides,
        [day]: pacAmount
      };
      
      // 2. Update React state
      setDailyPACOverrides(newDailyPACOverrides);
    }
    
    // 3. Auto-save with calculated data
    await autoSave(configState.dailyReturns, newDailyPACOverrides);
  }, [setDailyPACOverrides, saveConfigurationToHistory, autoSave, configState.dailyReturns, configState.dailyPACOverrides]);

  const removePACOverride = useCallback(async (day: number) => {
    saveConfigurationToHistory(`Rimozione PAC personalizzato giorno ${day}`);
    
    // 1. Calculate new data
    const newDailyPACOverrides = { ...configState.dailyPACOverrides };
    delete newDailyPACOverrides[day];
    
    // 2. Update React state
    setDailyPACOverrides(newDailyPACOverrides);
    
    // 3. Auto-save with calculated data
    await autoSave(configState.dailyReturns, newDailyPACOverrides);
  }, [setDailyPACOverrides, saveConfigurationToHistory, autoSave, configState.dailyReturns, configState.dailyPACOverrides]);

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

  // Helper function to generate meaningful descriptions for config updates
  const getConfigUpdateDescription = (newConfig: Partial<InvestmentConfig>): string => {
    if (newConfig.initialCapital !== undefined) {
      return `Modifica capitale iniziale: €${newConfig.initialCapital}`;
    }
    if (newConfig.timeHorizon !== undefined) {
      return `Modifica orizzonte temporale: ${newConfig.timeHorizon} giorni`;
    }
    if (newConfig.dailyReturnRate !== undefined) {
      return `Modifica tasso rendimento: ${newConfig.dailyReturnRate}%`;
    }
    if (newConfig.pacConfig !== undefined) {
      return `Modifica configurazione PAC`;
    }
    if (newConfig.currency !== undefined) {
      return `Modifica valuta: ${newConfig.currency}`;
    }
    return 'Modifica configurazione generale';
  };

  return {
    updateConfig,
    updateDailyReturn,
    removeDailyReturn,
    updatePACForDay,
    removePACOverride,
    exportToCSV
  };
};
