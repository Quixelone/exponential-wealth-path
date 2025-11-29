import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminStrategyData {
  id: string;
  name: string;
  user_id: string;
  initial_capital: number;
  time_horizon: number;
  daily_return_rate: number;
  currency: string;
  created_at: string;
  updated_at: string;
  user_email: string;
  user_first_name: string | null;
  user_last_name: string | null;
}

export const useAdminStrategies = () => {
  const [strategies, setStrategies] = useState<AdminStrategyData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStrategies = async () => {
    setLoading(true);
    try {
      // Fetch all investment configs with user data
      const { data: configsData, error: configsError } = await supabase
        .from('investment_configs')
        .select('*')
        .order('updated_at', { ascending: false });

      if (configsError) throw configsError;

      // Fetch user profiles for all users
      const userIds = [...new Set(configsData.map((c) => c.user_id))];
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('id, email, first_name, last_name')
        .in('id', userIds);

      if (usersError) throw usersError;

      // Create a map of user data
      const usersMap = new Map(usersData.map((u) => [u.id, u]));

      // Merge configs with user data
      const strategiesWithUsers: AdminStrategyData[] = configsData.map((config) => {
        const user = usersMap.get(config.user_id);
        return {
          id: config.id,
          name: config.name,
          user_id: config.user_id,
          initial_capital: Number(config.initial_capital),
          time_horizon: config.time_horizon,
          daily_return_rate: Number(config.daily_return_rate),
          currency: config.currency,
          created_at: config.created_at,
          updated_at: config.updated_at,
          user_email: user?.email || 'N/A',
          user_first_name: user?.first_name || null,
          user_last_name: user?.last_name || null,
        };
      });

      setStrategies(strategiesWithUsers);
    } catch (error: any) {
      console.error('Error fetching admin strategies:', error);
      toast({
        title: 'Errore nel caricamento',
        description: 'Impossibile caricare le strategie degli utenti',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategies();
  }, []);

  return { strategies, loading, refetch: fetchStrategies };
};
