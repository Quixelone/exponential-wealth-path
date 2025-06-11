
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User, Users, Bell } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConfigurationPanel from '@/components/ConfigurationPanel';
import InvestmentChart from '@/components/InvestmentChart';
import InvestmentSummary from '@/components/InvestmentSummary';
import ReportTable from '@/components/ReportTable';
import PaymentReminders from '@/components/PaymentReminders';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import { useAuth } from '@/hooks/useAuth';

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
    summary
  } = useInvestmentCalculator();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const displayName = userProfile?.first_name && userProfile?.last_name 
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : userProfile?.email || 'Utente';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header with user info and logout */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-primary">Finanza Creativa</h1>
              {isAdmin && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                  Amministratore
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {displayName}
              </div>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/user-management')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Gestione Utenti
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="investments" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="investments">Investimenti</TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Promemoria
            </TabsTrigger>
          </TabsList>

          <TabsContent value="investments">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Configuration Panel */}
              <div className="lg:col-span-1">
                <ConfigurationPanel
                  config={config}
                  onConfigChange={updateConfig}
                  dailyReturns={dailyReturns}
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
                />
              </div>

              {/* Charts and Results */}
              <div className="lg:col-span-2 space-y-6">
                <InvestmentSummary summary={summary} />
                <InvestmentChart data={investmentData} />
                <ReportTable data={investmentData} onExportCSV={exportToCSV} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reminders">
            <PaymentReminders />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
