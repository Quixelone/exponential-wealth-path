import { TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import { formatCurrency } from '@/utils/currency';

export const IncomeCard = () => {
  const { config, summary } = useInvestmentCalculator();

  const totalGain = summary.current.finalCapital - summary.current.totalInvested;
  const percentageChange = summary.current.totalInvested > 0 
    ? (totalGain / summary.current.totalInvested) * 100 
    : 0;
  const isPositive = percentageChange >= 0;

  return (
    <div className="modern-card-gradient relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-4 right-4 opacity-20">
        <TrendingUp size={80} />
      </div>

      {/* Card Number */}
      <div className="text-white/70 text-sm mb-4 relative z-10">
        💳 **** **** **** {totalGain > 0 ? Math.floor(Math.random() * 9000 + 1000) : '0000'}
      </div>

      {/* Title */}
      <div className="text-white/90 text-sm mb-2 relative z-10">
        Il Tuo Capitale
      </div>

      {/* Value */}
      <div className="text-white text-4xl font-bold mb-3 relative z-10">
        {formatCurrency(summary.current.finalCapital, config.currency)}
      </div>

      {/* Change Badge */}
      <div className="flex items-center gap-2 relative z-10">
        <Badge className="bg-white/20 text-white hover:bg-white/30">
          {isPositive ? '+' : ''}{percentageChange.toFixed(2)}%
        </Badge>
        <span className="text-white/70 text-xs">
          vs capitale iniziale
        </span>
      </div>

      {/* Decorative Gradient Orb */}
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
    </div>
  );
};
