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
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
  },
  profit: {
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
  },
  strategy: {
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
  },
  btc: {
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
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
        "relative p-6 rounded-2xl bg-card border border-border/50",
        "transition-all duration-200 hover:-translate-y-0.5",
        className
      )}
      title={tooltipText}
    >
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-10 bg-muted/20 rounded mb-4" />
          <div className="h-6 bg-muted/20 rounded w-3/4" />
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">{title}</p>
              {subtitle && <p className="text-xs text-muted-foreground/60">{subtitle}</p>}
            </div>
            
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl",
              variantStyles[variant].iconBg
            )}>
              <Icon className={cn("h-5 w-5", variantStyles[variant].iconColor)} />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-foreground">
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
                        duration={1.2}
                      />
                    );
                  }
                }
                return <span>{value}</span>;
              })()}
            </div>

            {trend && (
              <div
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold",
                  trend.type === 'positive' && "bg-emerald-500/10 text-emerald-400",
                  trend.type === 'negative' && "bg-red-500/10 text-red-400",
                  trend.type === 'neutral' && "bg-muted/20 text-muted-foreground"
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
