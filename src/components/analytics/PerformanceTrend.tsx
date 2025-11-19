import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePortfolioAnalytics } from "@/hooks/usePortfolioAnalytics";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const PerformanceTrend = () => {
  const { strategies, loading } = usePortfolioAnalytics();

  const data = useMemo(() => {
    if (!strategies || strategies.length === 0) return [];

    // Simula un trend basato sui dati reali
    const totalCapital = strategies.reduce((sum, s) => sum + s.currentBalance, 0);
    const totalInvested = strategies.reduce((sum, s) => sum + s.investedCapital, 0);

    // Genera punti dati distribuiti nel tempo
    const points = 30;
    const result = [];
    for (let i = 0; i < points; i++) {
      const progress = i / (points - 1);
      result.push({
        day: i + 1,
        value: totalInvested + (totalCapital - totalInvested) * progress,
      });
    }
    return result;
  }, [strategies]);

  if (loading) {
    return (
      <Card className="analytics-card">
        <CardHeader>
          <CardTitle>Andamento Performance</CardTitle>
        </CardHeader>
        <CardContent className="h-64 animate-pulse">
          <div className="h-full bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="analytics-card">
        <CardHeader>
          <CardTitle>Andamento Performance</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">Dati insufficienti</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="analytics-card">
      <CardHeader>
        <CardTitle>Andamento Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="day"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) =>
                new Intl.NumberFormat("it-IT", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(value)
              }
            />
            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat("it-IT", {
                  style: "currency",
                  currency: "EUR",
                }).format(value)
              }
              labelFormatter={(label) => `Giorno ${label}`}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8B5CF6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
