
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

  // DEFINITIVE loadSavedConfiguration with COMPLETE LOCK SYSTEM
  const loadSavedConfiguration = useCallback((savedConfig: any) => {
    if (isLoadingConfig) {
      console.log('⚠️ CARICAMENTO GIA IN CORSO - Ignoro richiesta per:', savedConfig.name);
      return;
    }

    console.log('🔒 BLOCCO COMPLETO ATTIVATO - Iniziando caricamento manuale:', savedConfig.name);
    console.log('📊 STATO PRIMA DEL CARICAMENTO:');
    console.log('  - currentConfigId:', configState.currentConfigId);
    console.log('  - currentConfigName:', configState.currentConfigName);
    console.log('  - manuallyLoaded:', manuallyLoaded);
    
    // ATTIVA TUTTI I LOCK
    setIsLoadingConfig(true);
    setManuallyLoaded(true);
    setLockAutoChanges(true);
    
    // Save current state to history before loading new configuration
    saveConfigurationToHistory(`Caricamento configurazione: ${savedConfig.name}`);
    
    // CARICAMENTO CONFIGURAZIONE MANUALE CON LOGGING COMPLETO
    console.log('🔄 APPLICANDO CONFIGURAZIONE:', savedConfig.name);
    console.log('  - Capitale da caricare:', savedConfig.config.initialCapital);
    console.log('  - ID da impostare:', savedConfig.id);
    
    setConfig(savedConfig.config);
    setDailyReturns(savedConfig.dailyReturns);
    setDailyPACOverrides(savedConfig.dailyPACOverrides || {});
    setCurrentConfigId(savedConfig.id);
    setCurrentConfigName(savedConfig.name);
    
    console.log('✅ CONFIGURAZIONE APPLICATA - Verificando stato:');
    console.log('  - Nome caricato:', savedConfig.name);
    console.log('  - ID caricato:', savedConfig.id);
    console.log('  - Capitale caricato:', savedConfig.config.initialCapital);
    
    // MANTIENI LOCK ATTIVO per evitare interferenze
    setIsLoadingConfig(false);
    
    // Mantieni il lock per un breve periodo per bloccare interferenze
    setTimeout(() => {
      console.log('🔓 RILASCIO LOCK - Configurazione dovrebbe essere stabile');
      console.log('📊 STATO FINALE:');
      console.log('  - currentConfigId finale:', savedConfig.id);
      console.log('  - currentConfigName finale:', savedConfig.name);
    }, 500);
    
  }, [setConfig, setDailyReturns, setDailyPACOverrides, setCurrentConfigId, setCurrentConfigName, saveConfigurationToHistory]);

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
