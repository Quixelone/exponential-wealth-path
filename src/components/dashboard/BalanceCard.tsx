import React from 'react';
import { ArrowUpRight, ArrowDownRight, Plus, Edit3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
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
    <div className={cn(
      "relative overflow-hidden rounded-xl p-6 md:p-8",
      "mesh-gradient glass-card border border-white/10",
      "text-white shadow-xl tilt-card",
      className
    )}>
      {/* Animated Mesh Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full shimmer" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header with Strategy Selector */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm font-medium mb-1">Capitale Totale</p>
            <div className="flex items-baseline gap-2">
              <AnimatedCounter
                end={currentCapital}
                prefix={currency === 'EUR' ? '€' : '$'}
                decimals={2}
                className="text-4xl md:text-5xl font-bold text-white"
              />
            </div>
          </div>

          {strategies.length > 0 && (
            <Select value={currentStrategy} onValueChange={onStrategyChange}>
              <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white backdrop-blur-sm hover:bg-white/20 transition-colors">
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

        {/* Profit/Loss Indicator */}
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold",
            isPositive 
              ? "bg-emerald-500/20 text-emerald-100 backdrop-blur-sm"
              : "bg-red-500/20 text-red-100 backdrop-blur-sm"
          )}>
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            <span>{profitPercentage > 0 ? '+' : ''}{profitPercentage.toFixed(2)}%</span>
          </div>
          <span className="text-white/80 text-sm">
            {isPositive ? '+' : ''}{formatCurrency(totalProfit, currency)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {onAddPAC && (
            <Button
              onClick={onAddPAC}
              variant="secondary"
              size="sm"
              className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 ripple"
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi PAC
            </Button>
          )}
          {onEditStrategy && (
            <Button
              onClick={onEditStrategy}
              variant="secondary"
              size="sm"
              className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 ripple"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Modifica Strategia
            </Button>
          )}
        </div>
      </div>
      
      {/* Glow Effect */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/30 rounded-full blur-3xl" />
    </div>
  );
};
