import React from 'react';
import { ArrowUpRight, ArrowDownRight, Plus, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedCounter } from '@/components/investor-pitch/shared/AnimatedCounter';
import { cn, formatCurrency, Currency } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BalanceCardProps {
  currentCapital: number;
  currency: Currency;
  totalProfit: number;
  profitPercentage: number;
  strategies?: Array<{ id: string; name: string }>;
  currentStrategy?: string;
  onStrategyChange?: (strategyId: string) => void;
  onAddPAC?: () => void;
  onEditStrategy?: () => void;
  className?: string;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  currentCapital,
  currency,
  totalProfit,
  profitPercentage,
  strategies = [],
  currentStrategy,
  onStrategyChange,
  onAddPAC,
  onEditStrategy,
  className
}) => {
  const isPositive = totalProfit >= 0;

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-[2rem] p-8",
        "transition-all duration-300 hover:shadow-card-lg hover:-translate-y-1",
        className
      )}
      style={{
        background: 'linear-gradient(135deg, #6C5DD3 0%, #8B7FE8 50%, #A594F9 100%)',
        boxShadow: '0 20px 40px rgba(108, 93, 211, 0.3)'
      }}
    >
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Content */}
      <div className="relative z-10 space-y-6">
        {/* Header with Strategy Selector */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-3">
              Capitale Totale
            </p>
            <div className="flex items-baseline gap-2">
              <AnimatedCounter
                end={currentCapital}
                prefix={currency === 'EUR' ? '€' : '$'}
                decimals={2}
                className="text-5xl md:text-6xl font-bold text-white tracking-tight"
                duration={2}
              />
            </div>
          </div>

          {/* Currency Toggle Pills */}
          {strategies && strategies.length > 0 && onStrategyChange && (
            <Select value={currentStrategy} onValueChange={onStrategyChange}>
              <SelectTrigger className="w-auto bg-white/20 border-white/30 text-white backdrop-blur-sm rounded-full px-4 h-10">
                <SelectValue placeholder="Strategia" />
              </SelectTrigger>
              <SelectContent>
                {strategies.map((strategy) => (
                  <SelectItem key={strategy.id} value={strategy.id}>
                    {strategy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Profit Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
          {isPositive ? (
            <ArrowUpRight className="h-4 w-4 text-white" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-white" />
          )}
          <span className="text-sm font-semibold text-white">
            {isPositive ? '+' : ''}{profitPercentage.toFixed(2)}%
          </span>
          <span className="text-white/70 text-sm">
            {formatCurrency(totalProfit, currency)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {onAddPAC && (
            <Button
              onClick={onAddPAC}
              className="bg-black text-white hover:bg-black/90 rounded-full px-6 h-11 font-semibold shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Aggiungi PAC
            </Button>
          )}
          {onEditStrategy && (
            <Button
              onClick={onEditStrategy}
              variant="ghost"
              className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm rounded-full px-6 h-11 border border-white/30"
            >
              <Edit3 className="h-4 w-4" />
              Modifica
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
