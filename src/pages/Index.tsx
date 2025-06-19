import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

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
    await signOut();
    navigate('/auth');
  };

  const displayName = userProfile?.first_name && userProfile?.last_name 
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : userProfile?.email || 'Utente';

  // Callback for ReportTable inline editing
  const handleUpdateDailyReturnInReport = (day: number, newReturn: number) => {
    // Directly use the updateDailyReturn from the hook, which also triggers recalculation
    updateDailyReturn(day, newReturn); 
  };

  // New: inline PAC day update handler
  const handleUpdatePACInReport = (day: number, newPAC: number) => {
    updatePACForDay(day, newPAC);
  };

  // New: handler for restoring default PAC value for a day
  const handleRemovePACOverride = (day: number) => {
    removePACOverride(day);
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
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-5 w-5 text-primary" />
                  {displayName}
                </div>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/user-management')}
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Gestione Utenti
                  </Button>
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
                    onLoadConfiguration={loadSavedConfiguration}
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
