import { useMemo } from "react";
import { TrendingUp, TrendingDown, DollarSign, Activity, Target, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { usePortfolioAnalytics } from "@/hooks/usePortfolioAnalytics";
import { formatCurrency } from "@/utils/currency";

export const MetricsOverview = () => {
  const { summary, loading } = usePortfolioAnalytics();

  const metrics = useMemo(() => {
    if (!summary) return [];

    const totalCapital = summary.totalCapital;
    const totalInvested = summary.totalInvested;
    const totalGain = totalCapital - totalInvested;
    const totalReturn = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    return [
      {
        label: "Capitale Totale",
        value: formatCurrency(totalCapital, "EUR"),
        change: totalReturn.toFixed(2) + "%",
        isPositive: totalReturn >= 0,
        icon: Wallet,
        color: "bg-analytics-cyan",
      },
      {
        label: "Capitale Investito",
        value: formatCurrency(totalInvested, "EUR"),
        change: `${summary.activeStrategies} strategie`,
        isPositive: true,
        icon: Target,
        color: "bg-analytics-purple",
      },
      {
        label: "Performance Media",
        value: summary.averagePerformance.toFixed(2) + "%",
        change: summary.activeStrategies > 0 ? "attive" : "nessuna",
        isPositive: summary.averagePerformance >= 0,
        icon: Activity,
        color: "bg-analytics-mint",
      },
      {
        label: "Guadagno Totale",
        value: formatCurrency(totalGain, "EUR"),
        change: totalReturn.toFixed(2) + "%",
        isPositive: totalGain >= 0,
        icon: DollarSign,
        color: "bg-analytics-pink",
      },
    ];
  }, [summary]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="analytics-card p-6 animate-pulse">
            <div className="h-20 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="analytics-card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
              <div className="flex items-center gap-1">
                {metric.isPositive ? (
                  <TrendingUp className="w-4 h-4 text-analytics-trend-up" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-analytics-trend-down" />
                )}
                <span className={metric.isPositive ? "text-analytics-trend-up" : "text-analytics-trend-down"}>
                  {metric.change}
                </span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-xl ${metric.color} flex items-center justify-center`}>
              <metric.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
