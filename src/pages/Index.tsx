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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-6"></div>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/30">
        {/* Premium Modernize Header */}
        <div className="modernize-header backdrop-blur-sm bg-white/90 sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Finanza Creativa
              </h1>
            </div>
            {isAdmin && (
              <span className="modernize-badge modernize-badge-primary animate-modernize-bounce-in">
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
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">{displayName}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSettingsClick}
              className="modernize-btn-secondary h-11"
            >
              <Settings className="h-4 w-4 mr-2" />
              Impostazioni
            </Button>

            {isAdmin && (
              <button
                onClick={handleUserManagementClick}
                className="modernize-btn-secondary h-11 flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Gestione Utenti
              </button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              className="modernize-btn-outline h-11"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Premium Main Content */}
        <div className="modernize-container modernize-section">
          <div className="modernize-tabs animate-modernize-fade-in">
            <Tabs defaultValue="investments" className="w-full">
              <div className="modernize-tab-header">
                <TabsList className="bg-transparent border-0 p-0 h-auto gap-12">
                  <TabsTrigger 
                    value="investments" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-3 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none pb-4 border-b-3 border-transparent text-base font-semibold transition-all duration-300 hover:text-primary/70"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                      Dashboard Investimenti
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="reminders" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-3 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none pb-4 border-b-3 border-transparent text-base font-semibold transition-all duration-300 hover:text-primary/70"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange to-warning rounded-lg flex items-center justify-center">
                        <Bell className="h-4 w-4 text-white" />
                      </div>
                      Promemoria Pagamenti
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="modernize-tab-content">
                <TabsContent value="investments" className="mt-0">
                  <div className="modernize-grid modernize-grid-cols-3 gap-8">
                    {/* Premium Configuration Panel */}
                    <div className="lg:col-span-1">
                      <div className="modernize-card-elevated animate-modernize-slide-up">
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

                    {/* Premium Charts and Results */}
                    <div className="lg:col-span-2 space-modernize">
                      <div className="modernize-card-elevated animate-modernize-scale-in">
                        <InvestmentSummary summary={summary} currency={config.currency} />
                      </div>
                      
                      <div className="modernize-chart-container animate-modernize-fade-in" style={{ animationDelay: '0.2s' }}>
                        <InvestmentChart data={investmentData} currency={config.currency} />
                      </div>
                      
                      <div className="modernize-card-elevated animate-modernize-slide-up" style={{ animationDelay: '0.4s' }}>
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
                  <div className="modernize-card-elevated animate-modernize-fade-in">
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
