import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { InvestmentData } from '@/types/investment';
import { formatCurrency, Currency } from '@/lib/utils';
import { useDeviceInfo } from '@/hooks/use-mobile';
import { TrendingUp } from 'lucide-react';

interface EnhancedInvestmentChartProps {
  data: InvestmentData[];
  currency: Currency;
  currentDay?: number;
}

export const EnhancedInvestmentChart: React.FC<EnhancedInvestmentChartProps> = ({ 
  data, 
  currency,
  currentDay
}) => {
  const { isMobile } = useDeviceInfo();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-4 rounded-lg border border-border/50 shadow-xl">
          <p className="text-sm font-semibold mb-2">Giorno {label}</p>
          <div className="space-y-1">
            <p className="text-xs flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Capitale:</span>
              <span className="font-bold text-primary">
                {formatCurrency(payload[0].value, currency)}
              </span>
            </p>
            {payload[1] && (
              <p className="text-xs flex items-center justify-between gap-4">
                <span className="text-muted-foreground">PAC Investito:</span>
                <span className="font-semibold text-accent">
                  {formatCurrency(payload[1].value, currency)}
                </span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Evoluzione Capitale
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Crescita del tuo investimento nel tempo
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={isMobile ? 300 : 450}>
        <AreaChart 
          data={data}
          margin={isMobile 
            ? { top: 10, right: 5, left: 0, bottom: 30 }
            : { top: 20, right: 30, left: 20, bottom: 60 }
          }
        >
          <defs>
            {/* Primary Gradient for Capital */}
            <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
            </linearGradient>
            
            {/* Secondary Gradient for PAC */}
            <linearGradient id="colorPAC" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))" 
            opacity={0.2}
            vertical={false}
          />
          
          <XAxis 
            dataKey="day"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: isMobile ? 10 : 12, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: isMobile ? 10 : 12, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickFormatter={(value) => formatCurrency(value, currency, { decimals: 0 })}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* Current Day Reference Line */}
          {currentDay && (
            <ReferenceLine 
              x={currentDay} 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ 
                value: 'Oggi', 
                position: 'top',
                fill: "hsl(var(--primary))",
                fontSize: 12,
                fontWeight: 600
              }}
            />
          )}
          
          {/* PAC Invested Area */}
          <Area 
            type="monotone"
            dataKey="totalPACInvested"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            fill="url(#colorPAC)"
            name="PAC Investito"
            animationDuration={1500}
          />
          
          {/* Final Capital Area */}
          <Area 
            type="monotone"
            dataKey="finalCapital"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            fill="url(#colorCapital)"
            name="Capitale Totale"
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
