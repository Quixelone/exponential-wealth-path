
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
    console.log('⏳ Showing loading screen - auth still loading');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Caricamento dati utente...</p>
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
      <div className="min-h-screen bg-background">
        {/* Clean Professional Header */}
        <div className="modernize-header sticky top-0 z-50">
          <div className="modernize-container">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-slate-900">
                    Finanza Creativa
                  </h1>
                </div>
                {isAdmin && (
                  <span className="modernize-badge modernize-badge-primary">
                    <User className="h-3 w-3 mr-1" />
                    Admin
                  </span>
                )}
                {hasUnsavedChanges && (
                  <span className="modernize-badge modernize-badge-warning animate-pulse">
                    <Bell className="h-3 w-3 mr-1" />
                    Modifiche non salvate
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-md border border-slate-200">
                  <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{displayName}</span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSettingsClick}
                  className="modernize-btn-secondary"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Impostazioni
                </Button>

                {isAdmin && (
                  <button
                    onClick={handleUserManagementClick}
                    className="modernize-btn-secondary flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Gestione Utenti
                  </button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout} 
                  className="modernize-btn-outline"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Main Content */}
        <div className="modernize-container modernize-section">
          <div className="modernize-card animate-modernize-fade-in">
            <Tabs defaultValue="investments" className="w-full">
              <div className="px-6 py-4 border-b border-slate-200">
                <TabsList className="bg-slate-100 p-1 rounded-md">
                  <TabsTrigger 
                    value="investments" 
                    className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Dashboard Investimenti
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="reminders" 
                    className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Promemoria Pagamenti
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="p-6">
                <TabsContent value="investments" className="mt-0">
                  <div className="modernize-grid modernize-grid-cols-3">
                    {/* Clean Configuration Panel */}
                    <div className="lg:col-span-1">
                      <div className="modernize-card-elevated">
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

                    {/* Clean Charts and Results */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="modernize-card-elevated">
                        <InvestmentSummary summary={summary} currency={config.currency} />
                      </div>
                      
                      <div className="modernize-card-elevated">
                        <InvestmentChart data={investmentData} currency={config.currency} />
                      </div>
                      
                      <div className="modernize-card-elevated">
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

                <TabsContent value="reminders" className="mt-0">
                  <div className="modernize-card-elevated">
                    <PaymentReminders />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </ModernTooltipProvider>
  );
};

export default Index;
