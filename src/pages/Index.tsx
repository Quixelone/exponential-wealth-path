import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User, Users, Bell, Settings, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConfigurationPanel from '@/components/ConfigurationPanel';
import InvestmentChart from '@/components/InvestmentChart';
import InvestmentSummary from '@/components/InvestmentSummary';
import ReportTable from '@/components/ReportTable';
import PaymentReminders from '@/components/PaymentReminders';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import { useAuth } from '@/hooks/useAuth';
import { ModernTooltipProvider } from '@/components/ui/ModernTooltip';

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
    
    try {
      console.log('🚀 Attempting navigation to /user-management');
      navigate('/user-management'); 
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

  return (
    <ModernTooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="bg-card border-b shadow-md">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <span className="wealth-gradient-text text-2xl font-bold">Finanza Creativa</span>
                {isAdmin && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                    Admin
                  </span>
                )}
                {hasUnsavedChanges && (
                  <span className="px-2 py-0.5 bg-destructive/10 text-destructive text-xs rounded-full font-medium animate-pulse">
                    Modifiche non salvate
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-5 w-5 text-primary" />
                  {displayName}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSettingsClick}
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Impostazioni
                </Button>

                {isAdmin && (
                  <button
                    onClick={handleUserManagementClick}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 border-primary text-primary hover:bg-primary/10"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Gestione Utenti
                  </button>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout} className="border-primary text-primary hover:bg-primary/10">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-full mx-auto p-4 md:p-6">
          <Tabs defaultValue="investments" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mb-6 bg-card p-1 rounded-lg shadow">
              <TabsTrigger value="investments" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
                <TrendingUp className="h-5 w-5" />
                Dashboard Investimenti
              </TabsTrigger>
              <TabsTrigger value="reminders" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
                <Bell className="h-5 w-5" />
                Promemoria Pagamenti
              </TabsTrigger>
            </TabsList>

            <TabsContent value="investments">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="xl:col-span-1">
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

                {/* Charts and Results */}
                <div className="xl:col-span-2 space-y-6">
                  <InvestmentSummary summary={summary} currency={config.currency} />
                  <InvestmentChart data={investmentData} currency={config.currency} />
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
      </div>
    </ModernTooltipProvider>
  );
};

export default Index;
