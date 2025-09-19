import { useEffect, useRef, useState } from 'react';

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
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Only attempt to load persisted config once, after savedConfigs are loaded
    if (
      !persistedConfigLoadAttempted.current &&
      !supabaseLoading &&
      currentConfigId
    ) {
      console.log('🔍 PersistedConfigLoader: Attempting to find persisted config', {
        persistedConfigId: currentConfigId,
        savedConfigsCount: savedConfigs.length,
        availableConfigs: savedConfigs.map(c => ({ id: c.id, name: c.name })),
        retryCount
      });
      
      // Se savedConfigs è vuoto ma c'è un currentConfigId, aspetta un po' e riprova
      if (savedConfigs.length === 0 && retryCount < 3) {
        console.log('⏳ PersistedConfigLoader: savedConfigs empty, will retry...', { retryCount });
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 500);
        return;
      }
      
      persistedConfigLoadAttempted.current = true;
      
      // Find the persisted configuration in the saved configs
      const persistedConfig = savedConfigs.find(config => config.id === currentConfigId);
      
      if (persistedConfig) {
        console.log('✅ PersistedConfigLoader: Restoring persisted configuration', {
          configId: currentConfigId,
          configName: persistedConfig.name
        });
        
        // Load the persisted configuration
        loadSavedConfiguration(persistedConfig);
      } else {
        console.log('⚠️ PersistedConfigLoader: Persisted config not found, clearing persistence', {
          persistedConfigId: currentConfigId,
          availableConfigs: savedConfigs.map(c => ({ id: c.id, name: c.name })),
          reason: 'Configuration may have been deleted',
          savedConfigsCount: savedConfigs.length
        });
        
        // Only clear if we're sure savedConfigs is populated
        if (savedConfigs.length > 0) {
          // Persisted config no longer exists, clear it and reset to default state
          setCurrentConfigId(null);
          setCurrentConfigName('');
          console.log('🧹 PersistedConfigLoader: Cleared orphaned configuration reference');
        }
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
  }, [savedConfigs, currentConfigId, supabaseLoading, loadSavedConfiguration, setCurrentConfigId, setCurrentConfigName, retryCount]);

  return { persistedConfigLoadAttempted: persistedConfigLoadAttempted.current };
};