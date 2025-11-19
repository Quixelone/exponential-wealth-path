import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
        <div className="bg-card border border-border/50 p-3 rounded-lg shadow-lg">
          <p className="text-xs font-semibold mb-2 text-foreground">Giorno {label}</p>
          <div className="space-y-1">
            <p className="text-xs flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Capitale:</span>
              <span className="font-bold text-primary">
                {formatCurrency(payload[0].value, currency)}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl p-6 bg-card border border-border/50">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold text-foreground">
              Revenue
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            This month vs last
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={isMobile ? 280 : 340}>
        <BarChart 
          data={data}
          margin={isMobile 
            ? { top: 5, right: 5, left: -20, bottom: 5 }
            : { top: 10, right: 10, left: -10, bottom: 10 }
          }
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={1}/>
              <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.6}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))" 
            opacity={0.1}
            vertical={false}
          />
          
          <XAxis 
            dataKey="day"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
          />
          
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
              return value.toString();
            }}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--primary) / 0.1)' }} />
          
          <Bar
            dataKey="finalCapital"
            fill="url(#barGradient)"
            radius={[8, 8, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
