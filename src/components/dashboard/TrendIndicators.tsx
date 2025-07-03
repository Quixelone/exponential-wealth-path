import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrencyWhole, Currency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TrendData {
  period: string;
  value: number;
  percentage: number;
  trend: 'up' | 'down' | 'neutral';
}

interface TrendIndicatorsProps {
  trends: TrendData[];
  currency: Currency;
  className?: string;
}

const TrendIndicators: React.FC<TrendIndicatorsProps> = ({
  trends,
  currency,
  className
}) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-slate-500';
    }
  };

  const getTrendBg = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'bg-green-50 border-green-200';
      case 'down':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
      {trends.map((trend, index) => {
        const Icon = getTrendIcon(trend.trend);
        const colorClass = getTrendColor(trend.trend);
        const bgClass = getTrendBg(trend.trend);

        return (
          <Card 
            key={trend.period}
            className={cn(
              "hover:shadow-lg transition-all duration-300 border-2",
              bgClass
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center justify-between">
                <span>Trend {trend.period}</span>
                <Icon className={cn("h-4 w-4", colorClass)} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className={cn("text-2xl font-bold", colorClass)}>
                {trend.value >= 0 ? '+' : ''}{formatCurrencyWhole(trend.value, currency)}
              </div>
              <div className={cn("text-sm font-medium", colorClass)}>
                {formatPercentage(trend.percentage)}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TrendIndicators;