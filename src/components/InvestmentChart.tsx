
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { InvestmentData } from '@/types/investment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InvestmentChartProps {
  data: InvestmentData[];
  showProjections?: boolean;
}

const InvestmentChart: React.FC<InvestmentChartProps> = ({ 
  data, 
  showProjections = false 
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTooltip = (value: any, name: string) => {
    if (name === 'finalCapital') {
      return [formatCurrency(value), 'Capitale Totale'];
    }
    if (name === 'totalPACInvested') {
      return [formatCurrency(value), 'PAC Investito'];
    }
    return [value, name];
  };

  const pacDays = data.filter(d => d.pacAmount > 0);

  return (
    <Card className="w-full animate-scale-in">
      <CardHeader>
        <CardTitle className="wealth-gradient-text text-2xl font-bold">
          Evoluzione del Capitale
        </CardTitle>
        <p className="text-muted-foreground">
          Crescita del tuo investimento nel tempo con interesse composto
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="day"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
                label={{ value: 'Giorni', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency}
                label={{ value: 'Capitale (€)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={formatTooltip}
                labelFormatter={(day) => `Giorno ${day}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              
              {/* Linea principale del capitale */}
              <Line
                type="monotone"
                dataKey="finalCapital"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
              
              {/* Linea del PAC investito */}
              <Line
                type="monotone"
                dataKey="totalPACInvested"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />

              {/* Indicatori per i giorni PAC */}
              {pacDays.map((pacDay, index) => (
                <ReferenceLine 
                  key={`pac-${index}`}
                  x={pacDay.day} 
                  stroke="hsl(var(--accent))" 
                  strokeDasharray="2 2"
                  strokeWidth={1}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legenda */}
        <div className="flex flex-wrap gap-6 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-primary"></div>
            <span className="text-sm text-muted-foreground">Capitale Totale</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-secondary border-dashed border-t-2 border-secondary"></div>
            <span className="text-sm text-muted-foreground">PAC Investito</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-accent border-dashed border-t-2 border-accent"></div>
            <span className="text-sm text-muted-foreground">Versamenti PAC</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentChart;
