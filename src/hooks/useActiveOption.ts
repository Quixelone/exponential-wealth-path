import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ActiveOptionData {
  id: string;
  option_type: 'SELL_PUT' | 'COVERED_CALL';
  strike_price_usd: number;
  expiration_date: string;
  duration_days: number;
  capital_employed_usdt: number;
  premium_usdt: number;
  premium_percentage: number;
  apy_equivalent: number | null;
  status: string;
  opened_at: string;
}

async function fetchActiveOption(configId: string): Promise<ActiveOptionData | null> {
  const { data, error } = await supabase
    .from('options_trades')
    .select('*')
    .eq('config_id', configId)
    .in('status', ['OPEN', 'PENDING_CONFIRMATION'])
    .order('opened_at', { ascending: false })
    .maybeSingle();

  if (error) {
    console.error('Error fetching active option:', error);
    throw error;
  }

  return data as ActiveOptionData | null;
}

export function useActiveOption(configId: string, refreshInterval = 60000) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['activeOption', configId],
    queryFn: () => fetchActiveOption(configId),
    refetchInterval: refreshInterval,
    staleTime: refreshInterval - 5000,
    enabled: !!configId,
  });

  return {
    option: data,
    hasActiveOption: !!data && data.status === 'OPEN',
    needsConfirmation: !!data && data.status === 'PENDING_CONFIRMATION',
    isLoading,
    error,
    refetch,
  };
}
