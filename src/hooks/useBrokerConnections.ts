import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { BrokerConnection, BrokerName, SyncResult, TestConnectionResult } from '@/types/broker';

export const useBrokerConnections = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all broker connections for current user
  const { data: connections, isLoading, error, refetch } = useQuery({
    queryKey: ['broker-connections', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('broker_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BrokerConnection[];
    },
    enabled: !!user,
  });

  // Test connection
  const testConnection = async (connection: Partial<BrokerConnection>): Promise<TestConnectionResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('test-broker-connection', {
        body: {
          broker_name: connection.broker_name,
          api_key: connection.api_key,
          api_secret: connection.api_secret,
          api_passphrase: connection.api_passphrase,
        },
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Connection test failed',
      };
    }
  };

  // Save new connection with encrypted credentials via edge function
  const saveConnection = useMutation({
    mutationFn: async (connection: Partial<BrokerConnection>) => {
      if (!user) throw new Error('User not authenticated');

      // First test the connection
      const testResult = await testConnection(connection);
      if (!testResult.success) {
        throw new Error(testResult.error || 'Connection test failed');
      }

      // Save via edge function which handles encryption
      const { data, error } = await supabase.functions.invoke('save-broker-connection', {
        body: {
          broker_name: connection.broker_name,
          api_key: connection.api_key,
          api_secret: connection.api_secret,
          api_passphrase: connection.api_passphrase,
          auto_sync_enabled: connection.auto_sync_enabled ?? true,
          sync_frequency: connection.sync_frequency ?? 'daily',
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to save connection');
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broker-connections'] });
      toast.success('Broker collegato con successo!');
    },
    onError: (error: Error) => {
      toast.error('Errore nel collegamento', {
        description: error.message,
      });
    },
  });

  // Sync history from broker
  const syncHistory = useMutation({
    mutationFn: async (connectionId: string) => {
      const { data, error } = await supabase.functions.invoke('sync-broker-history', {
        body: { connection_id: connectionId },
      });

      if (error) throw error;
      return data as SyncResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['broker-connections'] });
      
      if (result.success) {
        toast.success(`✅ ${result.synced} operazioni sincronizzate`, {
          description: result.skipped > 0 ? `${result.skipped} già presenti` : undefined,
        });
      } else {
        toast.error('Errore durante la sincronizzazione', {
          description: result.error,
        });
      }
    },
    onError: (error: Error) => {
      toast.error('Errore di sincronizzazione', {
        description: error.message,
      });
    },
  });

  // Delete connection
  const deleteConnection = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('broker_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broker-connections'] });
      toast.success('Connessione rimossa');
    },
    onError: (error: Error) => {
      toast.error('Errore nella rimozione', {
        description: error.message,
      });
    },
  });

  // Update connection settings
  const updateConnection = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BrokerConnection> }) => {
      const { data, error } = await supabase
        .from('broker_connections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broker-connections'] });
      toast.success('Impostazioni aggiornate');
    },
    onError: (error: Error) => {
      toast.error('Errore nell\'aggiornamento', {
        description: error.message,
      });
    },
  });

  return {
    connections: connections || [],
    isLoading,
    error,
    saveConnection: saveConnection.mutate,
    isSaving: saveConnection.isPending,
    syncHistory: syncHistory.mutate,
    isSyncing: syncHistory.isPending,
    deleteConnection: deleteConnection.mutate,
    isDeleting: deleteConnection.isPending,
    updateConnection: updateConnection.mutate,
    isUpdating: updateConnection.isPending,
    refetch,
    testConnection,
  };
};
