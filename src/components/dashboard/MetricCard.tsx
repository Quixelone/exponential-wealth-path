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
    iconClass: 'icon-circle-blue',
    gradientClass: 'from-primary/10 to-transparent',
  },
  profit: {
    iconClass: 'icon-circle-green',
    gradientClass: 'from-success/10 to-transparent',
  },
  strategy: {
    iconClass: 'icon-circle-violet',
    gradientClass: 'from-violet/10 to-transparent',
  },
  btc: {
    iconClass: 'icon-circle-orange',
    gradientClass: 'from-warning/10 to-transparent',
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
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 bg-card border border-white/5",
        "hover:border-white/10 transition-all card-interactive",
        className
      )}
      title={tooltipText}
    >
      {/* Background decorativo */}
      <div className={cn(
        "absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl bg-gradient-to-br",
        styles.gradientClass
      )} />
      
      {isLoading ? (
        <div className="animate-pulse relative">
          <div className="h-10 bg-muted/20 rounded mb-4" />
          <div className="h-6 bg-muted/20 rounded w-3/4" />
        </div>
      ) : (
        <div className="relative">
          {/* Header con icon e badge */}
          <div className="flex items-center justify-between mb-4">
            {/* Icon circle colorato */}
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              styles.iconClass
            )}>
              <Icon className="h-6 w-6" />
            </div>
            
            {/* Trend badge */}
            {trend && (
              <span className={cn(
                "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold",
                trend.type === 'positive' && "badge-success",
                trend.type === 'negative' && "badge-danger",
                trend.type === 'neutral' && "bg-muted/20 text-muted-foreground"
              )}>
                {trend.type === 'positive' && <TrendingUp className="h-3 w-3" />}
                {trend.type === 'negative' && <TrendingDown className="h-3 w-3" />}
                {trend.type === 'neutral' && <Minus className="h-3 w-3" />}
                <span>
                  {trend.value > 0 ? '+' : ''}{trend.value.toFixed(2)}%
                </span>
              </span>
            )}
          </div>

          {/* Content */}
          <div className="space-y-1">
            <p className="text-sm text-gray-400">{title}</p>
            <div className="text-3xl font-bold text-white">
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
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
      )}
    </div>
  );
};
