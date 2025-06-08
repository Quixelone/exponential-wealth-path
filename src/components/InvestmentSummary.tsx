
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, PiggyBank, Target, Percent } from 'lucide-react';

interface InvestmentSummaryProps {
  summary: {
    finalCapital: number;
    totalInvested: number;
    totalInterest: number;
    totalReturn: number;
  };
}

const InvestmentSummary: React.FC<InvestmentSummaryProps> = ({ summary }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const summaryCards = [
    {
      title: 'Capitale Finale',
      value: formatCurrency(summary.finalCapital),
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      delay: '0s'
    },
    {
      title: 'Totale Investito',
      value: formatCurrency(summary.totalInvested),
      icon: PiggyBank,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      delay: '0.1s'
    },
    {
      title: 'Interessi Maturati',
      value: formatCurrency(summary.totalInterest),
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      delay: '0.2s'
    },
    {
      title: 'Rendimento Totale',
      value: formatPercentage(summary.totalReturn),
      icon: Percent,
      color: summary.totalReturn >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: summary.totalReturn >= 0 ? 'bg-green-100' : 'bg-red-100',
      delay: '0.3s'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {summaryCards.map((card, index) => (
        <Card 
          key={card.title} 
          className="animate-scale-in hover:shadow-lg transition-shadow duration-300"
          style={{ animationDelay: card.delay }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InvestmentSummary;
