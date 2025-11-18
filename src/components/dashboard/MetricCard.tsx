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
  iconBgClass?: string;
  tooltipText?: string;
  isLoading?: boolean;
}

const iconVariants = {
  'icon-container-primary': 'bg-primary/10 text-primary ring-1 ring-primary/20',
  'icon-container-success': 'bg-success/10 text-success ring-1 ring-success/20',
  'icon-container-secondary': 'bg-secondary/10 text-secondary ring-1 ring-secondary/20',
  'icon-container-info': 'bg-info/10 text-info ring-1 ring-info/20',
};

const trendVariants = {
  positive: 'bg-success/10 text-success ring-1 ring-success/30 shadow-sm shadow-success/20 hover:shadow-md hover:shadow-success/30',
  negative: 'bg-destructive/10 text-destructive ring-1 ring-destructive/30 shadow-sm shadow-destructive/20 hover:shadow-md hover:shadow-destructive/30',
  neutral: 'bg-muted/20 text-muted-foreground ring-1 ring-muted/40 shadow-sm hover:shadow-md',
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconBgClass = 'icon-container-primary',
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
          <div className="w-12 h-12 rounded-full bg-muted/50" />
          <div className="w-10 h-10 rounded-full bg-muted/30" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted/50 rounded" />
          <div className="h-3 w-16 bg-muted/30 rounded" />
        </div>
        <div className="h-10 w-32 bg-muted/50 rounded mt-4" />
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard variant="default" hoverEffect="lift" className="group relative p-6">
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 rounded-lg ring-2 ring-primary/0 group-hover:ring-primary/10 transition-all duration-300 pointer-events-none" />
      
      <div className="relative">
        {/* Header with spacing perfetto */}
        <div className="flex items-start justify-between mb-6">
          {/* Icon Container con micro-animation */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative group/icon cursor-help">
                  <div className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 group-hover/icon:rotate-6',
                    iconVariants[iconBgClass as keyof typeof iconVariants] || iconBgClass
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{tooltipText || title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Trend Badge Premium */}
          {trend && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    'flex items-center justify-center gap-1 rounded-full w-10 h-10 text-[10px] font-semibold transition-all duration-300 cursor-help',
                    trendVariants[trend.type],
                    trend.type === 'positive' && 'animate-pulse'
                  )}>
                    <TrendIcon size={10} strokeWidth={2.5} />
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

        {/* Content Section */}
        <div className="space-y-2 mb-4">
          <p className="text-sm font-medium text-muted-foreground tracking-tight">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground/70">{subtitle}</p>
          )}
        </div>

        {/* Animated Number */}
        <div className="overflow-hidden">
          {!isNaN(numericValue) ? (
            <AnimatedCounter
              end={numericValue}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
              duration={1.5}
              className="text-3xl font-bold tracking-tight text-foreground"
            />
          ) : (
            <h2 className="text-3xl font-bold tracking-tight text-foreground">{value}</h2>
          )}
        </div>
      </div>
    </AnimatedCard>
  );
};

export default MetricCard;
