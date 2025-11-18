import React from 'react';
import { Clock, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  type: 'pac' | 'return' | 'trade' | 'other';
  title: string;
  description: string;
  timestamp: string;
  amount?: string;
}

interface RecentActivityWidgetProps {
  activities: Activity[];
  className?: string;
}

const activityIcons = {
  pac: DollarSign,
  return: TrendingUp,
  trade: Calendar,
  other: Clock,
};

const activityColors = {
  pac: 'text-blue-500 bg-blue-500/10',
  return: 'text-green-500 bg-green-500/10',
  trade: 'text-purple-500 bg-purple-500/10',
  other: 'text-gray-500 bg-gray-500/10',
};

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ 
  activities, 
  className 
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Attività Recenti</h3>
      </div>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.type];
          
          return (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className={cn(
                "p-2 rounded-full",
                activityColors[activity.type]
              )}>
                <Icon className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold truncate">{activity.title}</p>
                  {activity.amount && (
                    <span className="text-sm font-bold text-primary whitespace-nowrap">
                      {activity.amount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground/70">{activity.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
