
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, PiggyBank, Target, Percent, Calendar, TrendingDown } from 'lucide-react';
import { formatCurrency, formatCurrencyWhole, Currency } from '@/lib/utils';

interface SummaryData {
  finalCapital: number;
  totalInvested: number;
  totalInterest: number;
  totalReturn: number;
  day: number;
}

interface InvestmentSummaryProps {
  summary: {
    current: SummaryData;
    final: SummaryData;
  };
  currency: Currency;
}

const InvestmentSummary: React.FC<InvestmentSummaryProps> = React.memo(({ summary, currency }) => {
  // Removed debug currency log to prevent unnecessary re-renders
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getDifferenceIcon = (current: number, final: number) => {
    return current < final ? TrendingUp : TrendingDown;
  };

  const getSummaryCards = (data: SummaryData, type: 'current' | 'final') => [
    {
      title: 'Capitale',
      value: formatCurrencyWhole(data.finalCapital, currency),
      icon: Target,
      iconClass: 'icon-circle-blue',
      gradientClass: 'from-primary/10 to-transparent'
    },
    {
      title: 'Investito',
      value: formatCurrencyWhole(data.totalInvested, currency),
      icon: PiggyBank,
      iconClass: 'icon-circle-violet',
      gradientClass: 'from-violet/10 to-transparent'
    },
    {
      title: 'Interessi',
      value: formatCurrencyWhole(data.totalInterest, currency),
      icon: TrendingUp,
      iconClass: 'icon-circle-green',
      gradientClass: 'from-success/10 to-transparent'
    },
    {
      title: 'Rendimento',
      value: formatPercentage(data.totalReturn),
      icon: Percent,
      iconClass: data.totalReturn >= 0 ? 'icon-circle-green' : 'icon-circle-orange',
      gradientClass: data.totalReturn >= 0 ? 'from-success/10 to-transparent' : 'from-warning/10 to-transparent'
    }
  ];

  const currentCards = getSummaryCards(summary.current, 'current');
  const finalCards = getSummaryCards(summary.final, 'final');

  return (
    <div className="space-y-6 mb-6">
      {/* Situazione Attuale */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-foreground">Situazione Attuale</h3>
          <Badge variant="default" className="bg-blue-500 text-white">
            <Calendar className="h-3 w-3 mr-1" />
            Giorno {summary.current.day}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentCards.map((card, index) => (
            <Card 
              key={`current-${card.title}`}
              className="group relative overflow-hidden rounded-2xl bg-card border border-white/5 hover:border-white/10 card-interactive"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient decorativo */}
              <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${card.gradientClass}`} />
              
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {card.title}
                </CardTitle>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.iconClass}`}>
                  <card.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {card.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Proiezione Finale */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-foreground">Proiezione Finale</h3>
          <Badge variant="outline" className="border-primary text-primary">
            <Target className="h-3 w-3 mr-1" />
            Giorno {summary.final.day}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {finalCards.map((card, index) => {
            const currentValue = index === 0 ? summary.current.finalCapital 
              : index === 1 ? summary.current.totalInvested
              : index === 2 ? summary.current.totalInterest
              : summary.current.totalReturn;
            
            const finalValue = index === 0 ? summary.final.finalCapital 
              : index === 1 ? summary.final.totalInvested
              : index === 2 ? summary.final.totalInterest
              : summary.final.totalReturn;

            const DifferenceIcon = getDifferenceIcon(currentValue, finalValue);
            const isPositiveTrend = currentValue < finalValue;

            return (
              <Card 
                key={`final-${card.title}`}
                className="animate-scale-in hover:shadow-lg transition-shadow duration-300 border-2 border-primary/20"
                style={{ animationDelay: `${(index + 4) * 0.1}s` }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.iconClass}`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                    <DifferenceIcon 
                      className={`h-3 w-3 ${isPositiveTrend ? 'text-green-500' : 'text-gray-400'}`} 
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {card.value}
                  </div>
                  {summary.current.day > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {index < 3 
                        ? `Crescita: ${formatCurrencyWhole(finalValue - currentValue, currency)}`
                        : `Differenza: ${formatPercentage(finalValue - currentValue)}`
                      }
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo
  return (
    prevProps.summary.current.day === nextProps.summary.current.day &&
    prevProps.summary.final.day === nextProps.summary.final.day &&
    prevProps.summary.current.finalCapital === nextProps.summary.current.finalCapital &&
    prevProps.summary.final.finalCapital === nextProps.summary.final.finalCapital &&
    prevProps.currency === nextProps.currency
  );
});

InvestmentSummary.displayName = 'InvestmentSummary';

export default InvestmentSummary;
