import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickStat {
  label: string;
  value: string;
  change?: number;
  sparkline?: number[];
}

interface QuickStatsWidgetProps {
  stats: QuickStat[];
  className?: string;
}

export const QuickStatsWidget: React.FC<QuickStatsWidgetProps> = ({ stats, className }) => {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Quick Stats</h3>
      </div>
      
      <div className="space-y-2">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-sm font-bold">{stat.value}</p>
            </div>
            
            {stat.change !== undefined && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
                stat.change >= 0 
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" 
                  : "text-red-600 dark:text-red-400 bg-red-500/10"
              )}>
                {stat.change >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{Math.abs(stat.change)}%</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
