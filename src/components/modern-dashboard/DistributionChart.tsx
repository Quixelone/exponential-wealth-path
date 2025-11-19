import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';

const COLORS = [
  'hsl(174, 100%, 42%)',  // Teal
  'hsl(220, 90%, 56%)',   // Blue
  'hsl(280, 65%, 60%)',   // Purple
  'hsl(45, 93%, 58%)'     // Yellow
];

export const DistributionChart = () => {
  const { summary, config } = useInvestmentCalculator();

  // Mock distribution data - in real app, aggregate by asset type
  const data = [
    { name: 'BTC', value: 45 },
    { name: 'Strategie PAC', value: 25 },
    { name: 'Opzioni', value: 20 },
    { name: 'Liquidità', value: 10 }
  ];

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
