import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar, Target } from 'lucide-react';
import { formatCurrency, Currency } from '@/lib/utils';

interface CurrentStrategyProgressProps {
  summary: any;
  currency: Currency;
  currentDayIndex: number;
}

const CurrentStrategyProgress: React.FC<CurrentStrategyProgressProps> = ({ 
  summary, 
  currency, 
  currentDayIndex 
}) => {
  if (!summary?.current || !summary?.final) {
    return null;
  }

  const current = summary.current;
  const final = summary.final;
  
  // Calcola le percentuali di progresso
  const timeProgress = final.day > 0 ? (current.day / final.day) * 100 : 0;
  const capitalProgress = final.finalCapital > 0 ? (current.finalCapital / final.finalCapital) * 100 : 0;
  const investmentProgress = final.totalInvested > 0 ? (current.totalInvested / final.totalInvested) * 100 : 0;
  
  // Calcola performance vs aspettativa
  const expectedCurrentCapital = (final.finalCapital / final.day) * current.day;
  const performanceVsExpected = expectedCurrentCapital > 0 ? 
    ((current.finalCapital - expectedCurrentCapital) / expectedCurrentCapital) * 100 : 0;

  return (
    <Card className="modern-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Andamento Strategia Attuale
          <Badge variant="outline" className="ml-auto">
            Giorno {current.day} di {final.day}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progresso Temporale */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Progresso Temporale
            </span>
            <span className="text-sm text-muted-foreground">
              {timeProgress.toFixed(1)}%
            </span>
          </div>
          <Progress value={timeProgress} className="h-2" />
        </div>

        {/* Progresso Capitale */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Crescita Capitale</span>
            <span className="text-sm text-muted-foreground">
              {capitalProgress.toFixed(1)}%
            </span>
          </div>
          <Progress value={capitalProgress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Attuale: {formatCurrency(current.finalCapital, currency)}</span>
            <span>Obiettivo: {formatCurrency(final.finalCapital, currency)}</span>
          </div>
        </div>

        {/* Progresso Investimenti */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Investimenti Versati</span>
            <span className="text-sm text-muted-foreground">
              {investmentProgress.toFixed(1)}%
            </span>
          </div>
          <Progress value={investmentProgress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Versato: {formatCurrency(current.totalInvested, currency)}</span>
            <span>Totale: {formatCurrency(final.totalInvested, currency)}</span>
          </div>
        </div>

        {/* Performance vs Aspettativa */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {performanceVsExpected >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">Performance vs Attesa</span>
            </div>
            <Badge 
              variant={performanceVsExpected >= 0 ? "default" : "destructive"}
              className={performanceVsExpected >= 0 ? "bg-green-500 hover:bg-green-600" : ""}
            >
              {performanceVsExpected >= 0 ? '+' : ''}{performanceVsExpected.toFixed(2)}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {performanceVsExpected >= 0 
              ? "La strategia sta performando meglio del previsto"
              : "La strategia è sotto le aspettative"
            }
          </p>
        </div>

        {/* Rendimento Attuale */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <div className="text-xs text-muted-foreground">Rendimento Attuale</div>
            <div className="text-lg font-bold text-primary">
              {current.totalReturn.toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Rendimento Atteso</div>
            <div className="text-lg font-bold">
              {final.totalReturn.toFixed(2)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentStrategyProgress;