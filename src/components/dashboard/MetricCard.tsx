import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TrendData {
  value: string;
  type: 'positive' | 'negative' | 'neutral';
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: TrendData;
  icon: LucideIcon;
  iconBgClass?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconBgClass = 'icon-container-primary',
}) => {
  return (
    <Card className="metric-card hover-scale transition-all duration-300 hover:shadow-lg">
      {/* Header Row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('icon-container', iconBgClass)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground/70">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Trend Indicator Circle */}
        {trend && (
          <div
            className={cn(
              'trend-indicator-circle',
              trend.type === 'positive' && 'trend-indicator-positive',
              trend.type === 'negative' && 'trend-indicator-negative',
              trend.type === 'neutral' && 'trend-indicator-neutral'
            )}
          >
            {trend.value}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <h2 className="metric-number">{value}</h2>
      </div>
    </Card>
  );
};

export default MetricCard;
