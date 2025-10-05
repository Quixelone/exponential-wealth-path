import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, Mail, TrendingUp, Calendar, FileText } from 'lucide-react';
import { useUserStrategyDetail } from '@/hooks/useUserStrategyDetail';
import { StrategyHealthCheck } from './StrategyHealthCheck';
import { StrategyConfigSummary } from './StrategyConfigSummary';
import { StrategyActivityTimeline } from './StrategyActivityTimeline';
import StatisticsCards from '@/components/dashboard/StatisticsCards';
import InvestmentChart from '@/components/InvestmentChart';
import ReportTable from '@/components/ReportTable';
import PerformanceVsPlan from '@/components/PerformanceVsPlan';
import { RealVsTheoreticalSummary } from '@/components/RealVsTheoreticalSummary';
import { useMemo } from 'react';
import { calculateInvestment } from '@/hooks/investmentCalculationUtils';

interface StrategyDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configId: string | null;
  userId: string | null;
  strategyName: string;
  userDisplayName: string;
}

export const StrategyDetailDialog = ({
  open,
  onOpenChange,
  configId,
  userId,
  strategyName,
  userDisplayName,
}: StrategyDetailDialogProps) => {
  const { strategyDetail, loading } = useUserStrategyDetail(configId, userId);

  const investmentData = useMemo(() => {
    if (!strategyDetail) return [];
    
    return calculateInvestment({
      config: strategyDetail.config,
      dailyReturns: Object.fromEntries(strategyDetail.dailyReturns),
      dailyPACOverrides: Object.fromEntries(strategyDetail.dailyPACOverrides),
    });
  }, [strategyDetail]);

  const summary = useMemo(() => {
    if (investmentData.length === 0 || !strategyDetail) {
      return {
        current: { capital: 0, invested: 0, interest: 0, totalReturn: 0 },
        final: { capital: 0, invested: 0, interest: 0, totalReturn: 0 },
      };
    }

    const currentDayIndex = Math.min(
      Math.max(0, Math.floor(
        (new Date().getTime() - new Date(strategyDetail.config.pacConfig.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )),
      investmentData.length - 1
    );

    const currentData = investmentData[currentDayIndex];
    const finalData = investmentData[investmentData.length - 1];

    const currentInvested = strategyDetail.config.initialCapital + currentData.totalPACInvested;
    const finalInvested = strategyDetail.config.initialCapital + finalData.totalPACInvested;

    return {
      current: {
        capital: currentData.finalCapital,
        invested: currentInvested,
        interest: currentData.totalInterest,
        totalReturn: currentInvested > 0 ? ((currentData.finalCapital / currentInvested - 1) * 100) : 0,
      },
      final: {
        capital: finalData.finalCapital,
        invested: finalInvested,
        interest: finalData.totalInterest,
        totalReturn: finalInvested > 0 ? ((finalData.finalCapital / finalInvested - 1) * 100) : 0,
      },
    };
  }, [investmentData, strategyDetail]);

  const currentDayIndex = useMemo(() => {
    if (!strategyDetail) return 0;
    return Math.min(
      Math.floor(
        (new Date().getTime() - new Date(strategyDetail.config.pacConfig.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      ),
      strategyDetail.config.timeHorizon
    );
  }, [strategyDetail]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] h-[95vh] p-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-foreground">
              Dettaglio Strategia - Modalità Sola Lettura
            </DialogTitle>
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
              Admin View
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {userDisplayName}
            </div>
            {strategyDetail?.userEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {strategyDetail.userEmail}
              </div>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !strategyDetail ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              Impossibile caricare i dettagli della strategia
            </div>
          ) : (
            <div className="space-y-6 pb-6">
              {/* User and Strategy Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <StrategyConfigSummary config={strategyDetail.config} strategyName={strategyName} />
                <StrategyHealthCheck
                  lastModified={strategyDetail.lastModified}
                  createdAt={strategyDetail.createdAt}
                  dailyReturnsCount={strategyDetail.dailyReturns.size}
                  pacOverridesCount={strategyDetail.dailyPACOverrides.size}
                  actualTradesCount={strategyDetail.actualTrades.length}
                  expectedDays={strategyDetail.config.timeHorizon}
                />
                <StrategyActivityTimeline
                  createdAt={strategyDetail.createdAt}
                  lastModified={strategyDetail.lastModified}
                  dailyReturnsCount={strategyDetail.dailyReturns.size}
                  pacOverridesCount={strategyDetail.dailyPACOverrides.size}
                  actualTrades={strategyDetail.actualTrades}
                />
              </div>

              {/* Statistics Cards */}
              <StatisticsCards summary={summary} currency={strategyDetail.config.currency} />

              {/* Real vs Theoretical */}
              {strategyDetail.actualTrades.length > 0 && (
                <RealVsTheoreticalSummary
                  investmentData={investmentData}
                  actualTrades={strategyDetail.actualTrades}
                  currency={strategyDetail.config.currency}
                />
              )}

              {/* Tabs for detailed data */}
              <Tabs defaultValue="chart" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-card rounded-xl p-1">
                  <TabsTrigger value="chart" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Grafico
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Performance
                  </TabsTrigger>
                  <TabsTrigger value="table" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Tabella
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chart" className="mt-6">
                  <InvestmentChart
                    data={investmentData}
                    currency={strategyDetail.config.currency}
                    currentDay={currentDayIndex}
                  />
                </TabsContent>

                <TabsContent value="performance" className="mt-6">
                  <PerformanceVsPlan
                    data={investmentData}
                    currency={strategyDetail.config.currency}
                    currentDay={currentDayIndex}
                  />
                </TabsContent>

                <TabsContent value="table" className="mt-6">
                  <ReportTable
                    data={investmentData}
                    currency={strategyDetail.config.currency}
                    onExportCSV={() => {}}
                    onUpdateDailyReturnInReport={() => {}}
                    onUpdatePACInReport={() => {}}
                    onRemovePACOverride={() => {}}
                    defaultPACAmount={strategyDetail.config.pacConfig.amount}
                    investmentStartDate={strategyDetail.config.pacConfig.startDate}
                    currentConfigId={configId}
                    currentConfigName={strategyName}
                    onSaveToStrategy={async () => {}}
                    readOnly={true}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
