
import { useState, useCallback, useRef } from 'react';
import { SavedConfiguration } from '@/types/database';
import { useConfigSaver } from './supabase/configSaver';
import { useConfigUpdater } from './supabase/configUpdater';
import { useConfigLoader } from './supabase/configLoader';
import { useConfigDeleter } from './supabase/configDeleter';

export const useSupabaseConfig = () => {
  const [loading, setLoading] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<SavedConfiguration[]>([]);
  const loadingRef = useRef(false);

  const { saveConfiguration: saveConfig } = useConfigSaver();
  const { updateConfiguration: updateConfig } = useConfigUpdater();
  const { loadConfigurations: loadConfigs } = useConfigLoader();
  const { deleteConfiguration: deleteConfig } = useConfigDeleter();

  const saveConfiguration = useCallback(async (
    name: string,
    config: any,
    dailyReturns: { [day: number]: number },
    dailyPACOverrides: { [day: number]: number } = {}
  ): Promise<string | null> => {
    setLoading(true);
    try {
      const result = await saveConfig(name, config, dailyReturns, dailyPACOverrides);
      if (result) {
        await loadConfigurations();
      }
      return result;
    } finally {
      setLoading(false);
    }
  }, [saveConfig]);

  const updateConfiguration = useCallback(async (
    configId: string,
    name: string,
    config: any,
    dailyReturns: { [day: number]: number },
    dailyPACOverrides: { [day: number]: number } = {}
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await updateConfig(configId, name, config, dailyReturns, dailyPACOverrides);
      if (result) {
        await loadConfigurations();
      }
      return result;
    } finally {
      setLoading(false);
    }
  }, [updateConfig]);

  const loadConfigurations = useCallback(async (): Promise<void> => {
    // Prevent multiple simultaneous calls
    if (loadingRef.current) {
      console.log('🚫 LoadConfigurations già in corso, saltando chiamata duplicata');
      return;
    }
    
    loadingRef.current = true;
    setLoading(true);
    try {
      console.log('🔄 Caricamento configurazioni...');
      const configs = await loadConfigs();
      setSavedConfigs(configs);
      console.log('✅ Configurazioni caricate:', configs.length);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [loadConfigs]);

  const deleteConfiguration = useCallback(async (configId: string): Promise<void> => {
    setLoading(true);
    try {
      await deleteConfig(configId);
      setSavedConfigs(prev => prev.filter(config => config.id !== configId));
    } finally {
      setLoading(false);
    }
  }, [deleteConfig]);

  return {
    loading,
    savedConfigs,
    saveConfiguration,
    updateConfiguration,
    loadConfigurations,
    deleteConfiguration
  };
};
