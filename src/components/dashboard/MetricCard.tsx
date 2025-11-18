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
    bg: 'bg-blue-500/20 dark:bg-blue-400/20',
    text: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-2 ring-blue-500/30 dark:ring-blue-400/30',
    glow: 'shadow-lg shadow-blue-500/20 dark:shadow-blue-400/20',
  },
  profit: {
    bg: 'bg-emerald-500/20 dark:bg-emerald-400/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-2 ring-emerald-500/30 dark:ring-emerald-400/30',
    glow: 'shadow-lg shadow-emerald-500/20 dark:shadow-emerald-400/20',
  },
  strategy: {
    bg: 'bg-violet-500/20 dark:bg-violet-400/20',
    text: 'text-violet-600 dark:text-violet-400',
    ring: 'ring-2 ring-violet-500/30 dark:ring-violet-400/30',
    glow: 'shadow-lg shadow-violet-500/20 dark:shadow-violet-400/20',
  },
  btc: {
    bg: 'bg-amber-500/20 dark:bg-amber-400/20',
    text: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-2 ring-amber-500/30 dark:ring-amber-400/30',
    glow: 'shadow-lg shadow-amber-500/20 dark:shadow-amber-400/20',
  },
};

const trendVariants = {
  positive: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/40 shadow-sm shadow-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/40',
  negative: 'bg-red-500/15 text-red-600 dark:text-red-400 ring-1 ring-red-500/40 shadow-sm shadow-red-500/30 hover:shadow-lg hover:shadow-red-500/40',
  neutral: 'bg-muted/30 text-muted-foreground ring-1 ring-muted/50 shadow-sm hover:shadow-md',
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
      <AnimatedCard variant="default" className="p-8 animate-pulse bg-card/95 backdrop-blur-sm border border-border/50">
        <div className="flex items-start justify-between mb-8">
          <div className="w-16 h-16 rounded-2xl bg-muted/50" />
          <div className="w-20 h-8 rounded-full bg-muted/30" />
        </div>
        <div className="space-y-1 mb-6">
          <div className="h-4 w-28 bg-muted/50 rounded" />
          <div className="h-3 w-20 bg-muted/30 rounded" />
        </div>
        <div className="h-12 w-40 bg-muted/50 rounded" />
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard 
      variant="default" 
      hoverEffect="lift" 
      className="group relative p-8 bg-card/95 backdrop-blur-sm border border-border/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
    >
      {/* Colored glow effect on hover */}
      <div className={cn(
        "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
        variantStyles[variant].glow
      )} />
      
      <div className="relative">
        {/* Header with generous spacing */}
        <div className="flex items-start justify-between mb-8">
          {/* GIANT Icon Container */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative group/icon cursor-help">
                  <div className={cn(
                    'flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 group-hover/icon:rotate-12 group-hover/icon:scale-110',
                    variantStyles[variant].bg,
                    variantStyles[variant].ring,
                    variantStyles[variant].glow
                  )}>
                    <Icon className={cn("h-8 w-8", variantStyles[variant].text)} />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{tooltipText || title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* READABLE Trend Badge */}
          {trend && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    'flex items-center gap-1.5 px-3 h-8 rounded-full font-bold text-sm transition-all duration-300 cursor-help',
                    trendVariants[trend.type],
                    trend.type === 'positive' && 'animate-pulse'
                  )}>
                    <TrendIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
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

        {/* Typography Section */}
        <div className="space-y-1 mb-6">
          <h3 className="text-base font-semibold text-foreground tracking-tight">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* DOMINANT Animated Number */}
        <div className="overflow-hidden">
          {!isNaN(numericValue) ? (
            <AnimatedCounter
              end={numericValue}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
              duration={1.5}
              className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground"
            />
          ) : (
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">{value}</h2>
          )}
        </div>
      </div>
    </AnimatedCard>
  );
};

export default MetricCard;
