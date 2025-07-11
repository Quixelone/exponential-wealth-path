import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Bell } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConfigurationPanel from '@/components/ConfigurationPanel';
import InvestmentChart from '@/components/InvestmentChart';
import ReportTable from '@/components/ReportTable';
import PaymentReminders from '@/components/PaymentReminders';
import PerformanceVsPlan from '@/components/PerformanceVsPlan';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import { useAuth } from '@/hooks/useAuth';
import { useDeviceInfo } from '@/hooks/use-mobile';
import { ModernTooltipProvider } from '@/components/ui/ModernTooltip';
import ModernSidebar from '@/components/dashboard/ModernSidebar';
import ModernHeader from '@/components/dashboard/ModernHeader';
import MobileHeader from '@/components/mobile/MobileHeader';
import MobileDrawer from '@/components/mobile/MobileDrawer';
import BottomNavigation from '@/components/mobile/BottomNavigation';
import StatisticsCards from '@/components/dashboard/StatisticsCards';
import CurrentStrategyProgress from '@/components/dashboard/CurrentStrategyProgress';

const Index = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading, signOut, isAdmin } = useAuth();
  const { isMobile, isTablet } = useDeviceInfo();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  console.log('🏠 Index component render state:', {
    authLoading,
    userExists: !!user,
    userProfileExists: !!userProfile,
    userRole: userProfile?.role,
    isAdmin,
    shouldShowAdminButton: isAdmin
  });

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
    console.log('🔄 Auth check effect:', { authLoading, userExists: !!user });
    if (!authLoading && !user) {
      console.log('🚪 Redirecting to auth page - no user found');
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Enhanced unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Hai modifiche non salvate. Sei sicuro di voler uscire?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (authLoading) {
    console.log('⏳ Showing loading screen - auth still loading');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento dati utente...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ No user found, component will redirect via useEffect');
    return null; // Will redirect to auth via useEffect
  }

  const handleLogout = async () => {
    if (hasUnsavedChanges) {
      const confirmLogout = window.confirm(
        'Hai modifiche non salvate. Sei sicuro di voler uscire senza salvare?'
      );
      if (!confirmLogout) return;
    }
    
    console.log('🚪 Logout initiated');
    await signOut();
    navigate('/auth');
  };

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

  // Enhanced configuration loading with unsaved changes check
  const handleLoadConfigWithWarning = (savedConfig: any) => {
    if (hasUnsavedChanges) {
      const confirmLoad = window.confirm(
        'Hai modifiche non salvate nella configurazione corrente. Caricando una nuova configurazione perderai queste modifiche. Vuoi continuare?'
      );
      if (!confirmLoad) return;
    }
    loadSavedConfiguration(savedConfig);
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

  console.log('🎯 Admin button should show:', isAdmin);

  return (
    <ModernTooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Desktop Layout */}
        {!isMobile && !isTablet && (
          <div className="flex min-h-screen w-full">
            <ModernSidebar 
              isAdmin={isAdmin}
              onCollapseChange={setIsSidebarCollapsed}
            />
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
              <ModernHeader 
                userProfile={userProfile}
                onLogout={handleLogout}
                onSettings={() => navigate('/settings')}
                isAdmin={isAdmin}
              />
              <main className="flex-1 p-6">
                {renderMainContent()}
              </main>
            </div>
          </div>
        )}

        {/* Mobile Layout */}
        {(isMobile || isTablet) && (
          <>
            <MobileHeader 
              userProfile={userProfile}
              onMenuClick={() => setIsMobileDrawerOpen(true)}
              onLogout={handleLogout}
              isAdmin={isAdmin}
            />
            <MobileDrawer 
              isOpen={isMobileDrawerOpen}
              onClose={() => setIsMobileDrawerOpen(false)}
              isAdmin={isAdmin}
            />
            <div className="pt-14 pb-20 px-4">
              {renderMainContent()}
            </div>
            <BottomNavigation isAdmin={isAdmin} />
          </>
        )}
      </div>
    </ModernTooltipProvider>
  );
};

export default Index;