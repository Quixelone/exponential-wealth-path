import React from 'react';
import { ArrowUpRight, ArrowDownRight, Plus, Edit3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedCounter } from '@/components/investor-pitch/shared/AnimatedCounter';
import { cn, formatCurrency, Currency } from '@/lib/utils';
import { use3DTilt } from '@/hooks/use3DTilt';
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
  const { ref, isHovering } = use3DTilt({
    max: 10,
    scale: 1.02,
    speed: 400,
  });

  return (
    <div 
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "transition-all duration-500 ease-out",
        "transform-gpu will-change-transform",
        className
      )}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Premium Gradient Background with Animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--gradient-purple-start))] via-[hsl(var(--gradient-purple-mid))] to-[hsl(var(--gradient-cyan-end))] opacity-90" />
      
      {/* Animated Mesh Overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 animate-gradient-x bg-gradient-to-r from-transparent via-white/20 to-transparent" 
             style={{ backgroundSize: '200% 100%' }} />
      </div>

      {/* Glassmorphism Layer */}
      <div className="absolute inset-0 backdrop-blur-xl bg-white/5" />

      {/* Floating Particles Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-cyan-300/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Glow Effect on Hover */}
      <div 
        className={cn(
          "absolute inset-0 rounded-2xl transition-opacity duration-500",
          "bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20",
          "blur-xl",
          isHovering ? "opacity-100" : "opacity-0"
        )}
        style={{ transform: 'translateZ(-10px)' }}
      />

      {/* Content */}
      <div 
        className="relative z-10 p-6 md:p-8"
        style={{ transform: 'translateZ(20px)' }}
      >
        <div className="space-y-6">
          {/* Header with Strategy Selector */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-white/60 animate-pulse" />
                <p className="text-white/70 text-sm font-medium tracking-wide uppercase">
                  Capitale Totale
                </p>
              </div>
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

            {strategies.length > 0 && (
              <Select value={currentStrategy} onValueChange={onStrategyChange}>
                <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white backdrop-blur-md hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <SelectValue placeholder="Strategia" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-xl bg-purple-900/90 border-white/20">
                  {strategies.map((strategy) => (
                    <SelectItem 
                      key={strategy.id} 
                      value={strategy.id}
                      className="text-white hover:bg-white/20"
                    >
                      {strategy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Profit/Loss Indicator with Animation */}
          <div className="flex items-center gap-3">
            <div 
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-full",
                "backdrop-blur-md transition-all duration-300",
                "transform hover:scale-105",
                isPositive 
                  ? "bg-emerald-400/20 text-emerald-50 ring-1 ring-emerald-400/30"
                  : "bg-red-400/20 text-red-50 ring-1 ring-red-400/30"
              )}
            >
              {/* Glow effect */}
              <div className={cn(
                "absolute inset-0 rounded-full blur-md opacity-50",
                isPositive ? "bg-emerald-400/30" : "bg-red-400/30"
              )} />
              
              <div className="relative flex items-center gap-2">
                {isPositive ? (
                  <ArrowUpRight className="h-5 w-5 animate-pulse" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 animate-pulse" />
                )}
                <span className="text-base font-bold tabular-nums">
                  {profitPercentage > 0 ? '+' : ''}{profitPercentage.toFixed(2)}%
                </span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-white/90 text-lg font-semibold tabular-nums">
                {isPositive ? '+' : ''}{formatCurrency(totalProfit, currency)}
              </span>
              <span className="text-white/50 text-xs">
                Profitto {isPositive ? 'Attuale' : 'Corrente'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {onAddPAC && (
              <Button
                onClick={onAddPAC}
                className={cn(
                  "flex-1 bg-white/10 hover:bg-white/20 text-white",
                  "backdrop-blur-md border border-white/20",
                  "transition-all duration-300 hover:scale-105",
                  "hover:shadow-lg hover:shadow-white/20"
                )}
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi PAC
              </Button>
            )}
            
            {onEditStrategy && (
              <Button
                onClick={onEditStrategy}
                className={cn(
                  "flex-1 bg-white/10 hover:bg-white/20 text-white",
                  "backdrop-blur-md border border-white/20",
                  "transition-all duration-300 hover:scale-105",
                  "hover:shadow-lg hover:shadow-white/20"
                )}
                size="lg"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Modifica
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Shine Effect on Hover */}
      <div 
        className={cn(
          "absolute inset-0 transition-opacity duration-500 pointer-events-none",
          "bg-gradient-to-r from-transparent via-white/10 to-transparent",
          "-translate-x-full",
          isHovering && "animate-shimmer"
        )}
      />
    </div>
  );
};
