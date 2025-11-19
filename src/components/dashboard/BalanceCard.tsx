import React from 'react';
import { ArrowUpRight, ArrowDownRight, Plus, Edit3, Wallet } from 'lucide-react';
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
        "relative overflow-hidden rounded-2xl p-6 bg-card border border-border/50",
        "transition-all duration-200 hover:-translate-y-0.5",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Capitale Totale</p>
            <p className="text-xs text-muted-foreground/60">Current Portfolio Value</p>
          </div>
        </div>
        
        {strategies && strategies.length > 0 && onStrategyChange && (
          <Select value={currentStrategy} onValueChange={onStrategyChange}>
            <SelectTrigger className="w-32 h-8 bg-secondary border-border/50">
              <SelectValue placeholder="Strategy" />
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

      <div className="space-y-3">
        <div className="flex items-baseline gap-2">
          <AnimatedCounter
            end={currentCapital}
            prefix={currency === 'EUR' ? '€' : '$'}
            decimals={2}
            className="text-3xl font-bold text-foreground"
            duration={1.5}
          />
          <div
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold",
              isPositive
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {isPositive ? '+' : ''}{profitPercentage.toFixed(2)}%
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {isPositive ? '+' : ''}{formatCurrency(totalProfit, currency)} this month
        </p>

        <div className="flex gap-2 pt-2">
          {onAddPAC && (
            <Button
              onClick={onAddPAC}
              size="sm"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-9"
            >
              <Plus className="h-4 w-4 mr-1" />
              Aggiungi PAC
            </Button>
          )}
          {onEditStrategy && (
            <Button
              onClick={onEditStrategy}
              size="sm"
              variant="outline"
              className="flex-1 border-border/50 h-9"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Modifica
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
