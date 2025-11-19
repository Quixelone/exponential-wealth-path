import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AnimatedCounter } from '@/components/investor-pitch/shared/AnimatedCounter';
import { cn } from '@/lib/utils';

interface TrendData {
  value: number;
  type: 'positive' | 'negative' | 'neutral';
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: TrendData;
  icon: LucideIcon;
  variant: 'capital' | 'profit' | 'strategy' | 'btc';
  tooltipText?: string;
  isLoading?: boolean;
  className?: string;
}

const variantStyles = {
  capital: {
    iconBg: 'bg-blue-100 dark:bg-blue-950',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  profit: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-950',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  strategy: {
    iconBg: 'bg-violet-100 dark:bg-violet-950',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  btc: {
    iconBg: 'bg-amber-100 dark:bg-amber-950',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  variant,
  tooltipText = '',
  isLoading = false,
  className
}) => {
  return (
    <div
      className={cn(
        "relative p-6 space-y-4 rounded-3xl",
        "bg-card border-0",
        "shadow-card",
        "transition-all duration-300 hover:shadow-card-lg hover:-translate-y-1",
        className
      )}
      title={tooltipText}
    >
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-12 bg-muted rounded-md mb-4" />
          <div className="h-8 bg-muted rounded-md w-3/4" />
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {subtitle && <p className="text-xs text-muted-foreground/70">{subtitle}</p>}
            </div>
            
            {/* Circular Icon */}
            <div className={cn(
              "flex items-center justify-center h-12 w-12 rounded-full",
              variantStyles[variant].iconBg
            )}>
              <Icon className={cn("h-6 w-6", variantStyles[variant].iconColor)} />
            </div>
          </div>

          <div className="space-y-3">
            {/* Large Value */}
            <div className="text-4xl font-bold tracking-tight text-foreground">
              {(() => {
                const match = String(value).match(/^([^\d]*)([0-9.,\s]+)(.*)/);
                if (match) {
                  const [, prefix, number, suffix] = match;
                  const numericValue = parseFloat(number.replace(/[,\s]/g, ''));
                  if (!isNaN(numericValue)) {
                    return (
                      <AnimatedCounter
                        end={numericValue}
                        prefix={prefix}
                        suffix={suffix}
                        decimals={number.includes('.') ? 2 : 0}
                        duration={1.5}
                      />
                    );
                  }
                }
                return <span>{value}</span>;
              })()}
            </div>

            {/* Trend Badge */}
            {trend && (
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
                  trend.type === 'positive' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  trend.type === 'negative' && "bg-red-500/10 text-red-600 dark:text-red-400",
                  trend.type === 'neutral' && "bg-muted/50 text-muted-foreground"
                )}
              >
                {trend.type === 'positive' && <TrendingUp className="h-3 w-3" />}
                {trend.type === 'negative' && <TrendingDown className="h-3 w-3" />}
                {trend.type === 'neutral' && <Minus className="h-3 w-3" />}
                <span>
                  {trend.value > 0 ? '+' : ''}{trend.value.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
