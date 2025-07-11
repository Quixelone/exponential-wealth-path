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
      savedConfigs.length > 0 &&
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
          availableConfigs: savedConfigs.map(c => ({ id: c.id, name: c.name }))
        });
        
        // Persisted config no longer exists, clear it
        setCurrentConfigId(null);
        setCurrentConfigName('');
      }
    }
  }, [savedConfigs, currentConfigId, supabaseLoading, loadSavedConfiguration, setCurrentConfigId, setCurrentConfigName]);

  return { persistedConfigLoadAttempted: persistedConfigLoadAttempted.current };
};