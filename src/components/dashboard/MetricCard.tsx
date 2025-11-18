import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AnimatedCard } from '@/components/ui/animated-card';
import { AnimatedCounter } from '@/components/investor-pitch/shared/AnimatedCounter';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  variant: 'capital' | 'profit' | 'strategy' | 'btc';
  tooltipText?: string;
  isLoading?: boolean;
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
  positive: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  negative: 'bg-red-500/10 text-red-600 dark:text-red-400',
  neutral: 'bg-muted/20 text-muted-foreground',
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  variant,
  tooltipText,
  isLoading = false,
}) => {
  // Extract numeric value for animation
  const numericValue = typeof value === 'string' 
    ? parseFloat(value.replace(/[^0-9.-]/g, '')) 
    : value;
  
  const prefix = typeof value === 'string' ? value.match(/^[^0-9.-]+/)?.[0] || '' : '';
  const suffix = typeof value === 'string' ? value.match(/[^0-9.,]+$/)?.[0] || '' : '';
  const decimals = typeof value === 'string' && value.includes('.') ? 2 : 0;

  // Get trend icon
  const TrendIcon = trend?.type === 'positive' ? TrendingUp : 
                    trend?.type === 'negative' ? TrendingDown : Minus;

  if (isLoading) {
    return (
      <AnimatedCard variant="default" className="p-6 animate-pulse">
        <div className="flex items-start justify-between mb-6">
          <div className="w-12 h-12 rounded-xl bg-muted/30" />
          <div className="w-16 h-6 rounded-full bg-muted/20" />
        </div>
        <div className="space-y-1 mb-4">
          <div className="h-4 w-24 bg-muted/30 rounded" />
          <div className="h-3 w-20 bg-muted/20 rounded" />
        </div>
        <div className="h-10 w-32 bg-muted/30 rounded" />
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard 
      variant="default" 
      hoverEffect="lift" 
      className="group relative p-6 transition-all duration-200"
    >
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          {/* Icon Container */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative cursor-help">
                  <div className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200',
                    variantStyles[variant].bg,
                    variantStyles[variant].ring
                  )}>
                    <Icon className={cn("h-6 w-6", variantStyles[variant].text)} />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{tooltipText || title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Trend Badge */}
          {trend && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-help',
                    trendVariants[trend.type]
                  )}>
                    <TrendIcon className="h-3 w-3" strokeWidth={2} />
                    <span>{trend.value}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">
                    {trend.type === 'positive' ? 'Growth' : trend.type === 'negative' ? 'Decline' : 'No change'} compared to previous period
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Typography */}
        <div className="space-y-0.5 mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground/80">{subtitle}</p>
          )}
        </div>

        {/* Value */}
        <div className="overflow-hidden">
          {!isNaN(numericValue) ? (
            <AnimatedCounter
              end={numericValue}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
              duration={1.5}
              className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground"
            />
          ) : (
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">{value}</h2>
          )}
        </div>
      </div>
    </AnimatedCard>
  );
};

export default MetricCard;
