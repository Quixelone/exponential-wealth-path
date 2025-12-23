import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { InvestmentData, ActualTrade } from '@/types/investment';
import { formatCurrency } from '@/lib/utils';
import { useDeviceInfo } from '@/hooks/use-mobile';

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
  const { isMobile } = useDeviceInfo();

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
        <CardHeader className={isMobile ? "p-3 pb-2" : ""}>
          <CardTitle className={`flex items-center gap-2 ${isMobile ? "text-base" : ""}`}>
            <Activity className={`text-muted-foreground ${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
            Performance Reale vs Teorica
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "p-3 pt-0" : ""}>
          <div className={`text-center text-muted-foreground ${isMobile ? "py-4" : "py-8"}`}>
            <DollarSign className={`mx-auto mb-3 opacity-50 ${isMobile ? "h-8 w-8" : "h-12 w-12"}`} />
            <p className={`font-medium mb-1 ${isMobile ? "text-sm" : "text-lg"}`}>Nessun trade registrato</p>
            <p className={isMobile ? "text-xs" : "text-sm"}>
              Registra i tuoi trade per vedere il confronto
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className={isMobile ? "p-3 pb-2" : ""}>
        <CardTitle className={`flex items-center gap-2 ${isMobile ? "text-base" : ""}`}>
          <Activity className={`text-primary ${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
          <span className="truncate">Performance Reale vs Teorica</span>
          <Badge variant={isOutperforming ? "default" : "secondary"} className={`ml-auto shrink-0 ${isMobile ? "text-[10px] px-1.5" : "ml-2"}`}>
            {totalTrades} trade{totalTrades !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className={`space-y-4 ${isMobile ? "p-3 pt-0" : "space-y-6"}`}>
        {/* Performance Overview */}
        <div className={`grid gap-2 ${isMobile ? "grid-cols-3" : "grid-cols-1 md:grid-cols-3 gap-4"}`}>
          <div className={`text-center rounded-lg bg-muted/30 ${isMobile ? "p-2" : "p-4"}`}>
            <div className={`font-bold text-foreground ${isMobile ? "text-sm" : "text-2xl"} mb-0.5`}>
              {formatCurrency(totalTheoreticalValue, 'USD')}
            </div>
            <div className={`text-muted-foreground ${isMobile ? "text-[10px]" : "text-sm"}`}>Teorico</div>
          </div>
          
          <div className={`text-center rounded-lg bg-primary/10 ${isMobile ? "p-2" : "p-4"}`}>
            <div className={`font-bold text-primary ${isMobile ? "text-sm" : "text-2xl"} mb-0.5`}>
              {formatCurrency(totalRealValue, 'USD')}
            </div>
            <div className={`text-muted-foreground ${isMobile ? "text-[10px]" : "text-sm"}`}>Reale</div>
          </div>
          
          <div className={`text-center rounded-lg bg-muted/30 ${isMobile ? "p-2" : "p-4"}`}>
            <div className={`font-bold ${isMobile ? "text-sm" : "text-2xl"} mb-0.5 ${
              isOutperforming ? 'text-green-600' : 'text-red-600'
            }`}>
              {isOutperforming ? '+' : '-'}{formatCurrency(Math.abs(totalDifference), 'USD')}
            </div>
            <div className={`text-muted-foreground ${isMobile ? "text-[10px]" : "text-sm"}`}>
              {isOutperforming ? '+' : ''}{performancePercentage.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Performance Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}>
              {isOutperforming ? 'Sovraperformance' : 'Sottoperformance'}
            </span>
            <div className="flex items-center gap-1.5">
              {isOutperforming ? (
                <TrendingUp className={`text-green-600 ${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
              ) : (
                <TrendingDown className={`text-red-600 ${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
              )}
              <span className={`font-medium ${isMobile ? "text-xs" : "text-sm"} ${
                isOutperforming ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(performancePercentage).toFixed(1)}%
              </span>
            </div>
          </div>
          
          <Progress 
            value={Math.min(Math.abs(performancePercentage), 100)} 
            className={`h-2 ${isOutperforming ? 'bg-green-100' : 'bg-red-100'}`}
          />
          
          {!isMobile && (
            <div className="text-xs text-muted-foreground text-center">
              {isOutperforming 
                ? `La tua strategia sta performando ${performancePercentage.toFixed(2)}% meglio del previsto`
                : `La tua strategia sta sottoperformando di ${Math.abs(performancePercentage).toFixed(2)}%`
              }
            </div>
          )}
        </div>

        {/* Additional Metrics */}
        <div className={`grid grid-cols-2 gap-3 border-t ${isMobile ? "pt-3" : "pt-4 gap-4"}`}>
          <div className="text-center">
            <div className={`font-semibold text-foreground ${isMobile ? "text-base" : "text-lg"}`}>
              {accuracy.toFixed(0)}%
            </div>
            <div className={`text-muted-foreground ${isMobile ? "text-[10px]" : "text-sm"}`}>Accuratezza</div>
          </div>
          
          <div className="text-center">
            <div className={`font-semibold ${isMobile ? "text-base" : "text-lg"} ${
              avgSlippage >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {avgSlippage >= 0 ? '+' : ''}{avgSlippage.toFixed(1)}%
            </div>
            <div className={`text-muted-foreground ${isMobile ? "text-[10px]" : "text-sm"}`}>Slippage</div>
          </div>
        </div>

        {/* Quick Summary - Hidden on mobile for cleaner view */}
        {!isMobile && (
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-2">Riepilogo:</div>
            <div className="text-sm space-y-1">
              <div>• {totalTrades} operazioni registrate</div>
              <div>• {accuracy > 80 ? 'Alta' : accuracy > 60 ? 'Media' : 'Bassa'} accuratezza della strategia</div>
              <div>• {isOutperforming ? 'Sovraperformance' : 'Sottoperformance'} di {Math.abs(performancePercentage).toFixed(2)}%</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};