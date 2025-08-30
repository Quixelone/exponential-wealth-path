import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { InvestmentData, ActualTrade } from '@/types/investment';
import { formatCurrency } from '@/lib/utils';

interface RealVsTheoreticalSummaryProps {
  investmentData: InvestmentData[];
  actualTrades: ActualTrade[];
  currency: 'EUR' | 'USD' | 'USDT';
}

export const RealVsTheoreticalSummary: React.FC<RealVsTheoreticalSummaryProps> = ({
  investmentData,
  actualTrades,
  currency
}) => {
  // Calculate summary statistics
  const totalTrades = actualTrades.length;
  const totalTheoreticalValue = investmentData.reduce((sum, item) => {
    const hasTrade = actualTrades.some(trade => trade.day === item.day);
    return hasTrade ? sum + item.finalCapital : sum;
  }, 0);
  
  const totalRealValue = actualTrades.reduce((sum, trade) => 
    sum + (trade.btc_amount * trade.fill_price_usd), 0
  );
  
  const totalDifference = totalRealValue - totalTheoreticalValue;
  const performancePercentage = totalTheoreticalValue > 0 ? 
    (totalDifference / totalTheoreticalValue) * 100 : 0;
  
  const avgSlippage = totalTrades > 0 ? performancePercentage / totalTrades : 0;
  
  const isOutperforming = totalDifference > 0;
  const accuracy = totalTrades > 0 ? 
    (actualTrades.filter(trade => {
      const dayData = investmentData.find(item => item.day === trade.day);
      if (!dayData) return false;
      const realValue = trade.btc_amount * trade.fill_price_usd;
      const diff = Math.abs(realValue - dayData.finalCapital);
      return (diff / dayData.finalCapital) < 0.05; // Within 5% considered accurate
    }).length / totalTrades) * 100 : 0;

  if (totalTrades === 0) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            Performance Reale vs Teorica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nessun trade registrato</p>
            <p className="text-sm">
              Inizia a registrare i tuoi trade reali per vedere il confronto con la strategia teorica
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Performance Reale vs Teorica
          <Badge variant={isOutperforming ? "default" : "secondary"} className="ml-2">
            {totalTrades} trade{totalTrades !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <div className="text-2xl font-bold text-foreground mb-1">
              {formatCurrency(totalTheoreticalValue, 'USD')}
            </div>
            <div className="text-sm text-muted-foreground">Valore Teorico</div>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-primary/10">
            <div className="text-2xl font-bold text-primary mb-1">
              {formatCurrency(totalRealValue, 'USD')}
            </div>
            <div className="text-sm text-muted-foreground">Valore Reale</div>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <div className={`text-2xl font-bold mb-1 ${
              isOutperforming ? 'text-green-600' : 'text-red-600'
            }`}>
              {isOutperforming ? '+' : ''}{formatCurrency(Math.abs(totalDifference), 'USD')}
            </div>
            <div className="text-sm text-muted-foreground">
              Differenza ({isOutperforming ? '+' : ''}{performancePercentage.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Performance Indicator */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {isOutperforming ? 'Sovraperformance' : 'Sottoperformance'}
            </span>
            <div className="flex items-center gap-2">
              {isOutperforming ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                isOutperforming ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(performancePercentage).toFixed(2)}%
              </span>
            </div>
          </div>
          
          <Progress 
            value={Math.min(Math.abs(performancePercentage), 100)} 
            className={`h-2 ${isOutperforming ? 'bg-green-100' : 'bg-red-100'}`}
          />
          
          <div className="text-xs text-muted-foreground text-center">
            {isOutperforming 
              ? `La tua strategia sta performando ${performancePercentage.toFixed(2)}% meglio del previsto`
              : `La tua strategia sta sottoperformando di ${Math.abs(performancePercentage).toFixed(2)}%`
            }
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground mb-1">
              {accuracy.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Accuratezza Strategia</div>
          </div>
          
          <div className="text-center">
            <div className={`text-lg font-semibold mb-1 ${
              avgSlippage >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {avgSlippage >= 0 ? '+' : ''}{avgSlippage.toFixed(2)}%
            </div>
            <div className="text-sm text-muted-foreground">Slippage Medio</div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-2">Riepilogo:</div>
          <div className="text-sm space-y-1">
            <div>• {totalTrades} operazioni registrate</div>
            <div>• {accuracy > 80 ? 'Alta' : accuracy > 60 ? 'Media' : 'Bassa'} accuratezza della strategia</div>
            <div>• {isOutperforming ? 'Sovraperformance' : 'Sottoperformance'} di {Math.abs(performancePercentage).toFixed(2)}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};