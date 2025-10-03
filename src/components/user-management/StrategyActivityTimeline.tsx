import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, TrendingUp, DollarSign, ArrowUpDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { ActualTrade } from '@/types/investment';

interface Activity {
  date: Date;
  type: 'daily_return' | 'pac_override' | 'trade' | 'created' | 'modified';
  description: string;
  icon: any;
  color: string;
}

interface StrategyActivityTimelineProps {
  createdAt: string;
  lastModified: string;
  dailyReturnsCount: number;
  pacOverridesCount: number;
  actualTrades: ActualTrade[];
}

export const StrategyActivityTimeline = ({
  createdAt,
  lastModified,
  dailyReturnsCount,
  pacOverridesCount,
  actualTrades,
}: StrategyActivityTimelineProps) => {
  const activities: Activity[] = [
    {
      date: new Date(createdAt),
      type: 'created',
      description: 'Strategia creata',
      icon: Calendar,
      color: 'text-blue-500',
    },
  ];

  // Add activities based on counts
  if (dailyReturnsCount > 0) {
    activities.push({
      date: new Date(lastModified),
      type: 'daily_return',
      description: `${dailyReturnsCount} ritorni giornalieri registrati`,
      icon: TrendingUp,
      color: 'text-green-500',
    });
  }

  if (pacOverridesCount > 0) {
    activities.push({
      date: new Date(lastModified),
      type: 'pac_override',
      description: `${pacOverridesCount} modifiche PAC applicate`,
      icon: DollarSign,
      color: 'text-amber-500',
    });
  }

  if (actualTrades.length > 0) {
    const latestTrade = actualTrades[actualTrades.length - 1];
    activities.push({
      date: new Date(latestTrade.updated_at),
      type: 'trade',
      description: `${actualTrades.length} trade registrati`,
      icon: ArrowUpDown,
      color: 'text-purple-500',
    });
  }

  if (lastModified !== createdAt) {
    activities.push({
      date: new Date(lastModified),
      type: 'modified',
      description: 'Ultima modifica',
      icon: Calendar,
      color: 'text-gray-500',
    });
  }

  // Sort by date descending
  const sortedActivities = activities.sort((a, b) => b.date.getTime() - a.date.getTime());

  const getActivityBadge = (type: Activity['type']) => {
    const badges = {
      created: { label: 'Creazione', variant: 'default' as const },
      modified: { label: 'Modifica', variant: 'secondary' as const },
      daily_return: { label: 'Ritorni', variant: 'default' as const },
      pac_override: { label: 'PAC', variant: 'secondary' as const },
      trade: { label: 'Trade', variant: 'outline' as const },
    };
    return badges[type];
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Cronologia Attività</h3>
          <Badge variant="outline">{sortedActivities.length} eventi</Badge>
        </div>

        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {sortedActivities.map((activity, index) => {
              const Icon = activity.icon;
              const badge = getActivityBadge(activity.type);
              
              return (
                <div key={index} className="flex gap-4 relative">
                  {index < sortedActivities.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-0 w-px bg-border" />
                  )}
                  
                  <div className={`mt-1 p-2 rounded-lg bg-card border border-border relative z-10`}>
                    <Icon className={`h-5 w-5 ${activity.color}`} />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{activity.description}</p>
                      <Badge variant={badge.variant} className="text-xs">
                        {badge.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(activity.date, { addSuffix: true, locale: it })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.date.toLocaleDateString('it-IT', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};
