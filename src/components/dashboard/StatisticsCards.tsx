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
  const stats = [
    {
      title: 'Capitale Finale',
      value: formatCurrency(summary?.finalCapital || 0, currency),
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      gradient: 'gradient-primary',
      description: 'Rispetto al mese scorso'
    },
    {
      title: 'Profitto Totale',
      value: formatCurrency(summary?.totalProfit || 0, currency),
      change: '+8.2%',
      changeType: 'positive',
      icon: TrendingUp,
      gradient: 'gradient-success',
      description: 'Crescita mensile'
    },
    {
      title: 'Investimento Totale',
      value: formatCurrency(summary?.totalInvested || 0, currency),
      change: '+5.4%',
      changeType: 'positive',
      icon: PiggyBank,
      gradient: 'gradient-info',
      description: 'PAC accumulato'
    },
    {
      title: 'ROI Medio',
      value: summary?.averageROI ? `${summary.averageROI.toFixed(2)}%` : '0.00%',
      change: '-2.1%',
      changeType: 'negative',
      icon: Target,
      gradient: 'gradient-warning',
      description: 'Rendimento percentuale'
    },
    {
      title: 'Giorni Investimento',
      value: summary?.totalDays || '0',
      change: '+30',
      changeType: 'positive',
      icon: Calendar,
      gradient: 'gradient-danger',
      description: 'Giorni totali'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card key={index} className="modern-card hover-lift overflow-hidden">
            <CardContent className="p-0">
              <div className={`${stat.gradient} p-4 text-white relative`}>
                {/* Background pattern */}
                <div className="absolute top-0 right-0 w-20 h-20 opacity-20">
                  <Icon className="h-16 w-16" />
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="h-6 w-6" />
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      stat.changeType === 'positive' 
                        ? 'bg-white/20 text-white' 
                        : 'bg-black/20 text-white'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  
                  <div className="mb-1">
                    <h3 className="text-sm font-medium opacity-90">{stat.title}</h3>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  
                  <p className="text-xs opacity-75">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatisticsCards;