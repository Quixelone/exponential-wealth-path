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
        <div className="bg-gray-900 text-white p-4 rounded-xl shadow-modern border-0">
          <p className="text-sm font-semibold mb-2">Giorno {label}</p>
          <div className="space-y-1">
            <p className="text-xs flex items-center justify-between gap-4">
              <span className="text-gray-300">Capitale:</span>
              <span className="font-bold text-white">
                {formatCurrency(payload[0].value, currency)}
              </span>
            </p>
            {payload[1] && (
              <p className="text-xs flex items-center justify-between gap-4">
                <span className="text-gray-300">PAC Investito:</span>
                <span className="font-semibold text-gray-100">
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
    <div className="relative w-full h-full min-h-[400px] bg-card rounded-3xl p-6 shadow-card">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h3 className="text-2xl font-bold text-foreground">
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
            {/* Royal Blue Gradient */}
            <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(245, 90%, 66%)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(245, 90%, 66%)" stopOpacity={0.05}/>
            </linearGradient>
            
            {/* Gray Ghost Line */}
            <linearGradient id="colorPAC" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.05}/>
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
            tick={{ fontSize: isMobile ? 10 : 12, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border))", strokeWidth: 0.5 }}
          />
          
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: isMobile ? 10 : 12, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border))", strokeWidth: 0.5 }}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
              return value.toString();
            }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* PAC Invested - Ghost Line */}
          <Area
            type="monotone"
            dataKey="totalPACInvested"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1.5}
            fill="url(#colorPAC)"
            name="PAC Investito"
            dot={false}
            activeDot={false}
          />
          
          {/* Total Capital - Bold Royal Blue Line */}
          <Area
            type="monotone"
            dataKey="finalCapital"
            stroke="hsl(245, 90%, 66%)"
            strokeWidth={3}
            fill="url(#colorCapital)"
            name="Capitale Totale"
            dot={false}
            activeDot={{ 
              r: 6, 
              fill: "hsl(245, 90%, 66%)",
              stroke: "white",
              strokeWidth: 2
            }}
          />

          {/* Current Day Marker */}
          {currentDay !== undefined && (
            <ReferenceLine
              x={currentDay}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{
                value: 'Oggi',
                position: 'top',
                fill: 'hsl(var(--primary))',
                fontSize: 12,
                fontWeight: 600
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
