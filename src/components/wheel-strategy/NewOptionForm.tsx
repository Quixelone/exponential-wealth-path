import { useState, useMemo } from 'react';
import { format, addDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { Check, X } from 'lucide-react';

interface OptionTradeData {
  option_type: 'SELL_PUT' | 'COVERED_CALL';
  strike_price_usd: number;
  expiration_date: string;
  duration_days: number;
  capital_employed_usdt: number;
  premium_percentage: number;
  premium_usdt: number;
  apy_equivalent: number;
  status: 'OPEN';
  config_id: string;
  user_id: string;
}

interface NewOptionFormProps {
  configId: string;
  userId: string;
  availableStrikes: number[];
  defaultCapital: number;
  currentBtcPrice: number;
  onSubmit: (data: OptionTradeData) => Promise<void>;
  onCancel: () => void;
}

const DURATION_OPTIONS = [
  { label: '1 Giorno', value: 1 },
  { label: '2 Giorni', value: 2 },
  { label: '1 Settimana', value: 7 },
];

export default function NewOptionForm({
  configId,
  userId,
  availableStrikes,
  defaultCapital,
  currentBtcPrice,
  onSubmit,
  onCancel,
}: NewOptionFormProps) {
  const [optionType, setOptionType] = useState<'SELL_PUT' | 'COVERED_CALL'>('SELL_PUT');
  const [selectedStrike, setSelectedStrike] = useState<number | null>(availableStrikes[0] || null);
  const [duration, setDuration] = useState(1);
  const [capital, setCapital] = useState(defaultCapital);
  const [apy, setApy] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calcoli derivati
  const calculations = useMemo(() => {
    const premiumUsdt = (capital * (apy / 100) * duration) / 365;
    const btcIfAssigned = selectedStrike ? capital / selectedStrike : 0;
    const expirationDate = addDays(new Date(), duration);
    const premiumPercentage = capital > 0 ? (premiumUsdt / capital) * 100 : 0;

    return {
      premiumUsdt,
      btcIfAssigned,
      expirationDate,
      premiumPercentage,
    };
  }, [capital, apy, duration, selectedStrike]);

  const formatUsd = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatUsdt = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + ' USDT';
  };

  const handleSubmit = async () => {
    if (!selectedStrike || apy <= 0 || capital <= 0) return;

    setIsSubmitting(true);
    try {
      const data: OptionTradeData = {
        option_type: optionType,
        strike_price_usd: selectedStrike,
        expiration_date: format(calculations.expirationDate, 'yyyy-MM-dd'),
        duration_days: duration,
        capital_employed_usdt: capital,
        premium_percentage: calculations.premiumPercentage,
        premium_usdt: calculations.premiumUsdt,
        apy_equivalent: apy,
        status: 'OPEN',
        config_id: configId,
        user_id: userId,
      };
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = selectedStrike && apy > 0 && capital > 0;

  return (
    <div className="bg-[#0a0b0d] min-h-full p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white font-['DM_Sans']">Nuova Opzione</h2>
          <p className="text-sm text-gray-400 font-['DM_Sans']">
            {format(new Date(), "d MMMM yyyy", { locale: it })}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 rounded-lg bg-[#1a1d24] text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Tipo Opzione */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400 font-['DM_Sans']">Tipo Opzione</label>
        <div className="grid grid-cols-2 gap-2">
          {(['SELL_PUT', 'COVERED_CALL'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setOptionType(type)}
              className={`py-3 px-4 rounded-lg font-medium text-sm transition-all font-['DM_Sans'] ${
                optionType === type
                  ? 'bg-[#f7931a] text-white'
                  : 'bg-[#1a1d24] text-gray-300 hover:bg-[#252830]'
              }`}
            >
              {type === 'SELL_PUT' ? 'SELL PUT' : 'COVERED CALL'}
            </button>
          ))}
        </div>
      </div>

      {/* Strike Price */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400 font-['DM_Sans']">Strike Price</label>
        <div className="grid grid-cols-3 gap-2">
          {availableStrikes.map((strike) => (
            <button
              key={strike}
              onClick={() => setSelectedStrike(strike)}
              className={`py-2.5 px-3 rounded-lg font-medium text-sm transition-all font-['JetBrains_Mono'] ${
                selectedStrike === strike
                  ? 'bg-[#f7931a] text-white'
                  : 'bg-[#1a1d24] text-gray-300 hover:bg-[#252830]'
              }`}
            >
              {formatUsd(strike)}
            </button>
          ))}
        </div>
      </div>

      {/* Durata */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400 font-['DM_Sans']">Durata</label>
        <div className="grid grid-cols-3 gap-2">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDuration(opt.value)}
              className={`py-2.5 px-3 rounded-lg font-medium text-sm transition-all font-['DM_Sans'] ${
                duration === opt.value
                  ? 'bg-[#f7931a] text-white'
                  : 'bg-[#1a1d24] text-gray-300 hover:bg-[#252830]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Capitale e APY */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm text-gray-400 font-['DM_Sans']">Capitale (USDT)</label>
          <input
            type="number"
            value={capital}
            onChange={(e) => setCapital(Number(e.target.value))}
            className="w-full bg-[#1a1d24] border border-[#2a2d34] rounded-lg px-4 py-3 text-white font-['JetBrains_Mono'] text-sm focus:outline-none focus:border-[#f7931a] transition-colors"
            placeholder="10000"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-400 font-['DM_Sans']">APY %</label>
          <input
            type="number"
            value={apy || ''}
            onChange={(e) => setApy(Number(e.target.value))}
            step="0.1"
            className="w-full bg-[#1a1d24] border border-[#2a2d34] rounded-lg px-4 py-3 text-white font-['JetBrains_Mono'] text-sm focus:outline-none focus:border-[#f7931a] transition-colors"
            placeholder="45.5"
          />
        </div>
      </div>

      {/* Preview Card */}
      <div className="bg-[#12151a] rounded-xl p-4 space-y-3 border border-[#1a1d24]">
        <h3 className="text-sm font-medium text-gray-400 font-['DM_Sans']">Anteprima</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 font-['DM_Sans']">Premium Stimato</p>
            <p className="text-lg font-semibold text-[#f7931a] font-['JetBrains_Mono']">
              {formatUsdt(calculations.premiumUsdt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-['DM_Sans']">BTC se Assegnato</p>
            <p className="text-lg font-semibold text-white font-['JetBrains_Mono']">
              {calculations.btcIfAssigned.toFixed(6)} BTC
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-[#1a1d24]">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-['DM_Sans']">Scadenza</span>
            <span className="text-sm text-white font-['DM_Sans']">
              {format(calculations.expirationDate, "d MMM yyyy, HH:mm", { locale: it })}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500 font-['DM_Sans']">BTC Attuale</span>
            <span className="text-sm text-gray-300 font-['JetBrains_Mono']">
              {formatUsd(currentBtcPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottone Conferma */}
      <button
        onClick={handleSubmit}
        disabled={!isFormValid || isSubmitting}
        className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all font-['DM_Sans'] ${
          isFormValid && !isSubmitting
            ? 'bg-gradient-to-r from-[#f7931a] to-[#ff9f43] hover:from-[#e8850f] hover:to-[#f0903a] active:scale-[0.98]'
            : 'bg-[#1a1d24] text-gray-500 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Check size={20} />
            Conferma Opzione
          </>
        )}
      </button>
    </div>
  );
}
