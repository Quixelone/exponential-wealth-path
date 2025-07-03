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
      "relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white border-0 shadow-2xl",
      className
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
      
      <CardContent className="relative p-6 md:p-8">
        <div className="space-y-6">
          {/* Header con stato investimento */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-sm">
                {formatCurrencyWhole(currentData.finalCapital, currency)}
              </h2>
              <p className="text-slate-200 text-base font-medium">Capitale Attuale</p>
            </div>
            <div className="text-right">
              <Badge 
                variant="secondary" 
                className="bg-white text-slate-900 border-white font-semibold px-3 py-1 shadow-lg"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Giorno {currentData.day}
              </Badge>
            </div>
          </div>

          {/* Metriche principali */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Investito */}
            <div className="bg-white/15 rounded-xl p-5 backdrop-blur-md border border-white/20 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-blue-300" />
                <span className="text-sm text-slate-200 font-medium">Investito</span>
              </div>
              <div className="text-xl font-bold text-white">
                {formatCurrencyWhole(currentData.totalInvested, currency)}
              </div>
            </div>

            {/* Interessi */}
            <div className="bg-emerald-500/20 rounded-xl p-5 backdrop-blur-md border border-emerald-400/30 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-emerald-300" />
                <span className="text-sm text-slate-200 font-medium">Interessi</span>
              </div>
              <div className="text-xl font-bold text-emerald-300">
                {formatCurrencyWhole(currentData.totalInterest, currency)}
              </div>
            </div>

            {/* Rendimento */}
            <div className={cn(
              "rounded-xl p-5 backdrop-blur-md border shadow-lg",
              isPositiveGrowth 
                ? "bg-emerald-500/20 border-emerald-400/30" 
                : "bg-red-500/20 border-red-400/30"
            )}>
              <div className="flex items-center gap-2 mb-3">
                {isPositiveGrowth ? (
                  <TrendingUp className="h-5 w-5 text-emerald-300" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-300" />
                )}
                <span className="text-sm text-slate-200 font-medium">Rendimento</span>
              </div>
              <div className={cn(
                "text-xl font-bold",
                isPositiveGrowth ? "text-emerald-300" : "text-red-300"
              )}>
                {formatPercentage(currentData.totalReturn)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3 bg-white/10 rounded-xl p-4 backdrop-blur-md">
            <div className="flex justify-between text-slate-200 font-medium">
              <span>Progresso Investimento</span>
              <span className="text-white font-semibold">{progressPercentage.toFixed(1)}% completato</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-slate-300">
              <span>Inizio</span>
              <span className="font-semibold">
                Obiettivo: {formatCurrencyWhole(finalData.finalCapital, currency)}
              </span>
            </div>
          </div>

          {/* Proiezione finale */}
          {currentData.day < finalData.day && (
            <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl p-5 border border-blue-400/30 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-200 font-medium mb-1">Proiezione Finale</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrencyWhole(finalData.finalCapital, currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-200 font-medium mb-1">Giorni rimanenti</p>
                  <p className="text-2xl font-bold text-amber-300">
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