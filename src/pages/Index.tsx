import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Bell } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConfigurationPanel from '@/components/ConfigurationPanel';
import InvestmentChart from '@/components/InvestmentChart';
import ReportTable from '@/components/ReportTable';
import PaymentReminders from '@/components/PaymentReminders';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import { useAuth } from '@/hooks/useAuth';
import { ModernTooltipProvider } from '@/components/ui/ModernTooltip';
import ModernSidebar from '@/components/dashboard/ModernSidebar';
import ModernHeader from '@/components/dashboard/ModernHeader';
import StatisticsCards from '@/components/dashboard/StatisticsCards';

const Index = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading, signOut, isAdmin } = useAuth();
  
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
    currentDayIndex
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

  const handleUserManagementClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('🔧 USER MANAGEMENT BUTTON CLICKED');
    console.log('Current admin status:', isAdmin);
    console.log('User role:', userProfile?.role);
    console.log('Auth loading:', authLoading);
    console.log('User exists:', !!user);
    console.log('User profile exists:', !!userProfile);
    
    try {
      console.log('🚀 Attempting navigation to /user-management');
      console.log('Current location:', window.location.pathname);
      navigate('/user-management');
      console.log('✅ Navigation call completed');
      
      // Aggiungiamo un timeout per verificare se la navigazione è avvenuta
      setTimeout(() => {
        console.log('🔍 Post-navigation check - Current location:', window.location.pathname);
      }, 100);
    } catch (error) {
      console.error('💥 Error during navigation:', error);
    }
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const displayName = userProfile?.first_name && userProfile?.last_name 
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : userProfile?.email || 'Utente';

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

  console.log('🎯 Admin button should show:', isAdmin);

  return (
    <ModernTooltipProvider>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <ModernSidebar 
          isAdmin={isAdmin}
          onNavigate={(path) => console.log('Navigation to:', path)}
        />

        {/* Main Content */}
        <div className="flex-1 ml-64 flex flex-col">
          {/* Header */}
          <ModernHeader
            userProfile={userProfile}
            isAdmin={isAdmin}
            hasUnsavedChanges={hasUnsavedChanges}
            onLogout={handleLogout}
            onSettings={handleSettingsClick}
            onUserManagement={handleUserManagementClick}
          />

          {/* Page Content */}
          <main className="flex-1 p-6 bg-background">
            {/* Statistics Cards */}
            <StatisticsCards summary={summary} currency={config.currency} />

            {/* Tabs */}
            <Tabs defaultValue="investments" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-card rounded-xl p-1">
                <TabsTrigger 
                  value="investments" 
                  className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                >
                  <TrendingUp className="h-4 w-4" />
                  Dashboard Investimenti
                </TabsTrigger>
                <TabsTrigger 
                  value="reminders" 
                  className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                >
                  <Bell className="h-4 w-4" />
                  Promemoria Pagamenti
                </TabsTrigger>
              </TabsList>

              <TabsContent value="investments" className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                  {/* Configuration Panel */}
                  <div className="xl:col-span-1">
                    <div className="modern-card p-6">
                      <ConfigurationPanel
                        config={config}
                        onConfigChange={updateConfig}
                        customReturns={dailyReturns}
                        onUpdateDailyReturn={updateDailyReturn}
                        onRemoveDailyReturn={removeDailyReturn}
                        onExportCSV={exportToCSV}
                        savedConfigs={savedConfigs}
                        onLoadConfiguration={handleLoadConfigWithWarning}
                        onDeleteConfiguration={deleteConfiguration}
                        onSaveConfiguration={saveCurrentConfiguration}
                        onUpdateConfiguration={updateCurrentConfiguration}
                        currentConfigId={currentConfigId}
                        currentConfigName={currentConfigName}
                        supabaseLoading={supabaseLoading}
                        isAdmin={isAdmin}
                        dailyPACOverrides={dailyPACOverrides}
                        onUpdatePACForDay={updatePACForDay}
                        onRemovePACOverride={removePACOverride}
                        hasUnsavedChanges={hasUnsavedChanges}
                      />
                    </div>
                  </div>

                  {/* Charts and Results */}
                  <div className="xl:col-span-3 space-y-6">
                    <div className="modern-card p-6">
                      <InvestmentChart data={investmentData} currency={config.currency} />
                    </div>
                    
                    <div className="modern-card">
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
                </div>
              </TabsContent>

              <TabsContent value="reminders">
                <div className="modern-card p-6">
                  <PaymentReminders />
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </ModernTooltipProvider>
  );
};

export default Index;
