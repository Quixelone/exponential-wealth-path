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
    <Card className="metric-card hover-scale transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-card to-card/80 border-l-4 border-l-primary/20 hover:border-l-primary/60">
      {/* Header Row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('icon-container animate-pulse', iconBgClass)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground/70">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Trend Indicator Circle - LARGER */}
        {trend && (
          <div
            className={cn(
              'flex items-center justify-center rounded-full text-xs font-bold transition-all duration-300 w-16 h-16 shadow-lg',
              trend.type === 'positive' && 'bg-success/20 text-success border-2 border-success/40',
              trend.type === 'negative' && 'bg-destructive/20 text-destructive border-2 border-destructive/40',
              trend.type === 'neutral' && 'bg-muted text-muted-foreground border-2 border-muted-foreground/40'
            )}
          >
            {trend.value}
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4" />

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <h2 className="metric-number">{value}</h2>
      </div>
    </Card>
  );
};

export default MetricCard;
