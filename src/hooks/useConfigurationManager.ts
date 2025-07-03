
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

  // Flags per gestire il caricamento con LOCK robusto
  const [isLoadingConfig, setIsLoadingConfig] = React.useState(false);
  const [manuallyLoaded, setManuallyLoaded] = React.useState(false);
  const [lockAutoChanges, setLockAutoChanges] = React.useState(false);

  // CARICAMENTO CONFIGURAZIONE DEFINITIVO - SEMPLIFICATO E DIRETTO
  const loadSavedConfiguration = useCallback((savedConfig: any) => {
    console.log('🚀 CARICAMENTO CONFIGURAZIONE DEFINITIVO:', savedConfig.name);
    console.log('📊 CONFIGURAZIONE DA CARICARE:');
    console.log('  - Nome:', savedConfig.name);
    console.log('  - ID:', savedConfig.id);
    console.log('  - Capitale:', savedConfig.config.initialCapital);
    console.log('  - Orizzonte temporale:', savedConfig.config.timeHorizon);
    console.log('  - Rendimento:', savedConfig.config.dailyReturnRate);
    console.log('  - PAC amount:', savedConfig.config.pacConfig?.amount);
    
    // CARICAMENTO DIRETTO SENZA INTERFERENZE
    setConfig(savedConfig.config);
    setDailyReturns(savedConfig.dailyReturns || {});
    setDailyPACOverrides(savedConfig.dailyPACOverrides || {});
    setCurrentConfigId(savedConfig.id);
    setCurrentConfigName(savedConfig.name);
    
    console.log('✅ CONFIGURAZIONE CARICATA CON SUCCESSO');
    console.log('📈 STATO AGGIORNATO:');
    console.log('  - currentConfigId impostato:', savedConfig.id);
    console.log('  - currentConfigName impostato:', savedConfig.name);
    
  }, [setConfig, setDailyReturns, setDailyPACOverrides, setCurrentConfigId, setCurrentConfigName]);

  // Effect per monitorare i cambiamenti di currentConfigId
  React.useEffect(() => {
    console.log('🔄 currentConfigId cambiato:', configState.currentConfigId);
  }, [configState.currentConfigId]);

  // Determina configurazione "salvata" attuale
  const savedConfig = React.useMemo(() =>
    configState.currentConfigId
      ? savedConfigs.find(c => c.id === configState.currentConfigId)
      : null,
    [savedConfigs, configState.currentConfigId]
  );

  // DISABILITATO - hasUnsavedChanges rimosso per consentire caricamento fluido
  const hasUnsavedChanges = false;

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
