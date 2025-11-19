import { Target, Activity, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import { useActualTrades } from '@/hooks/useActualTrades';
import { useSupabaseConfig } from '@/hooks/useSupabaseConfig';

const stats = [
  {
    title: 'Strategie Attive',
    icon: Target,
    bgColor: 'bg-[hsl(174,100%,42%)]',
    key: 'configs'
  },
  {
    title: 'Operazioni Totali',
    icon: Activity,
    bgColor: 'bg-warning',
    key: 'trades'
  },
  {
    title: 'Giorni Investiti',
    icon: Calendar,
    bgColor: 'bg-[hsl(174,100%,42%)]',
    key: 'days'
  }
];

export const StatsCards = () => {
  const { currentDayIndex } = useInvestmentCalculator();
  const { trades } = useActualTrades({ configId: null });
  const { savedConfigs } = useSupabaseConfig();

  const values = {
    configs: savedConfigs.length,
    trades: trades.length,
    days: currentDayIndex
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.key}
            className="modern-card group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              {/* Icon Badge */}
              <div className={cn(
                "modern-icon-badge",
                stat.bgColor
              )}>
                <Icon className="h-6 w-6 text-white" />
              </div>

              {/* Stats */}
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {values[stat.key as keyof typeof values]}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
