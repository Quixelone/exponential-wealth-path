import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to load persisted configuration after saved configs are loaded
 * This ensures we restore the user's last selected strategy with DB fallback
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
      
      // Se savedConfigs è vuoto ma c'è un currentConfigId, aspetta e riprova più a lungo
      if (savedConfigs.length === 0 && retryCount < 5) {
        console.log('⏳ PersistedConfigLoader: savedConfigs empty, will retry...', { retryCount });
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 1000); // Aumentato timeout
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
        console.log('⚠️ PersistedConfigLoader: Config not in list, checking DB directly', {
          persistedConfigId: currentConfigId,
          savedConfigsCount: savedConfigs.length
        });
        
        // SAFETY: Before clearing, verify the strategy doesn't exist in DB
        // This prevents data loss from race conditions
        if (savedConfigs.length > 0) {
          supabase
            .from('investment_configs')
            .select('id')
            .eq('id', currentConfigId)
            .maybeSingle()
            .then(({ data, error }) => {
              if (error) {
                console.error('❌ PersistedConfigLoader: DB check failed', error);
                return;
              }
              
              if (data) {
                console.log('🔄 PersistedConfigLoader: Strategy exists in DB but not loaded, forcing reload');
                // Strategy exists but wasn't loaded - this is a bug, don't clear
                // User should use force reload button
              } else {
                console.log('🧹 PersistedConfigLoader: Strategy deleted from DB, clearing localStorage');
                // Strategy truly doesn't exist anymore, safe to clear
                setCurrentConfigId(null);
                setCurrentConfigName('');
              }
            });
        }
      }
    }
    
    // Se non c'è currentConfigId ma ci sono configurazioni salvate, carica la prima automaticamente
    if (
      !persistedConfigLoadAttempted.current &&
      !supabaseLoading &&
      !currentConfigId &&
      savedConfigs.length > 0
    ) {
      persistedConfigLoadAttempted.current = true;
      const firstConfig = savedConfigs[0];
      console.log('🔄 PersistedConfigLoader: No persisted config but configs exist, loading first one', {
        configId: firstConfig.id,
        configName: firstConfig.name
      });
      loadSavedConfiguration(firstConfig);
    }
    
    // Se non c'è currentConfigId e non ci sono configurazioni, marca come tentato
    if (
      !persistedConfigLoadAttempted.current &&
      !supabaseLoading &&
      !currentConfigId &&
      savedConfigs.length === 0
    ) {
      persistedConfigLoadAttempted.current = true;
      console.log('📝 PersistedConfigLoader: No persisted config and no saved configs, using default state');
    }
  }, [savedConfigs, currentConfigId, supabaseLoading, loadSavedConfiguration, setCurrentConfigId, setCurrentConfigName, retryCount]);

  return { persistedConfigLoadAttempted: persistedConfigLoadAttempted.current };
};