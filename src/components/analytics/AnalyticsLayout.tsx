import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { MetricsOverview } from "./MetricsOverview";
import { PortfolioDistribution } from "./PortfolioDistribution";
import { PerformanceTrend } from "./PerformanceTrend";
import { StrategyPerformance } from "./StrategyPerformance";
import { TradesDistribution } from "./TradesDistribution";

export const AnalyticsLayout = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-analytics-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <span className="text-sm font-medium">
              {user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        <MetricsOverview />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortfolioDistribution />
          <TradesDistribution />
        </div>

        <PerformanceTrend />

        <StrategyPerformance />
      </div>
    </div>
  );
};
