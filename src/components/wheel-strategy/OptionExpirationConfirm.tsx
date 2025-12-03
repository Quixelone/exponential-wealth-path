import { useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Bell, Check, X, AlertTriangle } from 'lucide-react';

interface OptionTrade {
  id: string;
  option_type: 'SELL_PUT' | 'COVERED_CALL';
  strike_price_usd: number;
  expiration_date: string;
  duration_days: number;
  capital_employed_usdt: number;
  premium_usdt: number;
  apy_equivalent: number;
}

interface OptionExpirationConfirmProps {
  trade: OptionTrade;
  currentBtcPrice: number;
  onConfirm: (isAssigned: boolean) => Promise<void>;
  onCancel: () => void;
}

export default function OptionExpirationConfirm({
  trade,
  currentBtcPrice,
  onConfirm,
  onCancel,
}: OptionExpirationConfirmProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAssignment, setPendingAssignment] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calcolo pre-analisi: l'opzione è stata assegnata?
  const analysis = useMemo(() => {
    const isPut = trade.option_type === 'SELL_PUT';
    
    // PUT: assegnato se prezzo <= strike
    // CALL: assegnato se prezzo >= strike
    const isAssigned = isPut 
      ? currentBtcPrice <= trade.strike_price_usd
      : currentBtcPrice >= trade.strike_price_usd;
    
    const btcReceived = isAssigned 
      ? trade.capital_employed_usdt / trade.strike_price_usd 
      : 0;

    const priceRelation = isPut
      ? (currentBtcPrice > trade.strike_price_usd ? 'above' : 'below')
      : (currentBtcPrice >= trade.strike_price_usd ? 'above' : 'below');

    return {
      isAssigned,
      btcReceived,
      priceRelation,
      isPut,
    };
  }, [trade, currentBtcPrice]);

  const formatUsd = useCallback((value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const formatUsdt = useCallback((value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + ' USDT';
  }, []);

  const handleConfirmClick = useCallback((isAssigned: boolean) => {
    // Se l'utente sceglie l'opzione OPPOSTA alla pre-analisi, mostra modal
    if (isAssigned !== analysis.isAssigned) {
      setPendingAssignment(isAssigned);
      setShowConfirmModal(true);
    } else {
      // Conferma diretta
      handleSubmit(isAssigned);
    }
  }, [analysis.isAssigned]);

  const handleSubmit = useCallback(async (isAssigned: boolean) => {
    setIsSubmitting(true);
    try {
      await onConfirm(isAssigned);
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  }, [onConfirm]);

  const getDurationLabel = (days: number) => {
    if (days === 1) return '1D';
    if (days === 2) return '2D';
    if (days === 7) return '1W';
    return `${days}D`;
  };

  return (
    <div className="bg-[#0a0b0d] min-h-full p-4 space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#f7931a]/20">
            <Bell className="text-[#f7931a]" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white font-['DM_Sans']">Opzione Scaduta</h2>
            <p className="text-sm text-gray-400 font-['DM_Sans']">
              {format(new Date(trade.expiration_date), "d MMMM yyyy", { locale: it })}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 rounded-lg bg-[#1a1d24] text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Status Card */}
      <div 
        className={`rounded-xl overflow-hidden border-l-4 ${
          analysis.isAssigned ? 'border-l-[#ef4444]' : 'border-l-[#22c55e]'
        }`}
      >
        <div className="bg-[#22262f] p-4 space-y-4">
          {/* Tipo opzione */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 font-['DM_Sans']">
              {trade.option_type === 'SELL_PUT' ? 'PUT' : 'COVERED CALL'} {formatUsd(trade.strike_price_usd)} ({getDurationLabel(trade.duration_days)})
            </span>
          </div>

          {/* Confronto visuale */}
          <div className="grid grid-cols-3 gap-2 items-center">
            <div className="text-center p-3 rounded-lg bg-[#1a1d24]">
              <p className="text-xs text-gray-500 font-['DM_Sans'] mb-1">Strike</p>
              <p className="text-lg font-semibold text-white font-['JetBrains_Mono']">
                {formatUsd(trade.strike_price_usd)}
              </p>
            </div>
            <div className="text-center">
              <span className="text-gray-500 text-2xl">vs</span>
            </div>
            <div className="text-center p-3 rounded-lg bg-[#1a1d24]">
              <p className="text-xs text-gray-500 font-['DM_Sans'] mb-1">Prezzo BTC</p>
              <p className="text-lg font-semibold text-[#f7931a] font-['JetBrains_Mono']">
                {formatUsd(currentBtcPrice)}
              </p>
            </div>
          </div>

          {/* Badge risultato */}
          <div 
            className={`flex items-center gap-2 p-3 rounded-lg ${
              analysis.isAssigned 
                ? 'bg-[#ef4444]/10 border border-[#ef4444]/30' 
                : 'bg-[#22c55e]/10 border border-[#22c55e]/30'
            }`}
          >
            {analysis.isAssigned ? (
              <>
                <AlertTriangle className="text-[#ef4444]" size={18} />
                <span className="text-[#ef4444] font-medium font-['DM_Sans'] text-sm">
                  ⚠️ {analysis.priceRelation === 'below' ? 'Sotto' : 'Sopra'} strike → ASSEGNATO
                </span>
              </>
            ) : (
              <>
                <Check className="text-[#22c55e]" size={18} />
                <span className="text-[#22c55e] font-medium font-['DM_Sans'] text-sm">
                  ✅ {analysis.priceRelation === 'above' ? 'Sopra' : 'Sotto'} strike → NON assegnato
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dettagli */}
      <div className="bg-[#1a1d24] rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-medium text-gray-400 font-['DM_Sans']">Dettagli</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 font-['DM_Sans']">Capitale impiegato</span>
            <span className="text-sm text-white font-['JetBrains_Mono']">
              {formatUsdt(trade.capital_employed_usdt)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 font-['DM_Sans']">Premium guadagnato</span>
            <span className="text-sm text-[#22c55e] font-['JetBrains_Mono']">
              +{formatUsdt(trade.premium_usdt)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 font-['DM_Sans']">APY equivalente</span>
            <span className="text-sm text-white font-['JetBrains_Mono']">
              {trade.apy_equivalent.toFixed(1)}%
            </span>
          </div>
          {analysis.isAssigned && (
            <div className="flex justify-between items-center pt-2 border-t border-[#2a2d34]">
              <span className="text-sm text-gray-500 font-['DM_Sans']">BTC ricevuti</span>
              <span className="text-sm text-[#f7931a] font-semibold font-['JetBrains_Mono']">
                {analysis.btcReceived.toFixed(6)} BTC
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottoni Azione */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleConfirmClick(false)}
          disabled={isSubmitting}
          className={`py-4 px-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all font-['DM_Sans'] ${
            !analysis.isAssigned
              ? 'bg-[#22c55e] text-white ring-2 ring-[#22c55e]/50'
              : 'bg-[#22c55e]/20 text-[#22c55e] hover:bg-[#22c55e]/30'
          } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Check size={18} />
          <span className="leading-tight">Confermo: Non Assegnato</span>
        </button>
        <button
          onClick={() => handleConfirmClick(true)}
          disabled={isSubmitting}
          className={`py-4 px-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all font-['DM_Sans'] ${
            analysis.isAssigned
              ? 'bg-[#ef4444] text-white ring-2 ring-[#ef4444]/50'
              : 'bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30'
          } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <X size={18} />
          <span className="leading-tight">Ero Assegnato</span>
        </button>
      </div>

      {/* Modal di conferma */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#1a1d24] rounded-2xl p-5 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#f7931a]/20">
                <AlertTriangle className="text-[#f7931a]" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white font-['DM_Sans']">Sei sicuro?</h3>
            </div>
            
            <p className="text-sm text-gray-300 font-['DM_Sans'] leading-relaxed">
              Il prezzo BTC (<span className="text-[#f7931a] font-['JetBrains_Mono']">{formatUsd(currentBtcPrice)}</span>) era{' '}
              <span className="font-medium">
                {analysis.priceRelation === 'above' ? 'SOPRA' : 'SOTTO'}
              </span>{' '}
              lo strike (<span className="font-['JetBrains_Mono']">{formatUsd(trade.strike_price_usd)}</span>), 
              quindi normalmente{' '}
              <span className="font-medium">
                {analysis.isAssigned ? 'saresti stato assegnato' : 'non saresti stato assegnato'}
              </span>.
              <br /><br />
              Vuoi confermare comunque?
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="py-3 px-4 rounded-xl bg-[#2a2d34] text-gray-300 font-medium text-sm hover:bg-[#353840] transition-colors font-['DM_Sans']"
              >
                Annulla
              </button>
              <button
                onClick={() => handleSubmit(pendingAssignment!)}
                disabled={isSubmitting}
                className={`py-3 px-4 rounded-xl font-medium text-sm transition-all font-['DM_Sans'] ${
                  pendingAssignment
                    ? 'bg-[#ef4444] text-white hover:bg-[#dc2626]'
                    : 'bg-[#22c55e] text-white hover:bg-[#16a34a]'
                } ${isSubmitting ? 'opacity-50' : ''}`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  `Sì, ${pendingAssignment ? 'ero assegnato' : 'non assegnato'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
