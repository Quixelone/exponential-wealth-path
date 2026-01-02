import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DollarSign, 
  TrendingUp, 
  Target,
  CircleDollarSign
} from 'lucide-react';
import { formatCurrency, Currency } from '@/lib/utils';
import { useDeviceInfo } from '@/hooks/use-mobile';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface StatisticsCardsProps {
  summary: any;
  currency: Currency;
}

// Mini sparkline data generator
const generateSparklineData = (trend: 'up' | 'down' | 'stable', points: number = 7) => {
  const baseValue = 50;
  return Array.from({ length: points }, (_, i) => {
    const modifier = trend === 'up' ? i * 3 : trend === 'down' ? -i * 2 : Math.sin(i) * 5;
    return { value: baseValue + modifier + Math.random() * 10 };
  });
};

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ summary, currency }) => {
  const { isMobile } = useDeviceInfo();
  
  const finalData = summary?.final || summary?.current || {};
  const currentData = summary?.current || {};
  
  const totalInvested = finalData.totalInvested || 0;
  const finalCapital = finalData.finalCapital || 0;
  const totalProfit = finalCapital - totalInvested;
  const roiPercentage = totalInvested > 0 ? ((totalProfit / totalInvested) * 100) : 0;
  const totalDays = finalData.day || 0;
  
  const stats = [
    {
      title: 'Capitale Totale',
      value: formatCurrency(finalCapital, currency),
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
      iconBg: 'bg-dashboard-accent-blue/20',
      iconColor: 'text-dashboard-accent-blue',
      sparklineColor: '#6C5DD3',
      sparklineData: generateSparklineData('up'),
    },
    {
      title: 'Profitto Realizzato',
      value: formatCurrency(totalProfit, currency),
      change: totalProfit >= 0 ? '+8.2%' : '-3.1%',
      changeType: totalProfit >= 0 ? 'positive' as const : 'negative' as const,
      icon: TrendingUp,
      iconBg: 'bg-dashboard-accent-green/20',
      iconColor: 'text-dashboard-accent-green',
      sparklineColor: '#50D1AA',
      sparklineData: generateSparklineData(totalProfit >= 0 ? 'up' : 'down'),
    },
    {
      title: 'Opzioni Attive',
      value: '3',
      change: '+2',
      changeType: 'positive' as const,
      icon: Target,
      iconBg: 'bg-dashboard-accent-orange/20',
      iconColor: 'text-dashboard-accent-orange',
      sparklineColor: '#FF7A50',
      sparklineData: generateSparklineData('stable'),
    },
    {
      title: 'ROI %',
      value: `${roiPercentage.toFixed(1)}%`,
      change: roiPercentage >= 0 ? '+2.1%' : '-2.1%',
      changeType: roiPercentage >= 0 ? 'positive' as const : 'negative' as const,
      icon: CircleDollarSign,
      iconBg: 'bg-dashboard-accent-red/20',
      iconColor: 'text-dashboard-accent-red',
      sparklineColor: '#FF6B6B',
      sparklineData: generateSparklineData(roiPercentage >= 0 ? 'up' : 'down'),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const staggerClass = `stagger-${(index % 4) + 1}`;

        return (
          <Card
            key={index}
            className={`bg-card dark:bg-dashboard-card border-border dark:border-dashboard-border hover:border-primary/30 dark:hover:border-dashboard-border-light overflow-hidden group animate-fade-in-up ${staggerClass} transition-all duration-300`}
          >
            <CardContent className={isMobile ? "p-3" : "p-4"}>
              <div className="flex items-start justify-between mb-3">
                <div className={`${stat.iconBg} rounded-xl ${isMobile ? "p-2" : "p-2.5"}`}>
                  <Icon className={`${stat.iconColor} ${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
                </div>
                <span className={`rounded-full font-medium ${
                  isMobile ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1"
                } ${
                  stat.changeType === 'positive'
                    ? 'bg-dashboard-accent-green/20 text-dashboard-accent-green'
                    : 'bg-dashboard-accent-red/20 text-dashboard-accent-red'
                }`}>
                  {stat.change}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className={`font-medium text-muted-foreground dark:text-white/60 ${isMobile ? "text-[11px]" : "text-xs"}`}>
                  {stat.title}
                </h3>
                <p className={`font-bold text-foreground dark:text-white ${isMobile ? "text-lg" : "text-xl lg:text-2xl"}`}>
                  {stat.value}
                </p>
              </div>

              {/* Sparkline Chart */}
              <div className="h-10 mt-3 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stat.sparklineData}>
                    <defs>
                      <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={stat.sparklineColor} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={stat.sparklineColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={stat.sparklineColor}
                      strokeWidth={2}
                      fill={`url(#gradient-${index})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatisticsCards;