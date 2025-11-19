import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Button } from '@/components/ui/button';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import { format } from 'date-fns';

type Period = '7' | '30' | '90' | 'all';

export const TrendChart = () => {
  const [period, setPeriod] = useState<Period>('30');
  const { investmentData } = useInvestmentCalculator();

  // Filter data based on period
  const getChartData = () => {
    const daysToShow = period === 'all' ? investmentData.length : parseInt(period);
    const data = investmentData.slice(-daysToShow);
    
    return data.map((day) => ({
      name: format(new Date(day.date), 'dd/MM'),
      invested: Math.round(day.totalPACInvested),
      value: Math.round(day.finalCapital)
    }));
  };

  const chartData = getChartData();

  return (
    <div className="modern-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Andamento Capitale
        </h3>
        
        {/* Period Selector */}
        <div className="flex gap-2">
          {(['7', '30', '90', 'all'] as Period[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
              className="text-xs"
            >
              {p === 'all' ? 'Tutto' : `${p}g`}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(174, 100%, 42%)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(174, 100%, 42%)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(340, 82%, 60%)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(340, 82%, 60%)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Area
            type="monotone"
            dataKey="invested"
            stroke="hsl(174, 100%, 42%)"
            strokeWidth={3}
            fill="url(#colorInvested)"
            name="Investito"
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(340, 82%, 60%)"
            strokeWidth={3}
            fill="url(#colorValue)"
            name="Valore"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
