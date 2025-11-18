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
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    text: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-1 ring-blue-500/20 dark:ring-blue-400/20',
  },
  profit: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-1 ring-emerald-500/20 dark:ring-emerald-400/20',
  },
  strategy: {
    bg: 'bg-violet-500/10 dark:bg-violet-500/15',
    text: 'text-violet-600 dark:text-violet-400',
    ring: 'ring-1 ring-violet-500/20 dark:ring-violet-400/20',
  },
  btc: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-1 ring-amber-500/20 dark:ring-amber-400/20',
  },
};

const trendVariants = {
  positive: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  negative: {
    bg: 'bg-red-500/10',
    text: 'text-red-600 dark:text-red-400',
  },
  neutral: {
    bg: 'bg-muted/20',
    text: 'text-muted-foreground',
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
        "group relative p-6 space-y-4 rounded-xl",
        "glass-card border border-border/50",
        "tilt-card glow-hover transition-all duration-300",
        "hover:border-primary/30",
        variantStyles[variant].ring,
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
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                {Icon && (
                  <div className="relative">
                    <Icon className={cn("h-7 w-7 transition-all duration-300 hover:scale-110", variantStyles[variant].text)} />
                  </div>
                )}
              </div>
              {subtitle && <p className="text-xs text-muted-foreground/70">{subtitle}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-4xl font-bold tracking-tight">
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

            {trend && (
              <div
                title={`Variazione: ${trend.value > 0 ? '+' : ''}${trend.value.toFixed(2)}%`}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-base font-semibold",
                  "transform transition-all duration-300 hover:scale-105",
                  trendVariants[trend.type].bg,
                  trendVariants[trend.type].text
                )}
              >
                {trend.type === 'positive' && <TrendingUp className="h-4 w-4" />}
                {trend.type === 'negative' && <TrendingDown className="h-4 w-4" />}
                {trend.type === 'neutral' && <Minus className="h-4 w-4" />}
                <span className="tabular-nums">
                  {trend.value > 0 ? '+' : ''}{trend.value.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
          
          <div className="absolute -inset-px bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </>
      )}
    </div>
  );
};
