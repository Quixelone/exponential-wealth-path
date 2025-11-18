import React from 'react';
import { Wallet, TrendingUp, Target, Bitcoin } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import MetricCard from './MetricCard';
import { formatCurrency, Currency } from '@/lib/utils';
import { useBTCPrice } from '@/hooks/useBTCPrice';

interface MetricCardsGridProps {
  totalCapital: number;
  totalProfit: number;
  activeStrategies: number;
  currency?: Currency;
}

const MetricCardsGrid: React.FC<MetricCardsGridProps> = ({
  totalCapital,
  totalProfit,
  activeStrategies,
  currency = 'EUR',
}) => {
  // Get today's date for BTC price
  const today = new Date().toISOString().split('T')[0];
  const { price: btcPrice } = useBTCPrice(today);

  return (
    <Collapsible defaultOpen>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Portfolio Overview</h2>
        <CollapsibleTrigger className="hover:opacity-70 transition-opacity">
          <ChevronDown className="h-5 w-5" />
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
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
      </CollapsibleContent>
    </Collapsible>
  );
};

export default MetricCardsGrid;
