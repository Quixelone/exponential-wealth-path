import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Target,
  PiggyBank
} from 'lucide-react';
import { formatCurrency, Currency } from '@/lib/utils';

interface StatisticsCardsProps {
  summary: any;
  currency: Currency;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ summary, currency }) => {
  // Removed debug currency log to prevent unnecessary re-renders
  // Calcola valori derivati dal summary (usando la struttura corretta con current/final)
  const finalData = summary?.final || summary?.current || {};
  const currentData = summary?.current || {};
  
  const totalInvested = finalData.totalInvested || 0;
  const finalCapital = finalData.finalCapital || 0;
  const totalProfit = finalCapital - totalInvested;
  const roiPercentage = totalInvested > 0 ? ((totalProfit / totalInvested) * 100) : 0;
  const totalDays = finalData.day || 0;
  
  const stats = [
    {
      title: 'Capitale Finale',
      value: formatCurrency(finalCapital, currency),
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
      gradient: 'gradient-primary',
      description: 'Valore totale portfolio'
    },
    {
      title: 'Profitto Totale',
      value: formatCurrency(totalProfit, currency),
      change: totalProfit >= 0 ? '+8.2%' : '-3.1%',
      changeType: totalProfit >= 0 ? 'positive' as const : 'negative' as const,
      icon: TrendingUp,
      gradient: 'gradient-success',
      description: 'Guadagno/Perdita totale'
    },
    {
      title: 'Investimento Totale',
      value: formatCurrency(totalInvested, currency),
      change: '+5.4%',
      changeType: 'positive' as const,
      icon: PiggyBank,
      gradient: 'gradient-info',
      description: 'PAC accumulato'
    },
    {
      title: 'ROI Percentuale',
      value: `${roiPercentage.toFixed(2)}%`,
      change: roiPercentage >= 0 ? '+2.1%' : '-2.1%',
      changeType: roiPercentage >= 0 ? 'positive' as const : 'negative' as const,
      icon: Target,
      gradient: 'gradient-warning',
      description: 'Rendimento percentuale'
    },
    {
      title: 'Giorni Investimento',
      value: totalDays.toString(),
      change: '+30',
      changeType: 'positive' as const,
      icon: Calendar,
      gradient: 'gradient-danger',
      description: 'Giorni totali'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const staggerClass = `stagger-${(index % 5) + 1}`;

        return (
          <Card
            key={index}
            className={`modern-card hover-lift overflow-hidden group animate-fade-in-up ${staggerClass} shadow-modern hover:shadow-modern-lg transition-all duration-300`}
          >
            <CardContent className="p-0">
              <div className={`${stat.gradient} p-3 sm:p-4 text-white relative overflow-hidden`}>
                {/* Animated gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Background pattern with hover animation */}
                <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 opacity-20 group-hover:opacity-30 transition-all duration-300 group-hover:scale-110">
                  <Icon className="h-12 w-12 sm:h-16 sm:w-16" />
                </div>

                {/* Subtle border glow effect */}
                <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/20 rounded-xl transition-all duration-300" />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full backdrop-blur-sm font-medium transition-transform duration-300 group-hover:scale-105 ${
                      stat.changeType === 'positive'
                        ? 'bg-white/20 text-white'
                        : 'bg-black/20 text-white'
                    }`}>
                      {stat.change}
                    </span>
                  </div>

                  <div className="mb-1 space-y-1">
                    <h3 className="text-xs sm:text-sm font-medium opacity-90 truncate group-hover:opacity-100 transition-opacity">
                      {stat.title}
                    </h3>
                    <p className="text-lg sm:text-2xl font-bold truncate group-hover:scale-105 transition-transform duration-300 origin-left">
                      {stat.value}
                    </p>
                  </div>

                  <p className="text-xs opacity-75 hidden sm:block group-hover:opacity-90 transition-opacity">
                    {stat.description}
                  </p>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatisticsCards;