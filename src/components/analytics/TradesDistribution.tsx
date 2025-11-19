import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePortfolioAnalytics } from "@/hooks/usePortfolioAnalytics";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#00D9C8", "#8B5CF6", "#F59E0B"];

export const TradesDistribution = () => {
  const { strategies, loading } = usePortfolioAnalytics();

  const data = useMemo(() => {
    if (!strategies || strategies.length === 0) return [];

    // Per ora mostriamo la distribuzione per performance invece che per trades
    return strategies
      .filter((s) => s.currentPerformance !== 0)
      .map((strategy, index) => ({
        name: strategy.name,
        value: Math.abs(strategy.currentPerformance),
        color: COLORS[index % COLORS.length],
      }));
  }, [strategies]);

  if (loading) {
    return (
      <Card className="analytics-card">
        <CardHeader>
          <CardTitle>Distribuzione Trades</CardTitle>
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
          <CardTitle>Distribuzione Trades</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">Nessuna performance da mostrare</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="analytics-card">
      <CardHeader>
        <CardTitle>Performance Strategie</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <ResponsiveContainer width="50%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value.toFixed(2)}%`}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 flex-1">
            {data.map((entry, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-muted-foreground">{entry.name}</span>
                </div>
                <span className="text-sm font-medium">{entry.value.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
