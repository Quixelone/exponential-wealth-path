
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

  // Load configurations only once on mount - NO AUTO-LOADING
  React.useEffect(() => {
    if (!loadInitialized.current) {
      loadInitialized.current = true;
      loadConfigurations();
    }
  }, []);

  // LOGGING DETTAGLIATO per tracciare tutti i cambiamenti
  React.useEffect(() => {
    console.log('🚨 INVESTMENT CALCULATOR - currentConfigId CAMBIO DETECTATO:', configState.currentConfigId);
    console.log('📱 STATO COMPLETO CONFIG:');
    console.log('  - currentConfigId:', configState.currentConfigId);
    console.log('  - currentConfigName:', configState.currentConfigName);
    console.log('  - initialCapital:', configState.config.initialCapital);
    console.log('  - timeHorizon:', configState.config.timeHorizon); 
    console.log('  - pacAmount:', configState.config.pacConfig.amount);
  }, [configState.currentConfigId, configState.currentConfigName, configState.config]);

  // MONITORING completo dello stato per detectare interferenze
  React.useEffect(() => {
    console.log('📊 CONFIG STATE MONITORING:');
    console.log('  - Capital:', configState.config.initialCapital);
    console.log('  - Name:', configState.currentConfigName);
    console.log('  - ID:', configState.currentConfigId);
    console.log('  - PAC Amount:', configState.config.pacConfig.amount);
  }, [configState.config.initialCapital, configState.currentConfigName, configState.currentConfigId]);

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
    setCurrentConfigName,
    investmentData,
    saveConfigurationToHistory
  });

  return {
    config: configState.config,
    updateConfig,
    setConfig,
    setDailyReturns,
    setDailyPACOverrides,
    setCurrentConfigName,
    setConfig,
    setDailyReturns,
    setDailyPACOverrides,
    setCurrentConfigName,
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
