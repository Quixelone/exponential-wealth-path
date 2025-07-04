
import React, { useCallback, useMemo } from 'react';
import { useSupabaseConfig } from '@/hooks/useSupabaseConfig';
import { useInvestmentConfigState } from './investmentConfigState';

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

  const loadSavedConfiguration = useCallback((savedConfig: any) => {
    try {
      console.log('🚀 CARICAMENTO CONFIGURAZIONE:', savedConfig.name);
      
      // Assicuriamoci che la configurazione abbia tutti i campi necessari
      const configToLoad = {
        ...savedConfig.config,
        pacConfig: {
          ...savedConfig.config.pacConfig,
          // Assicuriamoci che startDate sia un oggetto Date
          startDate: savedConfig.config.pacConfig.startDate instanceof Date 
            ? savedConfig.config.pacConfig.startDate 
            : new Date(savedConfig.config.pacConfig.startDate)
        }
      };
      
      // Caricamento in sequenza per evitare problemi di stato
      setConfig(configToLoad);
      setDailyReturns(savedConfig.dailyReturns || {});
      setDailyPACOverrides(savedConfig.dailyPACOverrides || {});
      setCurrentConfigId(savedConfig.id);
      setCurrentConfigName(savedConfig.name);
      
      // Salva nella cronologia
      saveConfigurationToHistory(`Caricamento configurazione: ${savedConfig.name}`);
      
      console.log('✅ Configurazione caricata con successo:', savedConfig.name);
      return true;
    } catch (error) {
      console.error('❌ Errore nel caricamento della configurazione:', error);
      return false;
    }
  }, [setConfig, setDailyReturns, setDailyPACOverrides, setCurrentConfigId, setCurrentConfigName, saveConfigurationToHistory]);

  const savedConfig = React.useMemo(() =>
    configState.currentConfigId
      ? savedConfigs.find(c => c.id === configState.currentConfigId)
      : null,
    [savedConfigs, configState.currentConfigId]
  );

  // Riattivato il controllo delle modifiche non salvate
  const hasUnsavedChanges = useMemo(() => {
    if (!configState.currentConfigId) return false;
    
    const currentSavedConfig = savedConfigs.find(c => c.id === configState.currentConfigId);
    if (!currentSavedConfig) return false;
    
    // Confronta configurazione attuale con quella salvata
    const configChanged = JSON.stringify(configState.config) !== JSON.stringify(currentSavedConfig.config);
    const returnsChanged = JSON.stringify(configState.dailyReturns) !== JSON.stringify(currentSavedConfig.dailyReturns);
    const pacOverridesChanged = JSON.stringify(configState.dailyPACOverrides) !== JSON.stringify(currentSavedConfig.dailyPACOverrides);
    
    return configChanged || returnsChanged || pacOverridesChanged;
  }, [configState, savedConfigs]);

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
      // Ricarica le configurazioni per aggiornare la lista
      await loadConfigurations();
      saveConfigurationToHistory(`Aggiornamento configurazione: ${name}`);
    }
  }, [updateConfiguration, configState.config, configState.dailyReturns, configState.dailyPACOverrides, setCurrentConfigId, setCurrentConfigName, saveConfigurationToHistory, loadConfigurations]);

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
