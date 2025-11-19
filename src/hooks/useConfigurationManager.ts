
import React, { useCallback, useMemo } from 'react';
import { useSupabaseConfig } from '@/hooks/useSupabaseConfig';
import { useInvestmentConfigState } from './investmentConfigState';

/**
 * Deep comparison function that handles:
 * - null/undefined normalization
 * - Key ordering in objects
 * - Nested objects and arrays
 * - Floating point numbers
 */
const deepEqual = (a: any, b: any): boolean => {
  // Handle null/undefined
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  
  // Handle primitives
  if (typeof a !== 'object') return a === b;
  
  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => deepEqual(val, b[idx]));
  }
  
  // Handle objects
  const keysA = Object.keys(a).sort();
  const keysB = Object.keys(b).sort();
  
  if (keysA.length !== keysB.length) return false;
  if (!keysA.every((key, idx) => key === keysB[idx])) return false;
  
  return keysA.every(key => deepEqual(a[key], b[key]));
};

/**
 * Normalizes configuration data for comparison
 * - Converts null/undefined dailyPACOverrides to {}
 * - Normalizes pacConfig.startDate to string format
 * - Ensures consistent data structure
 */
const normalizeConfigForComparison = (
  config: any, 
  dailyReturns: { [day: number]: number }, 
  dailyPACOverrides: { [day: number]: number } | null | undefined
) => {
  // Normalize dailyPACOverrides: null/undefined → {}
  const normalizedPACOverrides = dailyPACOverrides || {};
  
  // Normalize dailyReturns: ensure consistent structure
  const normalizedDailyReturns = { ...dailyReturns };
  
  // Normalize pacConfig.startDate to string format
  const normalizedConfig = {
    ...config,
    pacConfig: {
      ...config.pacConfig,
      startDate: (typeof config.pacConfig.startDate === "string"
        ? config.pacConfig.startDate
        : config.pacConfig.startDate.toISOString().split('T')[0])
    },
  };
  
  return {
    config: normalizedConfig,
    dailyReturns: normalizedDailyReturns,
    dailyPACOverrides: normalizedPACOverrides,
  };
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
    // Save current state to history before loading new configuration
    saveConfigurationToHistory(`Caricamento configurazione: ${savedConfig.name}`);
    
    // Ensure currency is always present when loading
    const configWithCurrency = {
      ...savedConfig.config,
      currency: savedConfig.config.currency || 'EUR'
    };
    
    // Set all configuration data atomically - persistence is handled automatically
    setConfig(configWithCurrency);
    setDailyReturns(savedConfig.dailyReturns);
    setDailyPACOverrides(savedConfig.dailyPACOverrides || {});
    setCurrentConfigId(savedConfig.id);
    setCurrentConfigName(savedConfig.name);
  }, [setConfig, setDailyReturns, setDailyPACOverrides, setCurrentConfigId, setCurrentConfigName, saveConfigurationToHistory]);

  // Determina configurazione "salvata" attuale
  const savedConfig = React.useMemo(() =>
    configState.currentConfigId
      ? savedConfigs.find(c => c.id === configState.currentConfigId)
      : null,
    [savedConfigs, configState.currentConfigId]
  );

  // Enhanced unsaved changes detection with normalization
  const hasUnsavedChanges = React.useMemo(() => {
    if (!savedConfig) {
      // Se non c'è una configurazione salvata corrente, controlla se ci sono dati personalizzati
      const hasCustomReturns = Object.keys(configState.dailyReturns).length > 0;
      const hasCustomPAC = Object.keys(configState.dailyPACOverrides || {}).length > 0;
      const hasNonDefaultConfig = 
        configState.config.initialCapital !== 1000 ||
        configState.config.timeHorizon !== 365 ||
        configState.config.dailyReturnRate !== 0.1 ||
        configState.config.pacConfig.amount !== 100;
      
      return hasCustomReturns || hasCustomPAC || hasNonDefaultConfig;
    }
    
    // Normalize BOTH states before comparison
    const stateToCompare = normalizeConfigForComparison(
      configState.config,
      configState.dailyReturns,
      configState.dailyPACOverrides
    );
    
    const savedToCompare = normalizeConfigForComparison(
      savedConfig.config,
      savedConfig.dailyReturns,
      savedConfig.dailyPACOverrides
    );
    
    const isEqual = deepEqual(stateToCompare, savedToCompare);
    
    // TEMPORARY DEBUG LOGGING (rimuovere dopo verifica)
    if (!isEqual) {
      console.log('🔍 hasUnsavedChanges: States differ', {
        configEqual: deepEqual(stateToCompare.config, savedToCompare.config),
        returnsEqual: deepEqual(stateToCompare.dailyReturns, savedToCompare.dailyReturns),
        pacEqual: deepEqual(stateToCompare.dailyPACOverrides, savedToCompare.dailyPACOverrides),
        stateReturnKeys: Object.keys(stateToCompare.dailyReturns).length,
        savedReturnKeys: Object.keys(savedToCompare.dailyReturns).length,
        statePACKeys: Object.keys(stateToCompare.dailyPACOverrides).length,
        savedPACKeys: Object.keys(savedToCompare.dailyPACOverrides).length,
      });
    } else {
      console.log('✅ hasUnsavedChanges: States are equal');
    }
    
    return !isEqual;
  }, [configState.config, configState.dailyReturns, configState.dailyPACOverrides, savedConfig]);

  const saveCurrentConfiguration = useCallback(async (name: string) => {
    console.log('🔄 ConfigurationManager: Saving configuration', { name, hasCurrentId: !!configState.currentConfigId });
    const configId = await saveConfiguration(name, configState.config, configState.dailyReturns, configState.dailyPACOverrides);
    if (configId) {
      console.log('✅ ConfigurationManager: Configuration saved, persisting to localStorage', { configId, name });
      setCurrentConfigId(configId); // This will persist to localStorage
      setCurrentConfigName(name); // This will persist to localStorage
      saveConfigurationToHistory(`Salvataggio configurazione: ${name}`);
    } else {
      console.error('❌ ConfigurationManager: Save failed - no ID returned');
    }
  }, [saveConfiguration, configState.config, configState.dailyReturns, configState.dailyPACOverrides, setCurrentConfigId, setCurrentConfigName, saveConfigurationToHistory]);

  const updateCurrentConfiguration = useCallback(async (
    configId: string, 
    name: string,
    config = configState.config,
    dailyReturns = configState.dailyReturns,
    dailyPACOverrides = configState.dailyPACOverrides
  ) => {
    console.log('🔄 ConfigurationManager: Updating configuration', { configId, name });
    const success = await updateConfiguration(configId, name, config, dailyReturns, dailyPACOverrides);
    if (success) {
      console.log('✅ ConfigurationManager: Configuration updated, persisting to localStorage', { configId, name });
      // Ensure we maintain the current config context and persist it
      setCurrentConfigId(configId); // This will persist to localStorage
      setCurrentConfigName(name); // This will persist to localStorage
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
