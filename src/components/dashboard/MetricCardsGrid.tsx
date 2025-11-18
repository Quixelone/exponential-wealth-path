import React from 'react';
import { Wallet, TrendingUp, Target, Bitcoin } from 'lucide-react';
import MetricCard from './MetricCard';
import { formatCurrency, Currency } from '@/lib/utils';
import { useBTCPrice } from '@/hooks/useBTCPrice';
import { LoadingState } from '@/components/ui/loading-state';

interface MetricCardsGridProps {
  totalCapital?: number;
  totalProfit?: number;
  activeStrategies?: number;
  currency?: Currency;
  isLoading?: boolean;
}

const MetricCardsGrid: React.FC<MetricCardsGridProps> = ({
  totalCapital = 0,
  totalProfit = 0,
  activeStrategies = 0,
  currency = 'EUR',
  isLoading = false,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const { price: btcPrice } = useBTCPrice(today);

  if (isLoading) {
    return <LoadingState message="Caricamento dashboard..." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Portfolio Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Capital"
          value={formatCurrency(totalCapital, currency)}
          subtitle="Invested"
          trend={{ value: '+22%', type: 'positive' }}
          icon={Wallet}
          iconBgClass="icon-container-primary"
        />

        <MetricCard
          title="Total Profit"
          value={formatCurrency(totalProfit, currency)}
          subtitle="YTD"
          trend={{ value: '+18%', type: 'positive' }}
          icon={TrendingUp}
          iconBgClass="icon-container-success"
        />

        <MetricCard
          title="Active Strategies"
          value={activeStrategies}
          subtitle="Running"
          trend={{ value: '-1', type: 'neutral' }}
          icon={Target}
          iconBgClass="icon-container-secondary"
        />

        <MetricCard
          title="BTC Price"
          value={btcPrice ? `$${btcPrice.toLocaleString()}` : 'Loading...'}
          trend={{ value: '+5%', type: 'positive' }}
          icon={Bitcoin}
          iconBgClass="icon-container-primary"
        />
      </div>
    </div>
  );
};

export default MetricCardsGrid;
