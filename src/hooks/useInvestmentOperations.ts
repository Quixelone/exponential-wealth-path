
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
  updateCurrentConfiguration?: (configId: string, name: string) => Promise<void>;
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
  
  // Auto-save helper function
  const autoSave = useCallback(async () => {
    if (configState.currentConfigId && configState.currentConfigName && updateCurrentConfiguration) {
      await updateCurrentConfiguration(configState.currentConfigId, configState.currentConfigName);
    }
  }, [configState.currentConfigId, configState.currentConfigName, updateCurrentConfiguration]);
  
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
    
    setDailyReturns(prev => ({
      ...prev,
      [day]: returnRate
    }));
    
    // Auto-save if configuration exists
    await autoSave();
  }, [setDailyReturns, saveConfigurationToHistory, autoSave]);

  const removeDailyReturn = useCallback(async (day: number) => {
    saveConfigurationToHistory(`Rimozione rendimento personalizzato giorno ${day}`);
    
    setDailyReturns(prev => {
      const newReturns = { ...prev };
      delete newReturns[day];
      return newReturns;
    });
    
    // Auto-save if configuration exists
    await autoSave();
  }, [setDailyReturns, saveConfigurationToHistory, autoSave]);

  const updatePACForDay = useCallback(async (day: number, pacAmount: number | null) => {
    if (pacAmount === null) {
      // Remove the PAC override
      saveConfigurationToHistory(`Rimozione PAC personalizzato giorno ${day}`);
      
      setDailyPACOverrides(prev => {
        const updated = { ...prev };
        delete updated[day];
        return updated;
      });
    } else {
      // Update or add PAC override
      saveConfigurationToHistory(`Modifica PAC giorno ${day}: €${pacAmount}`);
      
      setDailyPACOverrides(prev => {
        const updated = {
          ...prev,
          [day]: pacAmount
        };
        return updated;
      });
    }
    
    // Auto-save if configuration exists
    await autoSave();
  }, [setDailyPACOverrides, saveConfigurationToHistory, autoSave]);

  const removePACOverride = useCallback(async (day: number) => {
    saveConfigurationToHistory(`Rimozione PAC personalizzato giorno ${day}`);
    
    setDailyPACOverrides(prev => {
      const updated = { ...prev };
      delete updated[day];
      return updated;
    });
    
    // Auto-save if configuration exists
    await autoSave();
  }, [setDailyPACOverrides, saveConfigurationToHistory, autoSave]);

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
