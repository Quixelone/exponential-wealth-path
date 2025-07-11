
import React, { useRef } from 'react';
import { useConfigurationManager } from './useConfigurationManager';
import { useInvestmentData } from './useInvestmentData';
import { useInvestmentOperations } from './useInvestmentOperations';

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
  const autoLoadAttempted = useRef(false);

  // Load configurations only once on mount
  React.useEffect(() => {
    if (!loadInitialized.current) {
      loadInitialized.current = true;
      loadConfigurations();
    }
  }, [loadConfigurations]);

  // Auto-load ONLY on first app usage when user has no configurations and no current config
  React.useEffect(() => {
    if (
      !autoLoadAttempted.current && 
      !supabaseLoading && 
      savedConfigs.length > 0 && 
      !configState.currentConfigId &&
      loadInitialized.current &&
      // VERY restrictive auto-load: only if ALL configs are unnamed/default
      savedConfigs.every(config => !config.name || config.name === 'Configurazione senza nome')
    ) {
      autoLoadAttempted.current = true;
      
      console.log('🔄 InvestmentCalculator: Auto-loading first configuration (first time user only)', {
        configCount: savedConfigs.length,
        hasCurrentConfig: !!configState.currentConfigId
      });
      const firstConfig = savedConfigs[0];
      loadSavedConfiguration(firstConfig);
    } else if (configState.currentConfigId) {
      console.log('🔄 InvestmentCalculator: Skipping auto-load - user has current config', {
        currentConfigId: configState.currentConfigId,
        currentConfigName: configState.currentConfigName
      });
    }
  }, [savedConfigs, supabaseLoading, configState.currentConfigId, configState.currentConfigName, loadSavedConfiguration]);

  const { investmentData, currentDayIndex, nextPACInfo, summary } = useInvestmentData({
    config: configState.config,
    dailyReturns: configState.dailyReturns,
    dailyPACOverrides: configState.dailyPACOverrides
  });

  const {
    updateConfig,
    updateDailyReturn,
    removeDailyReturn,
    updatePACForDay,
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
