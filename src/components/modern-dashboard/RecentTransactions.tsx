import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useActualTrades } from '@/hooks/useActualTrades';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export const RecentTransactions = () => {
  const { trades } = useActualTrades({ configId: null });
  const navigate = useNavigate();

  // Get last 6 trades
  const recentTrades = trades.slice(-6).reverse();

  return (
    <div className="modern-card">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Ultime Operazioni
        </h3>
        <Button 
          variant="link" 
          className="text-primary hover:text-primary/80"
          onClick={() => navigate('/strategies')}
        >
          Vedi Tutte
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {recentTrades.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Nessuna operazione ancora</p>
            <p className="text-xs mt-1">Le tue operazioni appariranno qui</p>
          </div>
        ) : (
          recentTrades.map((trade) => {
            const isBuy = trade.trade_type === 'buy_spot' || trade.trade_type === 'spot';
            const profit = trade.premium_received_usdt || 0;
            const isProfit = profit > 0;

            return (
              <div
                key={trade.id}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors cursor-pointer"
              >
                {/* Icon Badge */}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  isBuy 
                    ? 'bg-[hsl(174,100%,42%)]/20 text-[hsl(174,100%,42%)]'
                    : 'bg-[hsl(340,82%,60%)]/20 text-[hsl(340,82%,60%)]'
                )}>
                  {isBuy ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground truncate">
                    {isBuy ? 'Acquisto' : 'Vendita'} BTC
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(trade.trade_date), 'dd MMM yyyy', { locale: it })}
                  </div>
                </div>

                {/* Amount */}
                <div className={cn(
                  "font-bold text-sm",
                  isProfit ? 'text-success' : 'text-muted-foreground'
                )}>
                  {isProfit ? '+' : ''}{formatCurrency(profit, 'USD')}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
