import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar, Target } from 'lucide-react';
import { formatCurrency, Currency } from '@/lib/utils';
import { useDeviceInfo } from '@/hooks/use-mobile';

interface CurrentStrategyProgressProps {
  summary: any;
  currency: Currency;
  currentDayIndex: number;
  dailyReturns?: { [day: number]: number };
  originalDailyReturnRate?: number;
}

const CurrentStrategyProgress: React.FC<CurrentStrategyProgressProps> = ({ 
  summary, 
  currency, 
  currentDayIndex,
  dailyReturns = {},
  originalDailyReturnRate = 0
}) => {
  const { isMobile } = useDeviceInfo();

  if (!summary?.current || !summary?.final) {
    return null;
  }

  const current = summary.current;
  const final = summary.final;
  
  // Calcola le percentuali di progresso
  const timeProgress = final.day > 0 ? (current.day / final.day) * 100 : 0;
  const capitalProgress = final.finalCapital > 0 ? (current.finalCapital / final.finalCapital) * 100 : 0;
  const investmentProgress = final.totalInvested > 0 ? (current.totalInvested / final.totalInvested) * 100 : 0;
  
  // Calcola performance reale vs aspettativa del piano originale
  const actualReturnToday = dailyReturns[currentDayIndex] || originalDailyReturnRate;
  const expectedReturnToday = originalDailyReturnRate;
  const returnDeviation = actualReturnToday - expectedReturnToday;
  
  // Calcola performance complessiva vs aspettativa
  const expectedCurrentCapital = (final.finalCapital / final.day) * current.day;
  const performanceVsExpected = expectedCurrentCapital > 0 ? 
    ((current.finalCapital - expectedCurrentCapital) / expectedCurrentCapital) * 100 : 0;

  return (
    <Card className="modern-card">
      <CardHeader className={isMobile ? "p-3 pb-2" : "pb-4"}>
        <CardTitle className={`flex items-center gap-2 ${isMobile ? "text-base" : "text-lg"}`}>
          <Target className={isMobile ? "h-4 w-4 text-primary" : "h-5 w-5 text-primary"} />
          <span className="truncate">Andamento Strategia</span>
          <Badge variant="outline" className={`ml-auto shrink-0 ${isMobile ? "text-[10px] px-1.5 py-0.5" : ""}`}>
            {current.day}/{final.day}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className={`space-y-4 ${isMobile ? "p-3 pt-0" : "space-y-6"}`}>
        {/* Progresso Temporale */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className={`font-medium flex items-center gap-1.5 ${isMobile ? "text-xs" : "text-sm"}`}>
              <Calendar className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
              Progresso
            </span>
            <span className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}>
              {timeProgress.toFixed(0)}%
            </span>
          </div>
          <Progress value={timeProgress} className="h-2" />
        </div>

        {/* Progresso Capitale */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}>Crescita Capitale</span>
            <span className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}>
              {capitalProgress.toFixed(0)}%
            </span>
          </div>
          <Progress value={capitalProgress} className="h-2" />
          <div className={`flex justify-between text-muted-foreground ${isMobile ? "text-[10px]" : "text-xs"}`}>
            <span className="truncate mr-2">{formatCurrency(current.finalCapital, currency)}</span>
            <span className="truncate">{formatCurrency(final.finalCapital, currency)}</span>
          </div>
        </div>

        {/* Progresso Investimenti */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}>Investimenti</span>
            <span className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}>
              {investmentProgress.toFixed(0)}%
            </span>
          </div>
          <Progress value={investmentProgress} className="h-2" />
          <div className={`flex justify-between text-muted-foreground ${isMobile ? "text-[10px]" : "text-xs"}`}>
            <span className="truncate mr-2">{formatCurrency(current.totalInvested, currency)}</span>
            <span className="truncate">{formatCurrency(final.totalInvested, currency)}</span>
          </div>
        </div>

        {/* Performance vs Aspettativa */}
        <div className={`border-t ${isMobile ? "pt-3" : "pt-4"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {performanceVsExpected >= 0 ? (
                <TrendingUp className={`text-green-500 ${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
              ) : (
                <TrendingDown className={`text-red-500 ${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
              )}
              <span className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}>vs Attesa</span>
            </div>
            <Badge 
              variant={performanceVsExpected >= 0 ? "default" : "destructive"}
              className={`${performanceVsExpected >= 0 ? "bg-green-500 hover:bg-green-600" : ""} ${isMobile ? "text-[10px] px-1.5" : ""}`}
            >
              {performanceVsExpected >= 0 ? '+' : ''}{performanceVsExpected.toFixed(1)}%
            </Badge>
          </div>
          {!isMobile && (
            <p className="text-xs text-muted-foreground mt-1">
              {performanceVsExpected >= 0 
                ? "La strategia sta performando meglio del previsto"
                : "La strategia è sotto le aspettative"
              }
            </p>
          )}
        </div>

        {/* Rendimento Attuale */}
        <div className={`grid grid-cols-2 gap-3 border-t ${isMobile ? "pt-3" : "pt-4 gap-4"}`}>
          <div>
            <div className={`text-muted-foreground ${isMobile ? "text-[10px]" : "text-xs"}`}>Rendimento Attuale</div>
            <div className={`font-bold text-primary ${isMobile ? "text-base" : "text-lg"}`}>
              {current.totalReturn.toFixed(2)}%
            </div>
          </div>
          <div>
            <div className={`text-muted-foreground ${isMobile ? "text-[10px]" : "text-xs"}`}>Rendimento Atteso</div>
            <div className={`font-bold ${isMobile ? "text-base" : "text-lg"}`}>
              {final.totalReturn.toFixed(2)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentStrategyProgress;