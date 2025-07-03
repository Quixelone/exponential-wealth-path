import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar, Target, Percent } from 'lucide-react';
import { formatCurrencyWhole, Currency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SummaryData {
  finalCapital: number;
  totalInvested: number;
  totalInterest: number;
  totalReturn: number;
  day: number;
}

interface HeroInvestmentCardProps {
  summary: {
    current: SummaryData;
    final: SummaryData;
  };
  currency: Currency;
  className?: string;
}

const HeroInvestmentCard: React.FC<HeroInvestmentCardProps> = ({
  summary,
  currency,
  className
}) => {
  const currentData = summary.current;
  const finalData = summary.final;
  
  const isPositiveGrowth = currentData.totalReturn >= 0;
  const progressPercentage = currentData.day > 0 
    ? Math.min((currentData.day / finalData.day) * 100, 100)
    : 0;

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <Card className={cn(
      "relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white border-0 shadow-2xl",
      className
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-blue-800/10 opacity-20" />
      
      <CardContent className="relative p-6 md:p-8">
        <div className="space-y-6">
          {/* Header con stato investimento */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                {formatCurrencyWhole(currentData.finalCapital, currency)}
              </h2>
              <p className="text-blue-100 text-sm">Capitale Attuale</p>
            </div>
            <div className="text-right">
              <Badge 
                variant="secondary" 
                className="bg-white/20 text-white border-white/30"
              >
                <Calendar className="h-3 w-3 mr-1" />
                Giorno {currentData.day}
              </Badge>
            </div>
          </div>

          {/* Metriche principali */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Investito */}
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-200" />
                <span className="text-sm text-blue-100">Investito</span>
              </div>
              <div className="text-lg font-semibold">
                {formatCurrencyWhole(currentData.totalInvested, currency)}
              </div>
            </div>

            {/* Interessi */}
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-300" />
                <span className="text-sm text-blue-100">Interessi</span>
              </div>
              <div className="text-lg font-semibold text-green-300">
                {formatCurrencyWhole(currentData.totalInterest, currency)}
              </div>
            </div>

            {/* Rendimento */}
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                {isPositiveGrowth ? (
                  <TrendingUp className="h-4 w-4 text-green-300" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-300" />
                )}
                <span className="text-sm text-blue-100">Rendimento</span>
              </div>
              <div className={cn(
                "text-lg font-semibold",
                isPositiveGrowth ? "text-green-300" : "text-red-300"
              )}>
                {formatPercentage(currentData.totalReturn)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-blue-100">
              <span>Progresso Investimento</span>
              <span>{progressPercentage.toFixed(1)}% completato</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-blue-200">
              <span>Inizio</span>
              <span>
                Obiettivo: {formatCurrencyWhole(finalData.finalCapital, currency)}
              </span>
            </div>
          </div>

          {/* Proiezione finale */}
          {currentData.day < finalData.day && (
            <div className="bg-white/5 rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">Proiezione Finale</p>
                  <p className="text-lg font-semibold">
                    {formatCurrencyWhole(finalData.finalCapital, currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-100">Giorni rimanenti</p>
                  <p className="text-lg font-semibold text-yellow-300">
                    {finalData.day - currentData.day}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HeroInvestmentCard;