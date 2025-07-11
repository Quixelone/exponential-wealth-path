
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

  // Load saved configuration with enhanced persistence tracking
  const loadSavedConfiguration = useCallback((savedConfig: any) => {
    console.log('🔄 ConfigurationManager: Loading saved configuration', { 
      configId: savedConfig.id, 
      name: savedConfig.name,
      currentConfigId: configState.currentConfigId,
      source: 'user_selection'
    });
    
    // Save current state to history before loading new configuration
    saveConfigurationToHistory(`Caricamento configurazione: ${savedConfig.name}`);
    
    // Set all configuration data atomically
    setConfig(savedConfig.config);
    setDailyReturns(savedConfig.dailyReturns);
    setDailyPACOverrides(savedConfig.dailyPACOverrides || {});
    setCurrentConfigId(savedConfig.id);
    setCurrentConfigName(savedConfig.name);
    
    console.log('✅ ConfigurationManager: Configuration loaded and persisted', { 
      newConfigId: savedConfig.id, 
      newName: savedConfig.name,
      source: 'user_selection'
    });
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
    console.log('🔄 ConfigurationManager: Saving configuration', { name, hasCurrentId: !!configState.currentConfigId });
    const configId = await saveConfiguration(name, configState.config, configState.dailyReturns, configState.dailyPACOverrides);
    if (configId) {
      console.log('✅ ConfigurationManager: Configuration saved, setting current ID', { configId, name });
      setCurrentConfigId(configId);
      setCurrentConfigName(name);
      saveConfigurationToHistory(`Salvataggio configurazione: ${name}`);
    } else {
      console.error('❌ ConfigurationManager: Save failed - no ID returned');
    }
  }, [saveConfiguration, configState.config, configState.dailyReturns, configState.dailyPACOverrides, setCurrentConfigId, setCurrentConfigName, saveConfigurationToHistory]);

  const updateCurrentConfiguration = useCallback(async (configId: string, name: string) => {
    console.log('🔄 ConfigurationManager: Updating configuration', { configId, name });
    const success = await updateConfiguration(configId, name, configState.config, configState.dailyReturns, configState.dailyPACOverrides);
    if (success) {
      console.log('✅ ConfigurationManager: Configuration updated, preserving current ID', { configId, name });
      // Ensure we maintain the current config context
      setCurrentConfigId(configId);
      setCurrentConfigName(name);
      saveConfigurationToHistory(`Aggiornamento configurazione: ${name}`);
    } else {
      console.error('❌ ConfigurationManager: Update failed');
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
