
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { InvestmentData } from '@/types/investment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, Currency } from '@/lib/utils';

interface InvestmentChartProps {
  data: InvestmentData[];
  currency: Currency;
  showProjections?: boolean;
}

const InvestmentChart: React.FC<InvestmentChartProps> = ({ 
  data, 
  currency,
  showProjections = false 
}) => {
  const formatTooltip = (value: any, name: string) => {
    if (name === 'finalCapital') {
      return [formatCurrency(value, currency), 'Capitale Totale'];
    }
    if (name === 'totalPACInvested') {
      return [formatCurrency(value, currency), 'PAC Investito'];
    }
    return [value, name];
  };

  const pacDays = data.filter(d => d.pacAmount > 0);

  return (
    <Card className="w-full animate-scale-in bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="pb-4">
        <CardTitle className="wealth-gradient-text text-2xl font-bold flex items-center gap-2">
          📈 Evoluzione del Capitale
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Crescita del tuo investimento nel tempo con interesse composto
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[500px] w-full bg-gradient-to-br from-background to-muted/30 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <defs>
                <linearGradient id="capitalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="pacGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.3}
              />
              <XAxis 
                dataKey="day"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                label={{ 
                  value: 'Giorni', 
                  position: 'insideBottom', 
                  offset: -10,
                  style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' }
                }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => formatCurrency(value, currency, { decimals: 0 })}
                label={{ 
                  value: `Valore (${currency})`, 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' }
                }}
              />
              <Tooltip 
                formatter={formatTooltip}
                labelFormatter={(day) => `Giorno ${day}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 8px 25px -8px rgba(0, 0, 0, 0.1)',
                  fontSize: '13px'
                }}
                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Line
                type="monotone"
                dataKey="finalCapital"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fill="url(#capitalGradient)"
                dot={{ r: 0 }}
                activeDot={{ 
                  r: 6, 
                  fill: 'hsl(var(--primary))', 
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
                name="Capitale Totale"
              />
              <Line
                type="monotone"
                dataKey="totalPACInvested"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                strokeDasharray="8 4"
                fill="url(#pacGradient)"
                dot={{ r: 0 }}
                activeDot={{ 
                  r: 5, 
                  fill: 'hsl(var(--chart-2))',
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2
                }}
                name="PAC Investito"
              />
              {pacDays.slice(0, Math.min(pacDays.length, 20)).map((pacDay, index) => (
                <ReferenceLine 
                  key={`pac-${index}`}
                  x={pacDay.day} 
                  stroke="hsl(var(--chart-3))" 
                  strokeDasharray="2 4"
                  strokeWidth={1}
                  opacity={0.4}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-6 mt-6 justify-center p-4 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-3 px-3 py-2 bg-background rounded-lg shadow-sm">
            <div className="w-4 h-3 bg-primary rounded-sm"></div>
            <span className="text-sm font-medium text-foreground">Capitale Totale</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 bg-background rounded-lg shadow-sm">
            <div className="w-4 h-3 bg-chart-2 rounded-sm border-2 border-dashed border-chart-2/50"></div>
            <span className="text-sm font-medium text-foreground">PAC Investito</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 bg-background rounded-lg shadow-sm">
            <div className="w-4 h-3 bg-chart-3 rounded-sm opacity-60"></div>
            <span className="text-sm font-medium text-foreground">Versamenti PAC</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentChart;
