import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Bell, Settings, Target, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import InvestmentChart from '@/components/InvestmentChart';
import ReportTable from '@/components/ReportTable';
import PaymentReminders from '@/components/PaymentReminders';
import PerformanceVsPlan from '@/components/PerformanceVsPlan';
import { RealVsTheoreticalSummary } from '@/components/RealVsTheoreticalSummary';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import { useActualTrades } from '@/hooks/useActualTrades';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceInfo } from '@/hooks/use-mobile';
import StatisticsCards from '@/components/dashboard/StatisticsCards';
import CurrentStrategyProgress from '@/components/dashboard/CurrentStrategyProgress';
import MetricCardsGrid from '@/components/dashboard/MetricCardsGrid';
import AppLayout from '@/components/layout/AppLayout';
import FloatingActionButton from '@/components/mobile/FloatingActionButton';
import { useToast } from '@/hooks/use-toast';
import { OptionsTracker } from '@/components/OptionsTracker';

const Index = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { isMobile } = useDeviceInfo();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('investments');

  const {
    config,
    updateConfig,
    investmentData,
    dailyReturns,
    updateDailyReturn,
    removeDailyReturn,
    exportToCSV,
    currentConfigId,
    currentConfigName,
    savedConfigs,
    saveCurrentConfiguration,
    updateCurrentConfiguration,
    loadSavedConfiguration,
    deleteConfiguration,
    supabaseLoading,
    summary,
    dailyPACOverrides,
    updatePACForDay,
    removePACOverride,
    hasUnsavedChanges,
    currentDayIndex,
    undoConfiguration,
    redoConfiguration,
    canUndo,
    canRedo,
    forceReloadFromDatabase,
    lastDatabaseSync
  } = useInvestmentCalculator();

  // Load actual trades for the current configuration
  const { trades: actualTrades } = useActualTrades({ 
    configId: currentConfigId 
  });
  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Will redirect to auth via useEffect
  }

  // Callback for ReportTable inline editing
  const handleUpdateDailyReturnInReport = (day: number, newReturn: number) => {
    updateDailyReturn(day, newReturn); 
  };

  const handleUpdatePACInReport = (day: number, newPAC: number) => {
    updatePACForDay(day, newPAC);
  };

  const handleRemovePACOverride = (day: number) => {
    removePACOverride(day);
  };

  const handleSaveToStrategy = async () => {
    if (currentConfigId && currentConfigName) {
      await updateCurrentConfiguration(currentConfigId, currentConfigName);
    }
  };

  const handleQuickSave = async () => {
    try {
      if (currentConfigId && currentConfigName) {
        await updateCurrentConfiguration(currentConfigId, currentConfigName);
        toast({
          title: "Configurazione salvata",
          description: "Le modifiche sono state salvate con successo.",
        });
      } else {
        await saveCurrentConfiguration(`Strategia ${new Date().toLocaleDateString('it-IT')}`);
        toast({
          title: "Nuova strategia salvata",
          description: "La strategia è stata salvata con successo.",
        });
      }
    } catch (error) {
      toast({
        title: "Errore nel salvataggio",
        description: "Si è verificato un errore durante il salvataggio.",
        variant: "destructive",
      });
    }
  };


  const renderMainContent = () => {
    // Debug: Mostra i valori calcolati
    console.log('📊 Dashboard Valori:', {
      configName: currentConfigName,
      giornoCorrente: currentDayIndex,
      giorniTotali: investmentData?.length,
      capitaleTotale: summary?.current?.finalCapital,
      capitaleInvestito: summary?.current?.totalInvested,
      profittoTotale: summary?.current?.totalInterest,
      ritornoPercentuale: summary?.current?.totalReturn,
      strategieAttive: savedConfigs?.length,
      pacStartDate: config?.pacConfig?.startDate,
      today: new Date().toISOString().split('T')[0]
    });

    return (
      <div className={isMobile ? "space-y-3 pb-20" : "space-y-6"}>
        {/* Portfolio Overview - New Design */}
        <MetricCardsGrid 
          totalCapital={summary?.current?.finalCapital || 0}
          totalProfit={summary?.current?.totalInterest || 0}
          activeStrategies={savedConfigs?.length || 0}
          currency={config?.currency || 'EUR'}
          isLoading={false}
          summary={summary}
          investmentDataLength={investmentData?.length || 0}
        />
        
        {/* Strategy Header */}
        <Card variant="glass" className={`border-l-4 border-l-primary ${isMobile ? "p-3" : "p-4"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`bg-primary/10 rounded-lg ${isMobile ? "p-1.5" : "p-2"}`}>
                <Target className={isMobile ? "h-4 w-4 text-primary" : "h-5 w-5 text-primary"} />
              </div>
              <div>
                <h2 className={`font-semibold text-foreground ${isMobile ? "text-sm" : "text-lg"}`}>
                  {currentConfigName || "Strategia temporanea"}
                </h2>
                <p className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}>
                  {currentConfigId ? "Strategia salvata" : "Non salvata"}
                </p>
              </div>
            </div>
            {hasUnsavedChanges && (
              <Badge variant="warning" pulse className={isMobile ? "text-[10px] px-1.5 py-0.5" : ""}>
                {isMobile ? "Non salvate" : "Modifiche non salvate"}
              </Badge>
            )}
          </div>
        </Card>
        
        {/* Current Strategy Progress */}
        <CurrentStrategyProgress 
          key={`progress-${config.currency}`}
          summary={summary} 
          currency={config.currency} 
          currentDayIndex={currentDayIndex}
          dailyReturns={dailyReturns}
          originalDailyReturnRate={config.dailyReturnRate}
        />

        {/* Real vs Theoretical Performance */}
        <RealVsTheoreticalSummary
          investmentData={investmentData}
          actualTrades={actualTrades}
          currency={config.currency || 'EUR'}
        />

        {/* Pionex Options Tracker */}
        <OptionsTracker />

        {/* Edit Strategy and Reload Buttons */}
        <div className={`flex justify-center ${isMobile ? "flex-col gap-2" : "gap-3"}`}>
          <Button
            onClick={() => navigate('/strategies')}
            variant="gradient"
            size={isMobile ? "default" : "lg"}
            className={`flex items-center justify-center gap-2 ${isMobile ? "w-full min-h-[44px]" : ""}`}
          >
            <Settings className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
            {isMobile ? "Modifica" : "Modifica Configurazione"}
          </Button>

          <Button
            onClick={forceReloadFromDatabase}
            variant="info"
            size={isMobile ? "default" : "lg"}
            className={`flex items-center justify-center gap-2 ${isMobile ? "w-full min-h-[44px]" : ""}`}
            disabled={supabaseLoading}
            loading={supabaseLoading}
            loadingText={isMobile ? "Caricamento..." : "Caricamento..."}
          >
            <RefreshCw className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} ${supabaseLoading ? 'animate-spin' : ''}`} />
            {isMobile ? "Ricarica" : "Ricarica dal Database"}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs 
          defaultValue="investments" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'mb-4' : 'mb-6'} bg-card rounded-xl p-1`}>
            <TabsTrigger 
              value="investments" 
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <TrendingUp className="h-4 w-4" />
              <span className={isMobile ? 'text-sm' : ''}>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reminders" 
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
            >
              <Bell className="h-4 w-4" />
              <span className={isMobile ? 'text-sm' : ''}>Promemoria</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="investments" className={isMobile ? 'space-y-3' : 'space-y-6'}>
            <div className={isMobile ? "space-y-3" : "space-y-6"}>
              <InvestmentChart 
                key={`chart-${config.currency}-${currentConfigId}`}
                data={investmentData} 
                currency={config.currency}
                currentDay={currentDayIndex}
              />

              <PerformanceVsPlan 
                key={`performance-${config.currency}-${currentConfigId}`}
                data={investmentData}
                currency={config.currency}
                currentDay={Math.min(Math.floor((new Date().getTime() - new Date(config.pacConfig.startDate).getTime()) / (1000 * 60 * 60 * 24)), config.timeHorizon)}
              />
              
              <ReportTable 
                key={`table-${config.currency}-${currentConfigId}`}
                data={investmentData} 
                currency={config.currency}
                onExportCSV={exportToCSV}
                onUpdateDailyReturnInReport={handleUpdateDailyReturnInReport}
                onUpdatePACInReport={handleUpdatePACInReport}
                onRemovePACOverride={handleRemovePACOverride}
                defaultPACAmount={config.pacConfig.amount}
                investmentStartDate={config.pacConfig.startDate}
                currentConfigId={currentConfigId}
                currentConfigName={currentConfigName}
                onSaveToStrategy={handleSaveToStrategy}
              />
            </div>
          </TabsContent>

          <TabsContent value="reminders">
            <PaymentReminders />
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <AppLayout hasUnsavedChanges={hasUnsavedChanges} activeTab={activeTab}>
      {renderMainContent()}
      
      {/* Mobile Quick Save FAB */}
      {isMobile && (
        <FloatingActionButton
          variant="save"
          onClick={handleQuickSave}
          disabled={!hasUnsavedChanges}
          show={hasUnsavedChanges}
        />
      )}
    </AppLayout>
  );
};

export default Index;
