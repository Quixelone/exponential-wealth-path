import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InvestmentConfig } from '@/types/investment';
import { ActualTrade } from '@/types/investment';

interface DailyReturn {
  day: number;
  return_rate: number;
}

interface DailyPACOverride {
  day: number;
  pac_amount: number;
}

interface StrategyDetail {
  config: InvestmentConfig;
  dailyReturns: Map<number, number>;
  dailyPACOverrides: Map<number, number>;
  actualTrades: ActualTrade[];
  lastModified: string;
  createdAt: string;
  userName: string;
  userEmail: string;
}

export const useUserStrategyDetail = (configId: string | null, userId: string | null) => {
  const [strategyDetail, setStrategyDetail] = useState<StrategyDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!configId || !userId) {
      setStrategyDetail(null);
      return;
    }

    const loadStrategyDetail = async () => {
      setLoading(true);
      try {
        // Load configuration
        const { data: configData, error: configError } = await supabase
          .from('investment_configs')
          .select('*')
          .eq('id', configId)
          .eq('user_id', userId)
          .single();

        if (configError) throw configError;

        // Load user profile
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, email')
          .eq('id', userId)
          .single();

        if (userError) throw userError;

        // Load daily returns
        const { data: returnsData, error: returnsError } = await supabase
          .from('daily_returns')
          .select('*')
          .eq('config_id', configId);

        if (returnsError) throw returnsError;

        // Load PAC overrides
        const { data: pacData, error: pacError } = await supabase
          .from('daily_pac_overrides')
          .select('*')
          .eq('config_id', configId);

        if (pacError) throw pacError;

        // Load actual trades
        const { data: tradesData, error: tradesError } = await supabase
          .from('actual_trades')
          .select('*')
          .eq('config_id', configId)
          .order('trade_date', { ascending: true });

        if (tradesError) throw tradesError;

        // Transform data
        const dailyReturnsMap = new Map<number, number>(
          (returnsData || []).map((r: DailyReturn) => [r.day, r.return_rate])
        );

        const dailyPACOverridesMap = new Map<number, number>(
          (pacData || []).map((p: DailyPACOverride) => [p.day, p.pac_amount])
        );

        const config: InvestmentConfig = {
          initialCapital: Number(configData.initial_capital),
          timeHorizon: configData.time_horizon,
          dailyReturnRate: Number(configData.daily_return_rate),
          currency: configData.currency as 'EUR' | 'USD' | 'USDT',
          pacConfig: {
            amount: Number(configData.pac_amount),
            frequency: configData.pac_frequency as 'daily' | 'weekly' | 'monthly' | 'custom',
            startDate: new Date(configData.pac_start_date),
            customDays: configData.pac_custom_days || undefined,
          },
          useRealBTCPrices: configData.use_real_btc_prices || false,
        };

        const actualTrades: ActualTrade[] = (tradesData || []).map((trade: any) => ({
          id: trade.id,
          config_id: trade.config_id,
          day: trade.day,
          trade_date: trade.trade_date,
          btc_amount: Number(trade.btc_amount),
          fill_price_usd: Number(trade.fill_price_usd),
          trade_type: trade.trade_type,
          notes: trade.notes,
          created_at: trade.created_at,
          updated_at: trade.updated_at,
        }));

        setStrategyDetail({
          config,
          dailyReturns: dailyReturnsMap,
          dailyPACOverrides: dailyPACOverridesMap,
          actualTrades,
          lastModified: configData.updated_at,
          createdAt: configData.created_at,
          userName: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Utente',
          userEmail: userData.email || '',
        });
      } catch (error: any) {
        console.error('Error loading strategy detail:', error);
        toast({
          title: 'Errore nel caricamento',
          description: 'Impossibile caricare i dettagli della strategia',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadStrategyDetail();
  }, [configId, userId, toast]);

  return { strategyDetail, loading };
};
