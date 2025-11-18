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
    <Card className="p-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        {/* Icon Container - Left */}
        <div className={cn('icon-container', iconBgClass)}>
          <Icon className="h-5 w-5" />
        </div>
        
        {/* Small Trend Indicator - Right */}
        {trend && (
          <div
            className={cn(
              'flex items-center justify-center rounded-full text-[10px] font-semibold w-10 h-10',
              trend.type === 'positive' && 'bg-success/10 text-success',
              trend.type === 'negative' && 'bg-destructive/10 text-destructive',
              trend.type === 'neutral' && 'bg-muted/50 text-muted-foreground'
            )}
          >
            {trend.value}
          </div>
        )}
      </div>

      {/* Title and Subtitle */}
      <div className="mb-2">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground/70">{subtitle}</p>
        )}
      </div>

      {/* Large Value */}
      <h2 className="text-3xl font-bold text-foreground">{value}</h2>
    </Card>
  );
};

export default MetricCard;
