
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
    console.log('🔄 Iniziando salvataggio configurazione:', name);
    try {
      const result = await saveConfig(name, config, dailyReturns, dailyPACOverrides);
      if (result) {
        console.log('✅ Configurazione salvata con ID:', result);
        await loadConfigurations();
        console.log('✅ Configurazioni ricaricate dopo il salvataggio');
      }
      return result;
    } catch (error) {
      console.error('❌ Errore durante il salvataggio della configurazione:', error);
      return null;
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
    console.log('🔄 Iniziando aggiornamento configurazione:', configId, name);
    try {
      const result = await updateConfig(configId, name, config, dailyReturns, dailyPACOverrides);
      if (result) {
        console.log('✅ Configurazione aggiornata con successo');
        await loadConfigurations();
        console.log('✅ Configurazioni ricaricate dopo l\'aggiornamento');
        )
      }
      return result;
    } catch (error) {
      console.error('❌ Errore durante l\'aggiornamento della configurazione:', error);
      )
      return false;
    } finally {
      setLoading(false);
    }
  }, [updateConfig]);

  const loadConfigurations = useCallback(async (): Promise<void> => {
    // Prevent multiple simultaneous calls with a more robust check
    if (loadingRef.current) {
      console.log('⚠️ Caricamento configurazioni già in corso, ignorato');
      return;
    }
    
    console.log('🔄 Iniziando caricamento configurazioni');
    loadingRef.current = true;
    setLoading(true);
    
    try {
      const configs = await loadConfigs();
      console.log(`✅ Caricate ${configs.length} configurazioni`);
      setSavedConfigs(configs);
    } catch (error) {
      console.error('❌ Errore durante il caricamento delle configurazioni:', error);
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
