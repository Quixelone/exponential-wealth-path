
import { useState, useCallback, useRef } from 'react';
import { SavedConfiguration } from '@/types/database';
import { useConfigSaver } from './supabase/configSaver';
import { useConfigUpdater } from './supabase/configUpdater';
import { useConfigLoader } from './supabase/configLoader';
import { useConfigDeleter } from './supabase/configDeleter';

export const useSupabaseConfig = () => {
  const [loading, setLoading] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<SavedConfiguration[]>([]);
  const [error, setError] = useState<string | null>(null);
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
    console.log('🔄 useSupabaseConfig: Starting saveConfiguration', { name, configKeys: Object.keys(config) });
    setLoading(true);
    setError(null);
    try {
      const result = await saveConfig(name, config, dailyReturns, dailyPACOverrides);
      console.log('✅ useSupabaseConfig: Save successful', { result });
      if (result) {
        console.log('✅ useSupabaseConfig: Configuration saved, reloading configurations list only');
        // Ricarica tutte le configurazioni dopo il salvataggio per aggiornare la lista
        await loadConfigurations();
      }
      return result;
    } catch (err) {
      console.error('❌ useSupabaseConfig: Save failed', err);
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio');
      throw err;
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
    console.log('🔄 useSupabaseConfig: Starting updateConfiguration', { configId, name });
    setLoading(true);
    setError(null);
    try {
      const result = await updateConfig(configId, name, config, dailyReturns, dailyPACOverrides);
      console.log('✅ useSupabaseConfig: Update successful', { result });
      if (result) {
        console.log('✅ useSupabaseConfig: Configuration updated, reloading configurations list only');
        // Ricarica tutte le configurazioni dopo l'aggiornamento per aggiornare la lista
        await loadConfigurations();
      }
      return result;
    } catch (err) {
      console.error('❌ useSupabaseConfig: Update failed', err);
      setError(err instanceof Error ? err.message : 'Errore durante l\'aggiornamento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateConfig]);

  const loadConfigurations = useCallback(async (): Promise<void> => {
    // Prevent multiple simultaneous calls with a more robust check
    if (loadingRef.current) {
      console.log('⚠️ useSupabaseConfig: Load already in progress, skipping');
      return;
    }
    
    console.log('🔄 useSupabaseConfig: Starting loadConfigurations');
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const configs = await loadConfigs();
      console.log('✅ useSupabaseConfig: Configurations loaded', { 
        count: configs.length, 
        configIds: configs.map(c => c.id) 
      });
      setSavedConfigs(configs);
    } catch (err) {
      console.error('❌ useSupabaseConfig: Load failed', err);
      setError(err instanceof Error ? err.message : 'Errore durante il caricamento');
      setSavedConfigs([]); // Reset to empty array on error
    } finally {
      console.log('🏁 useSupabaseConfig: Load completed, resetting flags');
      setLoading(false);
      loadingRef.current = false;
    }
  }, [loadConfigs]);

  const deleteConfiguration = useCallback(async (configId: string): Promise<void> => {
    console.log('🔄 useSupabaseConfig: Starting deleteConfiguration', { configId });
    setLoading(true);
    setError(null);
    try {
      await deleteConfig(configId);
      console.log('✅ useSupabaseConfig: Delete successful, updating local state');
      setSavedConfigs(prev => prev.filter(config => config.id !== configId));
    } catch (err) {
      console.error('❌ useSupabaseConfig: Delete failed', err);
      setError(err instanceof Error ? err.message : 'Errore durante l\'eliminazione');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [deleteConfig]);

  return {
    loading,
    error,
    savedConfigs,
    saveConfiguration,
    updateConfiguration,
    loadConfigurations,
    deleteConfiguration
  };
};
