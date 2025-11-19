import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { InvestmentData } from '@/types/investment';
import { formatCurrency, Currency } from '@/lib/utils';
import { useDeviceInfo } from '@/hooks/use-mobile';
import { TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
        <div className="bg-card border border-white/10 p-3 rounded-lg shadow-lg">
          <p className="text-xs font-semibold mb-2 text-white">Giorno {label}</p>
          <div className="space-y-1">
            <p className="text-xs flex items-center justify-between gap-3">
              <span className="text-gray-400">Capitale:</span>
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
    <div className="rounded-2xl p-6 bg-card border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-white">
              Investment Growth
            </h3>
          </div>
          <p className="text-sm text-gray-400">
            Capital progression over time
          </p>
        </div>
        {currentDay && (
          <Badge className="bg-primary/10 text-primary border-0">
            Day {currentDay}
          </Badge>
        )}
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
              <stop offset="0%" stopColor="#5B8DEF" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#7B6FDD" stopOpacity={0.4}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#ffffff08"
            vertical={false}
          />
          
          <XAxis 
            dataKey="day"
            stroke="#6B7280"
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickLine={false}
            axisLine={false}
          />
          
          <YAxis 
            stroke="#6B7280"
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
              return value.toString();
            }}
          />
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} 
          />
          
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
