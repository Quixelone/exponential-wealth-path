import { useEffect, useRef } from 'react';

/**
 * Hook to load persisted configuration after saved configs are loaded
 * This ensures we restore the user's last selected strategy
 */
export const usePersistedConfigLoader = ({
  savedConfigs,
  currentConfigId,
  supabaseLoading,
  loadSavedConfiguration,
  setCurrentConfigId,
  setCurrentConfigName
}: {
  savedConfigs: any[];
  currentConfigId: string | null;
  supabaseLoading: boolean;
  loadSavedConfiguration: (config: any) => void;
  setCurrentConfigId: (id: string | null) => void;
  setCurrentConfigName: (name: string) => void;
}) => {
  const persistedConfigLoadAttempted = useRef(false);

  useEffect(() => {
    // Only attempt to load persisted config once, after savedConfigs are loaded
    if (
      !persistedConfigLoadAttempted.current &&
      !supabaseLoading &&
      savedConfigs.length >= 0 && // Cambiato da > 0 per gestire anche il caso di nessuna configurazione
      currentConfigId
    ) {
      persistedConfigLoadAttempted.current = true;
      
      // Find the persisted configuration in the saved configs
      const persistedConfig = savedConfigs.find(config => config.id === currentConfigId);
      
      if (persistedConfig) {
        console.log('🔄 PersistedConfigLoader: Restoring persisted configuration', {
          configId: currentConfigId,
          configName: persistedConfig.name
        });
        
        // Load the persisted configuration
        loadSavedConfiguration(persistedConfig);
      } else {
        console.log('⚠️ PersistedConfigLoader: Persisted config not found, clearing persistence', {
          persistedConfigId: currentConfigId,
          availableConfigs: savedConfigs.map(c => ({ id: c.id, name: c.name })),
          reason: 'Configuration may have been deleted'
        });
        
        // Persisted config no longer exists, clear it and reset to default state
        setCurrentConfigId(null);
        setCurrentConfigName('');
        
        // Log per debugging del problema specifico
        console.log('🧹 PersistedConfigLoader: Cleared orphaned configuration reference');
      }
    }
    
    // Anche quando non c'è currentConfigId ma il loading è finito, marca come tentato
    if (
      !persistedConfigLoadAttempted.current &&
      !supabaseLoading &&
      !currentConfigId
    ) {
      persistedConfigLoadAttempted.current = true;
      console.log('📝 PersistedConfigLoader: No persisted config found, using default state');
    }
  }, [savedConfigs, currentConfigId, supabaseLoading, loadSavedConfiguration, setCurrentConfigId, setCurrentConfigName]);

  return { persistedConfigLoadAttempted: persistedConfigLoadAttempted.current };
};