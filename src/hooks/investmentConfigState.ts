
import { useState, useCallback, useEffect } from 'react';
import { InvestmentConfig } from '@/types/investment';
import { Currency } from '@/lib/utils';
import { useConfigurationHistory } from './useConfigurationHistory';
import { clearActiveConfigState, STORAGE_KEYS } from '@/utils/userStateCleanup';

// Keys for localStorage persistence
const CURRENT_CONFIG_ID_KEY = 'investment_current_config_id';
const CURRENT_CONFIG_NAME_KEY = 'investment_current_config_name';

// Helper functions for localStorage
const getPersistedConfigId = (): string | null => {
  try {
    return localStorage.getItem(CURRENT_CONFIG_ID_KEY);
  } catch {
    return null;
  }
};

const getPersistedConfigName = (): string => {
  try {
    return localStorage.getItem(CURRENT_CONFIG_NAME_KEY) || '';
  } catch {
    return '';
  }
};

const persistConfigId = (configId: string | null) => {
  try {
    if (configId) {
      localStorage.setItem(CURRENT_CONFIG_ID_KEY, configId);
    } else {
      localStorage.removeItem(CURRENT_CONFIG_ID_KEY);
    }
  } catch {
    // Ignore localStorage errors
  }
};

const persistConfigName = (configName: string) => {
  try {
    if (configName) {
      localStorage.setItem(CURRENT_CONFIG_NAME_KEY, configName);
    } else {
      localStorage.removeItem(CURRENT_CONFIG_NAME_KEY);
    }
  } catch {
    // Ignore localStorage errors
  }
};

// Stato di default configurazione investimento
export const getDefaultConfig = (): InvestmentConfig & { currency: Currency } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalizza a 00:00:00 per evitare problemi di timezone
  
  return {
    initialCapital: 1000,
    timeHorizon: 1000,
    dailyReturnRate: 0.2,
    currency: 'EUR' as Currency,
    pacConfig: {
      amount: 100,
      frequency: 'weekly',
      startDate: today,
    }
  };
};

export const useInvestmentConfigState = () => {
  // Initialize with empty state first, will be populated based on persistence logic
  const [config, setConfig] = useState<InvestmentConfig & { currency: Currency }>(getDefaultConfig());
  const [dailyReturns, setDailyReturns] = useState<{ [day: number]: number }>({});
  const [dailyPACOverrides, setDailyPACOverrides] = useState<{ [day: number]: number }>({});
  
  // Initialize with persisted values
  const [currentConfigId, setCurrentConfigIdState] = useState<string | null>(() => getPersistedConfigId());
  const [currentConfigName, setCurrentConfigNameState] = useState<string>(() => getPersistedConfigName());

  // Enhanced setters that persist to localStorage
  const setCurrentConfigId = useCallback((configId: string | null) => {
    setCurrentConfigIdState(configId);
    persistConfigId(configId);
  }, []);

  const setCurrentConfigName = useCallback((configName: string) => {
    setCurrentConfigNameState(configName);
    persistConfigName(configName);
  }, []);

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
      // Ensure currency is always present when restoring from history
      const configWithCurrency = {
        ...snapshot.config,
        currency: snapshot.config.currency || 'EUR' as Currency
      };
      setConfig(configWithCurrency);
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
      // Ensure currency is always present when restoring from history
      const configWithCurrency = {
        ...snapshot.config,
        currency: snapshot.config.currency || 'EUR' as Currency
      };
      setConfig(configWithCurrency);
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
    console.log('🔄 investmentConfigState: Creating new configuration - clearing persistence');
    saveConfigurationToHistory('Creazione nuova configurazione');
    resetCustomData();
    setCurrentConfigId(null);
    setCurrentConfigName('');
    setConfig({
      ...getDefaultConfig(),
      pacConfig: { ...getDefaultConfig().pacConfig, startDate: getDefaultConfig().pacConfig.startDate }, // Usa la data normalizzata
    });
    clearHistory(); // Reset history when creating new configuration
  }, [resetCustomData, saveConfigurationToHistory, clearHistory, setCurrentConfigId, setCurrentConfigName]);

  // Funzione di emergenza per pulire lo stato corrotto
  const emergencyStateReset = useCallback((reason: string = 'State corruption detected') => {
    console.log('🚨 investmentConfigState: Emergency state reset', { reason });
    clearActiveConfigState(reason);
    setCurrentConfigId(null);
    setCurrentConfigName('');
    setConfig(getDefaultConfig());
    setDailyReturns({});
    setDailyPACOverrides({});
    clearHistory();
  }, [clearHistory, setCurrentConfigId, setCurrentConfigName]);

  return {
    configState: { config, dailyReturns, dailyPACOverrides, currentConfigId, currentConfigName },
    setConfig,
    setDailyReturns,
    setDailyPACOverrides,
    setCurrentConfigId,
    setCurrentConfigName,
    createNewConfiguration,
    resetCustomData,
    emergencyStateReset,
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
