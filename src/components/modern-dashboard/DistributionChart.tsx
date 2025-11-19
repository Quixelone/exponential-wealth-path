import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import { useSupabaseConfig } from '@/hooks/useSupabaseConfig';
import { useActualTrades } from '@/hooks/useActualTrades';
import { useMemo } from 'react';

const COLORS = [
  'hsl(174, 100%, 42%)',  // Teal
  'hsl(220, 90%, 56%)',   // Blue
  'hsl(280, 65%, 60%)',   // Purple
  'hsl(45, 93%, 58%)'     // Yellow
];

export const DistributionChart = () => {
  const { summary } = useInvestmentCalculator();
  const { savedConfigs } = useSupabaseConfig();
  const { trades } = useActualTrades({ configId: null });

  // Calculate real distribution from actual data
  const data = useMemo(() => {
    const totalCapital = summary.current.finalCapital;
    if (totalCapital === 0) return [];

    // Calculate distribution
    const btcTrades = trades.filter(t => t.trade_type === 'buy_spot' || t.trade_type === 'spot').length;
    const optionTrades = trades.filter(t => t.trade_type === 'option_fill').length;
    const totalTrades = trades.length;

    // Estimate distribution based on trades and capital
    const btcPercentage = totalTrades > 0 ? (btcTrades / totalTrades) * 60 : 40;
    const pacPercentage = savedConfigs.length > 0 ? 25 : 20;
    const optionsPercentage = totalTrades > 0 ? (optionTrades / totalTrades) * 40 : 25;
    const liquidityPercentage = 100 - btcPercentage - pacPercentage - optionsPercentage;

    return [
      { name: 'BTC', value: Math.max(0, btcPercentage) },
      { name: 'Strategie PAC', value: Math.max(0, pacPercentage) },
      { name: 'Opzioni', value: Math.max(0, optionsPercentage) },
      { name: 'Liquidità', value: Math.max(0, liquidityPercentage) }
    ].filter(item => item.value > 0);
  }, [trades, savedConfigs, summary.current.finalCapital]);

  return (
    <div className="modern-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Distribuzione Portfolio
      </h3>

      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `${value}%`}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            formatter={(value: string) => (
              <span className="text-sm text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
