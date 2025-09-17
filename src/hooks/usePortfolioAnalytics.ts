import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { calculateInvestment } from './investmentCalculationUtils';
import { InvestmentConfig, PACConfig } from '@/types/investment';

export interface PortfolioStrategy {
  id: string;
  name: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  created_at: string;
  config: InvestmentConfig;
  currentBalance: number;
  investedCapital: number;
  currentPerformance: number;
  plannedPerformance: number;
  performanceVsPlan: number;
  activeDays: number;
  status: 'above' | 'inline' | 'below';
  realBalance?: number;
  realPerformance?: number;
}

export interface PortfolioSummary {
  totalCapital: number;
  totalInvested: number;
  averagePerformance: number;
  activeUsers: number;
  activeStrategies: number;
  topPerformers: PortfolioStrategy[];
  worstPerformers: PortfolioStrategy[];
}

export const usePortfolioAnalytics = () => {
  const [strategies, setStrategies] = useState<PortfolioStrategy[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      
      // Fetch investment configs with user data and related returns/overrides
      // Using inner join to ensure only configs with valid user profiles are returned
      const { data: configsData, error: configError } = await supabase
        .from('investment_configs')
        .select(`
          *,
          daily_returns (*),
          daily_pac_overrides (*),
          user_profiles!inner (
            id,
            email,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (configError) {
        console.error('Error fetching portfolio data:', configError);
        toast({
          title: "Errore",
          description: "Impossibile caricare i dati del portfolio",
          variant: "destructive",
        });
        return;
      }

      // Fetch actual trades separately
      const { data: actualTrades, error: tradesError } = await supabase
        .from('actual_trades')
        .select('*');

      if (tradesError) {
        console.error('Error fetching actual trades:', tradesError);
      }

      // Create trades lookup map
      const tradesMap = new Map();
      
      actualTrades?.forEach(trade => {
        if (!tradesMap.has(trade.config_id)) {
          tradesMap.set(trade.config_id, []);
        }
        tradesMap.get(trade.config_id).push(trade);
      });

      const processedStrategies: PortfolioStrategy[] = configsData?.map(configData => {
        // Build investment config
        const config: InvestmentConfig = {
          initialCapital: Number(configData.initial_capital),
          timeHorizon: configData.time_horizon,
          dailyReturnRate: Number(configData.daily_return_rate),
          currency: configData.currency as 'EUR' | 'USD' | 'USDT',
          pacConfig: {
            amount: Number(configData.pac_amount),
            frequency: configData.pac_frequency as 'daily' | 'weekly' | 'monthly' | 'custom',
            customDays: configData.pac_custom_days || undefined,
            startDate: new Date(configData.pac_start_date)
          },
          useRealBTCPrices: configData.use_real_btc_prices || false
        };

        // Build daily returns and PAC overrides
        const dailyReturns: { [day: number]: number } = {};
        configData.daily_returns?.forEach((dr: any) => {
          dailyReturns[dr.day] = Number(dr.return_rate);
        });

        const dailyPACOverrides: { [day: number]: number } = {};
        configData.daily_pac_overrides?.forEach((po: any) => {
          dailyPACOverrides[po.day] = Number(po.pac_amount);
        });

        // Calculate investment data
        const investmentData = calculateInvestment({
          config,
          dailyReturns,
          dailyPACOverrides
        });

        // Calculate current day
        const startDate = new Date(configData.pac_start_date);
        startDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - startDate.getTime();
        const activeDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
        const currentDayIndex = Math.min(activeDays, config.timeHorizon - 1);

        const currentData = investmentData[currentDayIndex] || investmentData[0];
        const currentBalance = currentData?.finalCapital || 0;
        const investedCapital = config.initialCapital + (currentData?.totalPACInvested || 0);
        const currentPerformance = investedCapital > 0 ? ((currentBalance / investedCapital - 1) * 100) : 0;
        
        // Calculate planned performance at current day
        const plannedPerformance = activeDays > 0 ? (config.dailyReturnRate * activeDays * 100) : 0;
        const performanceVsPlan = currentPerformance - plannedPerformance;

        // Determine status
        let status: 'above' | 'inline' | 'below' = 'inline';
        if (Math.abs(performanceVsPlan) > 5) {
          status = performanceVsPlan > 0 ? 'above' : 'below';
        }

        // Handle real data if available
        let realBalance: number | undefined;
        let realPerformance: number | undefined;
        
        const configTrades = tradesMap.get(configData.id) || [];
        if (configTrades.length > 0) {
          // Calculate real balance based on actual trades
          // This is a simplified calculation - in reality you'd need more complex logic
          const totalBTCAmount = configTrades.reduce((sum: number, trade: any) => 
            sum + Number(trade.btc_amount), 0);
          // For now, we'll use the theoretical balance as placeholder
          realBalance = currentBalance;
          realPerformance = currentPerformance;
        }

        // Get user profile from the joined data
        const userProfile = configData.user_profiles;

        return {
          id: configData.id,
          name: configData.name,
          user_id: configData.user_id,
          user_email: userProfile?.email || null,
          user_name: userProfile ? 
            `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || null : null,
          created_at: configData.created_at,
          config,
          currentBalance,
          investedCapital,
          currentPerformance,
          plannedPerformance,
          performanceVsPlan,
          activeDays,
          status,
          realBalance,
          realPerformance
        };
      }) || [];

      setStrategies(processedStrategies);

      // Calculate summary
      const totalCapital = processedStrategies.reduce((sum, s) => sum + s.currentBalance, 0);
      const totalInvested = processedStrategies.reduce((sum, s) => sum + s.investedCapital, 0);
      const averagePerformance = processedStrategies.length > 0 ? 
        processedStrategies.reduce((sum, s) => sum + s.currentPerformance, 0) / processedStrategies.length : 0;
      
      const activeUsers = new Set(processedStrategies.map(s => s.user_id)).size;
      
      const sortedByPerformance = [...processedStrategies].sort((a, b) => b.currentPerformance - a.currentPerformance);
      
      setSummary({
        totalCapital,
        totalInvested,
        averagePerformance,
        activeUsers,
        activeStrategies: processedStrategies.length,
        topPerformers: sortedByPerformance.slice(0, 5),
        worstPerformers: sortedByPerformance.slice(-5).reverse()
      });

    } catch (error) {
      console.error('Unexpected error fetching portfolio data:', error);
      toast({
        title: "Errore",
        description: "Errore imprevisto nel caricamento dei dati",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  return {
    strategies,
    summary,
    loading,
    refetch: fetchPortfolioData
  };
};