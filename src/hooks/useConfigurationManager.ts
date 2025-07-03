
import React, { useCallback, useMemo } from 'react';
import { useSupabaseConfig } from '@/hooks/useSupabaseConfig';
import { useInvestmentConfigState } from './investmentConfigState';

// funzione di deep compare (shallow per oggetti semplici)
const deepEqual = (a: any, b: any): boolean => {
  return JSON.stringify(a) === JSON.stringify(b);
};

export const useConfigurationManager = () => {
  const {
    configState,
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
  } = useInvestmentConfigState();

  const {
    loading: supabaseLoading,
    savedConfigs,
    saveConfiguration,
    updateConfiguration,
    loadConfigurations,
    deleteConfiguration
  } = useSupabaseConfig();

  // Move loadSavedConfiguration function definition before it's used
  const loadSavedConfiguration = useCallback((savedConfig: any) => {
    console.log('🔄 LOADING CONFIGURATION:', savedConfig.name);
    console.log('📊 Configurazione da caricare:', savedConfig);
    console.log('💰 Capitale iniziale da caricare:', savedConfig.config.initialCapital);
    console.log('🆔 Config ID corrente PRIMA del caricamento:', configState.currentConfigId);
    
    // Save current state to history before loading new configuration
    saveConfigurationToHistory(`Caricamento configurazione: ${savedConfig.name}`);
    
    // Load configuration data
    setConfig(savedConfig.config);
    setDailyReturns(savedConfig.dailyReturns);
    setDailyPACOverrides(savedConfig.dailyPACOverrides || {});
    
    // Update current config info - CRITICO: questo deve essere sincrono
    setCurrentConfigId(savedConfig.id);
    setCurrentConfigName(savedConfig.name);
    
    console.log('✅ CONFIGURAZIONE CARICATA - Nome:', savedConfig.name);
    console.log('✅ CONFIGURAZIONE CARICATA - Capitale:', savedConfig.config.initialCapital);
    console.log('✅ CONFIGURAZIONE CARICATA - ID:', savedConfig.id);
    
    // Verifica che l'ID sia stato aggiornato
    setTimeout(() => {
      console.log('🔍 VERIFICA: ID corrente dopo caricamento:', configState.currentConfigId);
    }, 100);
  }, [setConfig, setDailyReturns, setDailyPACOverrides, setCurrentConfigId, setCurrentConfigName, saveConfigurationToHistory, configState.currentConfigId]);

  // Determina configurazione "salvata" attuale
  const savedConfig = React.useMemo(() =>
    configState.currentConfigId
      ? savedConfigs.find(c => c.id === configState.currentConfigId)
      : null,
    [savedConfigs, configState.currentConfigId]
  );

  // Enhanced unsaved changes detection
  const hasUnsavedChanges = React.useMemo(() => {
    if (!savedConfig) {
      // Se non c'è una configurazione salvata corrente, controlla se ci sono dati personalizzati
      const hasCustomReturns = Object.keys(configState.dailyReturns).length > 0;
      const hasCustomPAC = Object.keys(configState.dailyPACOverrides).length > 0;
      const hasNonDefaultConfig = 
        configState.config.initialCapital !== 1000 ||
        configState.config.timeHorizon !== 365 ||
        configState.config.dailyReturnRate !== 0.1 ||
        configState.config.pacConfig.amount !== 100;
      
      return hasCustomReturns || hasCustomPAC || hasNonDefaultConfig;
    }
    
    const stateToCompare = {
      config: {
        ...configState.config,
        pacConfig: {
          ...configState.config.pacConfig,
          startDate: (typeof configState.config.pacConfig.startDate === "string"
            ? configState.config.pacConfig.startDate
            : configState.config.pacConfig.startDate.toISOString().split('T')[0])
        },
      },
      dailyReturns: configState.dailyReturns,
      dailyPACOverrides: configState.dailyPACOverrides,
    };
    const savedToCompare = {
      config: {
        ...savedConfig.config,
        pacConfig: {
          ...savedConfig.config.pacConfig,
          startDate: (typeof savedConfig.config.pacConfig.startDate === "string"
            ? savedConfig.config.pacConfig.startDate
            : savedConfig.config.pacConfig.startDate.toISOString().split('T')[0])
        },
      },
      dailyReturns: savedConfig.dailyReturns,
      dailyPACOverrides: savedConfig.dailyPACOverrides || {},
    };
    return !deepEqual(stateToCompare, savedToCompare);
  }, [configState.config, configState.dailyReturns, configState.dailyPACOverrides, savedConfig]);

  const saveCurrentConfiguration = useCallback(async (name: string) => {
    const configId = await saveConfiguration(name, configState.config, configState.dailyReturns, configState.dailyPACOverrides);
    if (configId) {
      setCurrentConfigId(configId);
      setCurrentConfigName(name);
      saveConfigurationToHistory(`Salvataggio configurazione: ${name}`);
    }
  }, [saveConfiguration, configState.config, configState.dailyReturns, configState.dailyPACOverrides, setCurrentConfigId, setCurrentConfigName, saveConfigurationToHistory]);

  const updateCurrentConfiguration = useCallback(async (configId: string, name: string) => {
    const success = await updateConfiguration(configId, name, configState.config, configState.dailyReturns, configState.dailyPACOverrides);
    if (success) {
      setCurrentConfigId(configId);
      setCurrentConfigName(name);
      saveConfigurationToHistory(`Aggiornamento configurazione: ${name}`);
    }
  }, [updateConfiguration, configState.config, configState.dailyReturns, configState.dailyPACOverrides, setCurrentConfigId, setCurrentConfigName, saveConfigurationToHistory]);

  return {
    configState,
    setConfig,
    setDailyReturns,
    setDailyPACOverrides,
    setCurrentConfigId,
    setCurrentConfigName,
    createNewConfiguration,
    resetCustomData,
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
  };
};
