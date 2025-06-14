
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User, Users, Bell, TrendingUp, DollarSign, Calendar, Target } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConfigurationPanel from '@/components/ConfigurationPanel';
import InvestmentChart from '@/components/InvestmentChart';
import InvestmentSummary from '@/components/InvestmentSummary';
import ReportTable from '@/components/ReportTable';
import PaymentReminders from '@/components/PaymentReminders';
import StatCard from '@/components/ui/stat-card';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400 mx-auto mb-4"></div>
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

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-lime-50 to-yellow-50">
      {/* Modern Header */}
      <div className="modern-card border-0 shadow-lg mb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 success-gradient rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold primary-gradient-text">Finanza Creativa</h1>
                <p className="text-sm text-gray-600">Dashboard Investimenti</p>
              </div>
              {isAdmin && (
                <span className="px-4 py-2 success-gradient text-white text-xs rounded-full font-medium shadow-lg">
                  Admin
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-sm text-gray-700 bg-white/70 rounded-2xl px-5 py-3 backdrop-blur-sm shadow-sm">
                <div className="w-8 h-8 success-gradient rounded-xl flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">{displayName}</span>
              </div>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/user-management')}
                  className="bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white rounded-xl px-4"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Gestione Utenti
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white rounded-xl px-4"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Tabs defaultValue="investments" className="w-full">
          <TabsList className="modern-card grid w-full grid-cols-2 mb-8 p-2 h-auto shadow-lg">
            <TabsTrigger 
              value="investments" 
              className="data-[state=active]:success-gradient data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl py-4 font-medium transition-all"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5" />
                Investimenti
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="reminders" 
              className="data-[state=active]:success-gradient data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl py-4 font-medium transition-all"
            >
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5" />
                Promemoria
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="investments">
            <div className="space-y-8">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-in-top">
                <StatCard
                  title="Capitale Iniziale"
                  value={formatCurrency(config.initialCapital)}
                  icon={DollarSign}
                  color="success"
                />
                <StatCard
                  title="Valore Finale"
                  value={formatCurrency(summary.finalCapital)}
                  subtitle={`+${formatCurrency(summary.totalInterest)}`}
                  icon={Target}
                  color="info"
                  trend="up"
                />
                <StatCard
                  title="Rendimento"
                  value={`${summary.totalReturn.toFixed(1)}%`}
                  subtitle="Totale"
                  icon={TrendingUp}
                  color="warning"
                  trend="up"
                />
                <StatCard
                  title="Durata"
                  value={`${config.timeHorizon}`}
                  subtitle="giorni"
                  icon={Calendar}
                  color="danger"
                />
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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
                <div className="lg:col-span-3 space-y-8 animate-slide-in-right">
                  <div className="animate-slide-in-top" style={{ animationDelay: '0.2s' }}>
                    <InvestmentChart data={investmentData} />
                  </div>
                  <div className="animate-slide-in-top" style={{ animationDelay: '0.3s' }}>
                    <ReportTable data={investmentData} onExportCSV={exportToCSV} />
                  </div>
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
