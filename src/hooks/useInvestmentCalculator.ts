
import React, { useRef } from 'react';
import { useConfigurationManager } from './useConfigurationManager';
import { useInvestmentData } from './useInvestmentData';
import { useInvestmentOperations } from './useInvestmentOperations';
import { usePersistedConfigLoader } from './usePersistedConfigLoader';
import { useAuth } from '@/contexts/AuthContext';

// Custom hook principale per usare il calcolatore d'investimento e tutte le sue API
export const useInvestmentCalculator = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    configState,
    setConfig,
    setDailyReturns,
    setDailyPACOverrides,
    setCurrentConfigId,
    setCurrentConfigName,
    createNewConfiguration,
    supabaseLoading,
    savedConfigs,
    loadConfigurations,
    deleteConfiguration,
    loadSavedConfiguration,
    hasUnsavedChanges,
    saveCurrentConfiguration,
    updateCurrentConfiguration,
    // History operations
    saveConfigurationToHistory,
    undoConfiguration,
    redoConfiguration,
    canUndo,
    canRedo,
    clearHistory,
    getCurrentSnapshot,
  } = useConfigurationManager();

  const loadInitialized = useRef(false);

  // Load configurations only once on mount, but wait for user authentication
  React.useEffect(() => {
    if (!loadInitialized.current && !authLoading && user) {
      loadInitialized.current = true;
      console.log('🔄 InvestmentCalculator: User authenticated, loading configurations');
      loadConfigurations();
    }
  }, [loadConfigurations, authLoading, user]);

  // Use the persisted config loader to restore user's last selected strategy
  const { persistedConfigLoadAttempted } = usePersistedConfigLoader({
    savedConfigs,
    currentConfigId: configState.currentConfigId,
    supabaseLoading,
    loadSavedConfiguration,
    setCurrentConfigId,
    setCurrentConfigName
  });

  // Log current state for debugging
  React.useEffect(() => {
    if (!supabaseLoading && savedConfigs.length > 0) {
      console.log('📊 InvestmentCalculator: Current state', {
        currentConfigId: configState.currentConfigId,
        currentConfigName: configState.currentConfigName,
        savedConfigsCount: savedConfigs.length,
        persistedConfigLoadAttempted,
        loadInitialized: loadInitialized.current
      });
    }
  }, [configState.currentConfigId, configState.currentConfigName, savedConfigs.length, supabaseLoading, persistedConfigLoadAttempted]);

  const { investmentData, currentDayIndex, nextPACInfo, summary } = useInvestmentData({
    config: configState.config,
    dailyReturns: configState.dailyReturns,
    dailyPACOverrides: configState.dailyPACOverrides
  });

  const {
    updateConfig,
    updateDailyReturn,
    updateDailyReturnDirect, // NEW: Direct update function
    removeDailyReturn,
    updatePACForDay,
    updatePACForDayDirect, // NEW: Direct update function
    removePACOverride,
    exportToCSV
  } = useInvestmentOperations({
    configState,
    setConfig,
    setDailyReturns,
    setDailyPACOverrides,
    setCurrentConfigId,
    investmentData,
    saveConfigurationToHistory
  });

  return {
    config: configState.config,
    updateConfig,
    createNewConfiguration,
    investmentData,
    dailyReturns: configState.dailyReturns,
    updateDailyReturn,
    updateDailyReturnDirect, // NEW: Direct update function
    removeDailyReturn,
    exportToCSV,
    dailyPACOverrides: configState.dailyPACOverrides,
    updatePACForDay,
    updatePACForDayDirect, // NEW: Direct update function
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
    summary,
    // History operations
    undoConfiguration,
    redoConfiguration,
    canUndo,
    canRedo,
    clearHistory,
    getCurrentSnapshot,
  };
};
