import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Bell } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConfigurationPanel from '@/components/ConfigurationPanel';
import InvestmentChart from '@/components/InvestmentChart';
import ReportTable from '@/components/ReportTable';
import PaymentReminders from '@/components/PaymentReminders';
import PerformanceVsPlan from '@/components/PerformanceVsPlan';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceInfo } from '@/hooks/use-mobile';
import StatisticsCards from '@/components/dashboard/StatisticsCards';
import CurrentStrategyProgress from '@/components/dashboard/CurrentStrategyProgress';
import AppLayout from '@/components/layout/AppLayout';

const Index = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { isMobile } = useDeviceInfo();

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
    canRedo
  } = useInvestmentCalculator();
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

  const renderMainContent = () => {
    return (
      <div className="space-y-6">
        {/* Statistics Cards */}
        <StatisticsCards summary={summary} currency={config.currency} />
        
        {/* Current Strategy Progress */}
        <CurrentStrategyProgress 
          summary={summary} 
          currency={config.currency} 
          currentDayIndex={currentDayIndex}
          dailyReturns={dailyReturns}
          originalDailyReturnRate={config.dailyReturnRate}
        />

        {/* Tabs */}
        <Tabs defaultValue="investments" className="w-full">
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

          <TabsContent value="investments" className={`space-y-${isMobile ? '4' : '6'}`}>
            <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 xl:grid-cols-4 gap-6'}`}>
              {/* Configuration Panel */}
              <div className={`${!isMobile ? 'xl:col-span-1' : ''}`}>
                <ConfigurationPanel
                  config={config}
                  onConfigChange={updateConfig}
                  customReturns={dailyReturns}
                  onUpdateDailyReturn={updateDailyReturn}
                  onRemoveDailyReturn={removeDailyReturn}
                  onExportCSV={exportToCSV}
                  isAdmin={isAdmin}
                  dailyPACOverrides={dailyPACOverrides}
                  onUpdatePACForDay={updatePACForDay}
                  onRemovePACOverride={removePACOverride}
                  hasUnsavedChanges={hasUnsavedChanges}
                  currentConfigId={currentConfigId}
                  currentConfigName={currentConfigName}
                  onSaveStrategy={saveCurrentConfiguration}
                  onUpdateStrategy={updateCurrentConfiguration}
                  onUndo={undoConfiguration}
                  onRedo={redoConfiguration}
                  canUndo={canUndo}
                  canRedo={canRedo}
                />
              </div>

              {/* Charts and Results */}
              <div className={`${!isMobile ? 'xl:col-span-3' : ''} space-y-${isMobile ? '4' : '6'}`}>
                <InvestmentChart data={investmentData} currency={config.currency} />

                <PerformanceVsPlan 
                  data={investmentData}
                  currency={config.currency}
                  currentDay={Math.min(Math.floor((new Date().getTime() - new Date(config.pacConfig.startDate).getTime()) / (1000 * 60 * 60 * 24)), config.timeHorizon)}
                />
                
                <ReportTable 
                  data={investmentData} 
                  currency={config.currency}
                  onExportCSV={exportToCSV}
                  onUpdateDailyReturnInReport={handleUpdateDailyReturnInReport}
                  onUpdatePACInReport={handleUpdatePACInReport}
                  onRemovePACOverride={handleRemovePACOverride}
                  defaultPACAmount={config.pacConfig.amount}
                  investmentStartDate={config.pacConfig.startDate}
                />
              </div>
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
    <AppLayout hasUnsavedChanges={hasUnsavedChanges}>
      {renderMainContent()}
    </AppLayout>
  );
};

export default Index;