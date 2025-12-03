import { useMemo } from 'react';
import { format, formatDistanceToNow, differenceInHours, differenceInMinutes } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Award, 
  BarChart3, 
  Bitcoin, 
  Clock, 
  AlertTriangle,
  Plus,
  RefreshCw,
  Info
} from 'lucide-react';
import { useRealtimeBtcPrice } from '@/hooks/useRealtimeBtcPrice';
import { useBtcPosition, type BtcPositionData } from '@/hooks/useBtcPosition';
import { useActiveOption, type ActiveOptionData } from '@/hooks/useActiveOption';

interface PnLDashboardProps {
  configId: string;
  userId: string;
  initialCapital?: number;
  currency?: 'EUR' | 'USD' | 'USDT';
  onNewOption?: () => void;
  onConfirmExpiration?: (option: ActiveOptionData) => void;
}

export default function PnLDashboard({
  configId,
  userId,
  initialCapital = 0,
  currency = 'USDT',
  onNewOption,
  onConfirmExpiration,
}: PnLDashboardProps) {
  const { price: btcPrice, change24h, lastUpdated, isLoading: priceLoading, refetch: refetchPrice } = useRealtimeBtcPrice(30000);
  const { position, hasPosition, isLoading: positionLoading, refetch: refetchPosition } = useBtcPosition(configId, 60000);
  const { option, hasActiveOption, needsConfirmation, isLoading: optionLoading } = useActiveOption(configId, 60000);

  // Calcoli derivati
  const calculations = useMemo(() => {
    if (!position) {
      return {
        totalCapital: initialCapital,
        capitalChange: 0,
        capitalChangePercent: 0,
        unrealizedPnL: 0,
        unrealizedPnLPercent: 0,
        breakEvenProgress: 0,
        btcValue: 0,
      };
    }

    const btcValue = (position.btc_quantity || 0) * btcPrice;
    const premiumEarned = position.total_premium_earned_usdt || 0;
    const totalCapital = initialCapital + premiumEarned + btcValue;
    const capitalChange = totalCapital - initialCapital;
    const capitalChangePercent = initialCapital > 0 ? (capitalChange / initialCapital) * 100 : 0;

    // Unrealized P&L
    const avgCost = position.avg_cost_basis_usd || 0;
    const btcQuantity = position.btc_quantity || 0;
    const costBasis = avgCost * btcQuantity;
    const unrealizedPnL = btcValue - costBasis;
    const unrealizedPnLPercent = costBasis > 0 ? (unrealizedPnL / costBasis) * 100 : 0;

    // Break-even progress
    const lastFillPrice = position.last_fill_price_usd || avgCost;
    let breakEvenProgress = 0;
    if (avgCost > 0 && btcPrice > lastFillPrice) {
      breakEvenProgress = Math.min(((btcPrice - lastFillPrice) / (avgCost - lastFillPrice)) * 100, 100);
      if (btcPrice >= avgCost) breakEvenProgress = 100;
    }

    return {
      totalCapital,
      capitalChange,
      capitalChangePercent,
      unrealizedPnL,
      unrealizedPnLPercent,
      breakEvenProgress: Math.max(0, breakEvenProgress),
      btcValue,
    };
  }, [position, btcPrice, initialCapital]);

  // Countdown per opzione attiva
  const expirationCountdown = useMemo(() => {
    if (!option?.expiration_date) return null;
    
    const expDate = new Date(option.expiration_date + 'T08:00:00Z');
    const now = new Date();
    const hoursLeft = differenceInHours(expDate, now);
    const minutesLeft = differenceInMinutes(expDate, now) % 60;
    
    if (hoursLeft < 0) return 'Scaduta';
    if (hoursLeft < 24) return `${hoursLeft}h ${minutesLeft}m`;
    return formatDistanceToNow(expDate, { locale: it, addSuffix: true });
  }, [option]);

  const formatCurrency = (value: number, curr: string = currency) => {
    const symbol = curr === 'EUR' ? '€' : curr === 'USDT' ? '' : '$';
    const suffix = curr === 'USDT' ? ' USDT' : '';
    return `${symbol}${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}${suffix}`;
  };

  const formatUsd = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleRefresh = () => {
    refetchPrice();
    refetchPosition();
  };

  const isLoading = priceLoading || positionLoading || optionLoading;

  return (
    <div className="space-y-4">
      {/* Header con ultimo aggiornamento */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white font-['DM_Sans']">Dashboard P&L</h2>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {lastUpdated && (
            <span className="font-['DM_Sans']">
              Ultimo agg: {format(lastUpdated, 'HH:mm')}
            </span>
          )}
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg hover:bg-[#1a1d24] transition-colors"
            disabled={isLoading}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Row Statistiche Principali */}
      <div className="grid grid-cols-3 gap-3">
        {/* Card Capitale Totale */}
        <div className="bg-[#1a1d24] rounded-xl p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400 font-['DM_Sans']">Capitale Totale</span>
          </div>
          <p className="text-xl font-bold text-white font-['JetBrains_Mono']">
            {formatCurrency(calculations.totalCapital)}
          </p>
          <div className={`flex items-center gap-1 mt-1 text-xs ${
            calculations.capitalChangePercent >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'
          }`}>
            {calculations.capitalChangePercent >= 0 ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            <span className="font-['JetBrains_Mono']">
              {calculations.capitalChangePercent >= 0 ? '+' : ''}{calculations.capitalChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Card Premium Totali */}
        <div className="bg-[#1a1d24] rounded-xl p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center gap-2 mb-2">
            <Award size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400 font-['DM_Sans']">Premium Totali</span>
          </div>
          <p className="text-xl font-bold text-[#22c55e] font-['JetBrains_Mono']">
            +{formatCurrency(position?.total_premium_earned_usdt || 0, 'USDT')}
          </p>
          <p className="text-xs text-gray-500 mt-1 font-['DM_Sans']">
            {position?.total_trades_count || 0} trade completati
          </p>
        </div>

        {/* Card Unrealized P&L */}
        <div className="bg-[#1a1d24] rounded-xl p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group relative">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400 font-['DM_Sans']">Unrealized P&L</span>
            <div className="relative">
              <Info size={12} className="text-gray-600 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#2a2d34] rounded-lg text-xs text-gray-300 w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Differenza tra valore BTC attuale e prezzo medio di carico
              </div>
            </div>
          </div>
          <p className={`text-xl font-bold font-['JetBrains_Mono'] ${
            calculations.unrealizedPnL >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'
          }`}>
            {calculations.unrealizedPnL >= 0 ? '+' : ''}{formatCurrency(calculations.unrealizedPnL, 'USD')}
          </p>
          <p className={`text-xs mt-1 font-['JetBrains_Mono'] ${
            calculations.unrealizedPnLPercent >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'
          }`}>
            {calculations.unrealizedPnLPercent >= 0 ? '+' : ''}{calculations.unrealizedPnLPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Card Posizione BTC */}
      <div className="bg-[#1a1d24] rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bitcoin size={20} className="text-[#f7931a]" />
            <span className="font-medium text-white font-['DM_Sans']">Posizione BTC</span>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            hasPosition 
              ? 'bg-[#f7931a]/20 text-[#f7931a]' 
              : 'bg-gray-700/50 text-gray-400'
          }`}>
            {hasPosition ? 'HOLDING' : 'NO POSITION'}
          </span>
        </div>

        {hasPosition && position ? (
          <>
            {/* Grid 2x2 */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#0a0b0d] rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1 font-['DM_Sans']">Quantità</p>
                <p className="text-lg font-semibold text-white font-['JetBrains_Mono']">
                  {(position.btc_quantity || 0).toFixed(6)} BTC
                </p>
              </div>
              <div className="bg-[#0a0b0d] rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1 font-['DM_Sans']">Prezzo Medio</p>
                <p className="text-lg font-semibold text-white font-['JetBrains_Mono']">
                  {formatUsd(position.avg_cost_basis_usd || 0)}
                </p>
              </div>
              <div className="bg-[#0a0b0d] rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1 font-['DM_Sans']">Ultimo Fill</p>
                <p className="text-base font-semibold text-white font-['JetBrains_Mono']">
                  {formatUsd(position.last_fill_price_usd || 0)}
                </p>
                {position.last_fill_date && (
                  <p className="text-xs text-gray-500 font-['DM_Sans']">
                    {format(new Date(position.last_fill_date), 'd MMM', { locale: it })}
                  </p>
                )}
              </div>
              <div className="bg-[#0a0b0d] rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1 font-['DM_Sans']">Prezzo Attuale</p>
                <p className={`text-lg font-semibold font-['JetBrains_Mono'] ${
                  btcPrice >= (position.avg_cost_basis_usd || 0) ? 'text-[#22c55e]' : 'text-[#ef4444]'
                }`}>
                  {formatUsd(btcPrice)}
                </p>
              </div>
            </div>

            {/* Progress bar Break-even */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-['DM_Sans']">Break-even</span>
                <span className={`font-medium font-['DM_Sans'] ${
                  calculations.breakEvenProgress >= 100 ? 'text-[#22c55e]' : 'text-gray-300'
                }`}>
                  {calculations.breakEvenProgress >= 100 
                    ? 'Break-even raggiunto! ✓' 
                    : `${calculations.breakEvenProgress.toFixed(0)}% recuperato`
                  }
                </span>
              </div>
              <div className="h-2 bg-[#0a0b0d] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[#f7931a] to-[#22c55e] transition-all duration-500"
                  style={{ width: `${calculations.breakEvenProgress}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 font-['DM_Sans']">Nessuna posizione BTC attiva</p>
            <p className="text-xs text-gray-600 mt-1 font-['DM_Sans']">
              Le posizioni vengono create quando un'opzione PUT viene assegnata
            </p>
          </div>
        )}
      </div>

      {/* Sezione Azioni Rapide */}
      <div className="space-y-3">
        {/* Opzione Attiva */}
        {hasActiveOption && option && (
          <div className="bg-[#1a1d24] rounded-xl p-4 border border-[#f7931a]/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#f7931a]" />
                <span className="font-medium text-white font-['DM_Sans']">Opzione Attiva</span>
              </div>
              <span className="text-sm text-[#f7931a] font-['JetBrains_Mono']">
                {expirationCountdown}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 font-['DM_Sans']">
                {option.option_type === 'SELL_PUT' ? 'PUT' : 'CALL'} {formatUsd(option.strike_price_usd)}
              </span>
              <span className="text-[#22c55e] font-['JetBrains_Mono']">
                +{option.premium_usdt.toFixed(2)} USDT
              </span>
            </div>
          </div>
        )}

        {/* Conferma Richiesta */}
        {needsConfirmation && option && (
          <button
            onClick={() => onConfirmExpiration?.(option)}
            className="w-full bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl p-4 flex items-center justify-between hover:bg-[#ef4444]/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-[#ef4444]" size={20} />
              <div className="text-left">
                <p className="font-medium text-[#ef4444] font-['DM_Sans']">⚠️ Conferma richiesta</p>
                <p className="text-xs text-gray-400 font-['DM_Sans']">
                  {option.option_type === 'SELL_PUT' ? 'PUT' : 'CALL'} {formatUsd(option.strike_price_usd)} scaduta
                </p>
              </div>
            </div>
            <span className="text-sm text-[#ef4444] font-['DM_Sans']">Conferma →</span>
          </button>
        )}

        {/* Bottone Nuova Opzione */}
        <button
          onClick={onNewOption}
          disabled={hasActiveOption}
          className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all font-['DM_Sans'] ${
            hasActiveOption
              ? 'bg-[#1a1d24] text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#f7931a] to-[#ff9f43] text-white hover:from-[#e8850f] hover:to-[#f0903a] active:scale-[0.98]'
          }`}
        >
          <Plus size={20} />
          Nuova Opzione
        </button>
      </div>
    </div>
  );
}

// Re-export hooks for external use
export { useRealtimeBtcPrice } from '@/hooks/useRealtimeBtcPrice';
export { useBtcPosition } from '@/hooks/useBtcPosition';
export { useActiveOption } from '@/hooks/useActiveOption';
