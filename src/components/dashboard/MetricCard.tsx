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
    <Card className="group relative overflow-hidden bg-card/50 backdrop-blur-xl border border-border/50 hover:border-border transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative">
        {/* Header with icon and trend */}
        <div className="flex items-start justify-between mb-6">
          {/* Icon */}
          <div className={cn('flex items-center justify-center w-12 h-12 rounded-2xl transition-transform duration-300 group-hover:scale-110', iconBgClass)}>
            <Icon className="h-6 w-6" />
          </div>

          {/* Small trend indicator - top right */}
          {trend && (
            <div
              className={cn(
                'flex items-center justify-center rounded-full text-[10px] font-bold w-12 h-12 shadow-md',
                trend.type === 'positive' && 'bg-success/15 text-success',
                trend.type === 'negative' && 'bg-destructive/15 text-destructive',
                trend.type === 'neutral' && 'bg-muted/30 text-muted-foreground'
              )}
            >
              {trend.value}
            </div>
          )}
        </div>

        {/* Title and subtitle */}
        <div className="mb-3">
          <p className="text-sm text-muted-foreground/80 font-medium mb-1">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground/60">{subtitle}</p>
          )}
        </div>

        {/* Large value */}
        <h2 className="text-3xl font-bold text-foreground tracking-tight">{value}</h2>
      </div>
    </Card>
  );
};

export default MetricCard;
