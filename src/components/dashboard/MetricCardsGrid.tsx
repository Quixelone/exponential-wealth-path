import React, { useMemo } from 'react';
import { Wallet, TrendingUp, Target, Bitcoin } from 'lucide-react';
import MetricCard from './MetricCard';
import { formatCurrency, Currency } from '@/lib/utils';
import { useBTCPrice } from '@/hooks/useBTCPrice';
import { LoadingState } from '@/components/ui/loading-state';

interface SummaryData {
  current: {
    finalCapital: number;
    totalInvested: number;
    totalInterest: number;
    totalReturn: number;
    day: number;
  };
  final: {
    finalCapital: number;
    totalInvested: number;
    totalInterest: number;
    totalReturn: number;
    day: number;
  };
}

interface MetricCardsGridProps {
  totalCapital?: number;
  totalProfit?: number;
  activeStrategies?: number;
  currency?: Currency;
  isLoading?: boolean;
  summary?: SummaryData;
  investmentDataLength?: number;
  isConfigurationReady?: boolean;
}

const MetricCardsGrid: React.FC<MetricCardsGridProps> = ({
  totalCapital = 0,
  totalProfit = 0,
  activeStrategies = 0,
  currency = 'EUR',
  isLoading = false,
  summary,
  investmentDataLength = 0,
  isConfigurationReady = true,
}) => {
  // Use yesterday's date to get actual BTC price (today's might not be available yet)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().split('T')[0];
  const { price: btcPrice } = useBTCPrice(yesterdayDate);

  // Calculate dynamic trends based on real data
  const trends = useMemo(() => {
    // Capital trend from current total return
    const capitalTrend = summary?.current.totalReturn 
      ? `${summary.current.totalReturn >= 0 ? '+' : ''}${summary.current.totalReturn.toFixed(1)}%`
      : '+0%';
    const capitalTrendType: 'positive' | 'negative' | 'neutral' = 
      summary?.current.totalReturn ? (summary.current.totalReturn > 0 ? 'positive' : summary.current.totalReturn < 0 ? 'negative' : 'neutral') : 'neutral';

    // Profit trend based on current vs final expected
    const profitProgress = summary?.final.totalInterest 
      ? ((summary.current.totalInterest / summary.final.totalInterest) * 100)
      : 0;
    const profitTrend = `${profitProgress.toFixed(0)}%`;
    const profitTrendType: 'positive' | 'negative' | 'neutral' = 
      profitProgress >= 50 ? 'positive' : profitProgress >= 30 ? 'neutral' : 'neutral';

    // Strategy progress - based on days completed
    const daysProgress = summary?.current.day && summary?.final.day
      ? Math.round((summary.current.day / summary.final.day) * 100)
      : 0;
    const strategyTrend = `${daysProgress}%`;

    // BTC trend - placeholder for now (would need historical data)
    const btcTrend = '+5%';
    const btcTrendType: 'positive' | 'negative' | 'neutral' = 'positive';

    return {
      capital: { value: capitalTrend, type: capitalTrendType },
      profit: { value: profitTrend, type: profitTrendType },
      strategy: { value: strategyTrend, type: 'neutral' as const },
      btc: { value: btcTrend, type: btcTrendType },
    };
  }, [summary]);

  // Mostra loading se la configurazione non è ancora pronta
  if (!isConfigurationReady || isLoading) {
    return <LoadingState message="Caricamento configurazione..." />;
  }

  const btcDate = yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 animate-fade-in">
      <MetricCard
        title="Total Capital"
        value={formatCurrency(totalCapital, currency)}
        subtitle="Current Portfolio Value"
        trend={trends.capital ? { value: parseFloat(trends.capital.value), type: trends.capital.type } : undefined}
        icon={Wallet}
        variant="capital"
        tooltipText="Total value of all your investments including returns"
        isLoading={isLoading}
      />
      <MetricCard
        title="Total Profit"
        value={formatCurrency(totalProfit, currency)}
        subtitle="Accumulated Returns"
        trend={trends.profit ? { value: parseFloat(trends.profit.value), type: trends.profit.type } : undefined}
        icon={TrendingUp}
        variant="profit"
        tooltipText="Total earnings from all your investment strategies"
        isLoading={isLoading}
      />
      <MetricCard
        title="Active Strategies"
        value={activeStrategies.toString()}
        subtitle="Investment Plans"
        trend={trends.strategy ? { value: parseFloat(trends.strategy.value), type: trends.strategy.type } : undefined}
        icon={Target}
        variant="strategy"
        tooltipText="Number of investment strategies currently running"
        isLoading={isLoading}
      />
      <MetricCard
        title="BTC Price"
        value={btcPrice ? `$${btcPrice.toLocaleString()}` : 'Loading...'}
        subtitle={`As of ${btcDate}`}
        trend={trends.btc ? { value: parseFloat(trends.btc.value), type: trends.btc.type } : undefined}
        icon={Bitcoin}
        variant="btc"
        tooltipText="Current Bitcoin market price in USD"
        isLoading={!btcPrice}
      />
    </div>
  );
};

export default MetricCardsGrid;
