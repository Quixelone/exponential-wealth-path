
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { InvestmentData } from '@/types/investment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartConfig, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { formatCurrency, Currency } from '@/lib/utils';

interface InvestmentChartProps {
  data: InvestmentData[];
  currency: Currency;
  showProjections?: boolean;
  currentDay?: number;
}

const chartConfig = {
  finalCapital: {
    label: "Capitale Totale",
    color: "hsl(var(--primary))",
  },
  totalPACInvested: {
    label: "PAC Investito", 
    color: "hsl(var(--secondary))",
  },
  pacDays: {
    label: "Versamenti PAC",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

const InvestmentChart: React.FC<InvestmentChartProps> = ({ 
  data, 
  currency,
  showProjections = false,
  currentDay
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
        <ChartContainer config={chartConfig} className="h-[500px] w-full">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="day"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickLine={{ stroke: "hsl(var(--border))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              label={{ 
                value: 'Giorni', 
                position: 'insideBottom', 
                offset: -10,
                style: { textAnchor: 'middle', fill: "hsl(var(--muted-foreground))" }
              }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              tickLine={{ stroke: "hsl(var(--border))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickFormatter={(value) => formatCurrency(value, currency)}
              label={{ 
                value: `Capitale (${currency})`, 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: "hsl(var(--muted-foreground))" }
              }}
            />
            <Tooltip 
              formatter={formatTooltip}
              labelFormatter={(day) => `Giorno ${day}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 4px 12px -4px rgba(0, 0, 0, 0.15)',
                padding: '12px'
              }}
              labelStyle={{
                color: 'hsl(var(--foreground))',
                fontWeight: 600,
                marginBottom: '8px'
              }}
            />
            
            {/* Capitale Totale - Linea principale con gradiente */}
            <Line
              type="monotone"
              dataKey="finalCapital"
              stroke="var(--color-finalCapital)"
              strokeWidth={3}
              dot={false}
              activeDot={{ 
                r: 6, 
                fill: 'var(--color-finalCapital)',
                stroke: 'hsl(var(--background))',
                strokeWidth: 2
              }}
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
              }}
            />
            
            {/* PAC Investito - Linea tratteggiata */}
            <Line
              type="monotone"
              dataKey="totalPACInvested"
              stroke="var(--color-totalPACInvested)"
              strokeWidth={2}
              strokeDasharray="8 4"
              dot={false}
              activeDot={{ 
                r: 5, 
                fill: 'var(--color-totalPACInvested)',
                stroke: 'hsl(var(--background))',
                strokeWidth: 2
              }}
            />
            
            {/* Linee di riferimento per i versamenti PAC */}
            {pacDays.map((pacDay, index) => (
              <ReferenceLine 
                key={`pac-${index}`}
                x={pacDay.day} 
                stroke="var(--color-pacDays)" 
                strokeDasharray="3 3"
                strokeWidth={1}
                opacity={0.6}
              />
            ))}
            
            {/* Linea del giorno corrente */}
            {currentDay !== undefined && (
              <ReferenceLine 
                x={currentDay} 
                stroke="hsl(var(--warning))" 
                strokeWidth={2}
                strokeDasharray="6 6"
                label={{ 
                  value: "Oggi", 
                  position: "top",
                  style: { 
                    fill: "hsl(var(--warning))",
                    fontSize: 12,
                    fontWeight: 600
                  }
                }}
              />
            )}
          </LineChart>
        </ChartContainer>
        
        {/* Leggenda moderna */}
        <div className="mt-6">
          <ChartLegend>
            <ChartLegendContent 
              className="flex flex-wrap justify-center gap-6"
              nameKey="label"
            />
          </ChartLegend>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentChart;
