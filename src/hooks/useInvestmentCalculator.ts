
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
  }, []);

  // Auto-load first configuration only once on initial app load
  React.useEffect(() => {
    if (
      !autoLoadAttempted.current && 
      !supabaseLoading && 
      savedConfigs.length > 0 && 
      !configState.currentConfigId
    ) {
      autoLoadAttempted.current = true;
      
      // Solo se non c'è una configurazione corrente, carica la prima
      const sortedConfigs = [...savedConfigs].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      if (sortedConfigs.length > 0) {
        const firstConfig = sortedConfigs[0];
        console.log('🚀 AUTO-LOADING INITIAL CONFIG:', firstConfig.name);
        loadSavedConfiguration(firstConfig);
      }
    }
  }, [savedConfigs, supabaseLoading, loadSavedConfiguration]);

  // Logging per debugging: monitora cambiamenti di currentConfigId
  React.useEffect(() => {
    console.log('📱 INVESTMENT CALCULATOR - currentConfigId changed to:', configState.currentConfigId);
  }, [configState.currentConfigId]);

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
