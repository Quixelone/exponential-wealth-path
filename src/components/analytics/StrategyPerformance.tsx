import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { usePortfolioAnalytics } from "@/hooks/usePortfolioAnalytics";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#8B5CF6", "#00D9C8", "#F59E0B", "#10B981", "#EF4444"];

export const StrategyPerformance = () => {
  const { strategies, loading } = usePortfolioAnalytics();

  const data = useMemo(() => {
    if (!strategies || strategies.length === 0) return [];

    return strategies.map((strategy, index) => ({
      name: strategy.name.length > 15
        ? strategy.name.substring(0, 12) + "..."
        : strategy.name,
      performance: strategy.currentPerformance,
      color: COLORS[index % COLORS.length],
    }));
  }, [strategies]);

  const handleExport = () => {
    // Export logic
    console.log("Export strategy performance");
  };

  if (loading) {
    return (
      <Card className="analytics-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Performance per Strategia</CardTitle>
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Performance per Strategia</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">Nessuna strategia disponibile</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="analytics-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Performance per Strategia</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              formatter={(value: number) => `${value.toFixed(2)}%`}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Bar 
              dataKey="performance" 
              radius={[8, 8, 0, 0]}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
