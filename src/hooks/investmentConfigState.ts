
import { useState, useCallback } from 'react';
import { InvestmentConfig } from '@/types/investment';
import { Currency } from '@/lib/utils';
import { useConfigurationHistory } from './useConfigurationHistory';

// Stato di default configurazione investimento
export const getDefaultConfig = (): InvestmentConfig & { currency: Currency } => ({
  initialCapital: 1000,
  timeHorizon: 1000,
  dailyReturnRate: 0.2,
  currency: 'EUR' as Currency,
  pacConfig: {
    amount: 100,
    frequency: 'weekly',
    startDate: new Date(), // Sempre oggi
  }
});

export const useInvestmentConfigState = () => {
  const [config, setConfig] = useState<InvestmentConfig & { currency: Currency }>(getDefaultConfig());
  const [dailyReturns, setDailyReturns] = useState<{ [day: number]: number }>({});
  const [dailyPACOverrides, setDailyPACOverrides] = useState<{ [day: number]: number }>({});
  const [currentConfigId, setCurrentConfigId] = useState<string | null>(null);
  const [currentConfigName, setCurrentConfigName] = useState<string>('');

  const {
    saveToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    getCurrentSnapshot
  } = useConfigurationHistory();

  // Funzione per salvare automaticamente nello stack
  const saveConfigurationToHistory = useCallback((description: string) => {
    saveToHistory(config, dailyReturns, dailyPACOverrides, description);
  }, [config, dailyReturns, dailyPACOverrides, saveToHistory]);

  // Undo operation
  const undoConfiguration = useCallback(() => {
    const snapshot = undo();
    if (snapshot) {
      setConfig(snapshot.config);
      setDailyReturns(snapshot.dailyReturns);
      setDailyPACOverrides(snapshot.dailyPACOverrides);
      return snapshot;
    }
    return null;
  }, [undo]);

  // Redo operation
  const redoConfiguration = useCallback(() => {
    const snapshot = redo();
    if (snapshot) {
      setConfig(snapshot.config);
      setDailyReturns(snapshot.dailyReturns);
      setDailyPACOverrides(snapshot.dailyPACOverrides);
      return snapshot;
    }
    return null;
  }, [redo]);

  // Resetta completamente i dati personalizzati
  const resetCustomData = useCallback(() => {
    saveConfigurationToHistory('Reset dati personalizzati');
    setDailyReturns({});
    setDailyPACOverrides({});
  }, [saveConfigurationToHistory]);

  // Quando vuoi azzerare tutto e ripartire da 0
  const createNewConfiguration = useCallback(() => {
    saveConfigurationToHistory('Creazione nuova configurazione');
    resetCustomData();
    setCurrentConfigId(null);
    setCurrentConfigName('');
    setConfig({
      ...getDefaultConfig(),
      pacConfig: { ...getDefaultConfig().pacConfig, startDate: new Date() }, // startDate sempre oggi
    });
    clearHistory(); // Reset history when creating new configuration
  }, [resetCustomData, saveConfigurationToHistory, clearHistory]);

  return {
    configState: { config, dailyReturns, dailyPACOverrides, currentConfigId, currentConfigName },
    setConfig,
    setDailyReturns,
    setDailyPACOverrides,
    setCurrentConfigId,
    setCurrentConfigName,
    createNewConfiguration,
    resetCustomData,
    // History operations
    saveConfigurationToHistory,
    undoConfiguration,
    redoConfiguration,
    canUndo,
    canRedo,
    clearHistory,
    getCurrentSnapshot,
  };
};
