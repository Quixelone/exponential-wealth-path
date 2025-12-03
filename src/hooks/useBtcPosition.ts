import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BtcPositionData {
  btc_quantity: number;
  avg_cost_basis_usd: number | null;
  last_fill_price_usd: number | null;
  last_fill_date: string | null;
  last_fill_type: string | null;
  total_premium_earned_usdt: number | null;
  total_trades_count: number | null;
  total_assignments_count: number | null;
}

async function fetchPosition(configId: string): Promise<BtcPositionData | null> {
  const { data, error } = await supabase
    .from('btc_positions')
    .select('*')
    .eq('config_id', configId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching position:', error);
    throw error;
  }

  return data;
}

export function useBtcPosition(configId: string, refreshInterval = 60000) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['btcPosition', configId],
    queryFn: () => fetchPosition(configId),
    refetchInterval: refreshInterval,
    staleTime: refreshInterval - 5000,
    enabled: !!configId,
  });

  const hasPosition = data && data.btc_quantity > 0;

  return {
    position: data,
    hasPosition,
    isLoading,
    error,
    refetch,
  };
}
