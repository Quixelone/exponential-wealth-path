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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <div className="glass-card border-0 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 modern-gradient rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-6 h-6 bg-white rounded-md opacity-90"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold modern-gradient-text">Finanza Creativa</h1>
                <p className="text-sm text-muted-foreground">Dashboard Investimenti</p>
              </div>
              {isAdmin && (
                <span className="px-3 py-1 modern-gradient text-white text-xs rounded-full font-medium shadow-lg">
                  Admin
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground bg-white/50 rounded-xl px-4 py-2 backdrop-blur-sm">
                <div className="w-8 h-8 modern-gradient rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">{displayName}</span>
              </div>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/user-management')}
                  className="bg-white/50 backdrop-blur-sm border-white/30 hover:bg-white/70"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Gestione Utenti
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="bg-white/50 backdrop-blur-sm border-white/30 hover:bg-white/70"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="investments" className="w-full">
          <TabsList className="glass-card grid w-full grid-cols-2 mb-8 p-2 h-auto">
            <TabsTrigger 
              value="investments" 
              className="data-[state=active]:modern-gradient data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg py-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-current rounded opacity-80"></div>
                Investimenti
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="reminders" 
              className="data-[state=active]:modern-gradient data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg py-3"
            >
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Promemoria
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="investments">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Configuration Panel */}
              <div className="lg:col-span-1 animate-slide-in-left">
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
                />
              </div>

              {/* Charts and Results */}
              <div className="lg:col-span-2 space-y-8 animate-slide-in-right">
                <div className="animate-slide-in-top" style={{ animationDelay: '0.1s' }}>
                  <InvestmentSummary summary={summary} />
                </div>
                <div className="animate-slide-in-top" style={{ animationDelay: '0.2s' }}>
                  <InvestmentChart data={investmentData} />
                </div>
                <div className="animate-slide-in-top" style={{ animationDelay: '0.3s' }}>
                  <ReportTable data={investmentData} onExportCSV={exportToCSV} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reminders" className="animate-slide-in-bottom">
            <PaymentReminders />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
