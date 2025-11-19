import React from 'react';
import { Wallet, Plus, Edit3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AnimatedCounter } from '@/components/investor-pitch/shared/AnimatedCounter';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, Currency, cn } from '@/lib/utils';

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
      "relative overflow-hidden rounded-2xl p-6 bg-card border border-white/5",
      className
    )}>
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-violet/5 to-transparent pointer-events-none" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* Icon circle with gradient */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-violet flex items-center justify-center">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Capitale Totale</p>
              <p className="text-xs text-gray-500">Current Portfolio Value</p>
            </div>
          </div>
          
          {/* Strategy selector */}
          {strategies.length > 0 && onStrategyChange && (
            <Select value={currentStrategy} onValueChange={onStrategyChange}>
              <SelectTrigger className="w-36 h-9 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Seleziona strategia" />
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
        
        {/* Main value */}
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-bold text-white">
              <AnimatedCounter
                end={currentCapital}
                prefix={currency === 'EUR' ? '€' : '$'}
                decimals={2}
                duration={1.2}
              />
            </div>
            
            {/* Pill badge colorato */}
            <span className={cn(
              "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold",
              isPositive ? "badge-success" : "badge-danger"
            )}>
              {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {profitPercentage.toFixed(2)}%
            </span>
          </div>
          
          <p className="text-sm text-gray-400">
            {isPositive ? '+' : ''}{formatCurrency(totalProfit, currency)} this month
          </p>
          
          {/* Buttons moderni */}
          {(onAddPAC || onEditStrategy) && (
            <div className="flex gap-2 pt-3">
              {onAddPAC && (
                <Button 
                  onClick={onAddPAC} 
                  size="sm" 
                  className="flex-1 bg-primary hover:bg-primary/90 h-10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi PAC
                </Button>
              )}
              {onEditStrategy && (
                <Button 
                  onClick={onEditStrategy} 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 border-white/10 h-10"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Modifica
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
