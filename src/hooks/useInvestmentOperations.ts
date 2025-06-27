
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
}

export const useInvestmentOperations = ({
  configState,
  setConfig,
  setDailyReturns,
  setDailyPACOverrides,
  setCurrentConfigId,
  investmentData
}: UseInvestmentOperationsProps) => {
  
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

  return {
    updateConfig,
    updateDailyReturn,
    removeDailyReturn,
    updatePACForDay,
    removePACOverride,
    exportToCSV
  };
};
