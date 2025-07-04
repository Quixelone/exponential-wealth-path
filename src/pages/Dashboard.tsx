import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import HeroInvestmentCard from '@/components/dashboard/HeroInvestmentCard';
import TrendIndicators from '@/components/dashboard/TrendIndicators';
import InvestmentChart from '@/components/InvestmentChart';
import { ModernTooltipProvider } from '@/components/ui/ModernTooltip';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    config,
    investmentData,
    summary,
    currentDayIndex,
    currentConfigName,
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Calcola i trend per diversi periodi
  const calculateTrends = () => {
    if (!investmentData || investmentData.length === 0) {
      return [
        { period: '24H', value: 0, percentage: 0, trend: 'neutral' as const },
        { period: '7G', value: 0, percentage: 0, trend: 'neutral' as const },
        { period: '30G', value: 0, percentage: 0, trend: 'neutral' as const }
      ];
    }

    const currentData = investmentData[currentDayIndex] || investmentData[0];
    const current = currentData.finalCapital;

    // 24H (1 giorno fa)
    const oneDayAgo = Math.max(0, currentDayIndex - 1);
    const oneDayAgoData = investmentData[oneDayAgo];
    const oneDayValue = current - (oneDayAgoData?.finalCapital || current);
    const oneDayPercentage = oneDayAgoData?.finalCapital 
      ? ((current - oneDayAgoData.finalCapital) / oneDayAgoData.finalCapital) * 100
      : 0;

    // 7 giorni fa
    const sevenDaysAgo = Math.max(0, currentDayIndex - 7);
    const sevenDaysAgoData = investmentData[sevenDaysAgo];
    const sevenDaysValue = current - (sevenDaysAgoData?.finalCapital || current);
    const sevenDaysPercentage = sevenDaysAgoData?.finalCapital 
      ? ((current - sevenDaysAgoData.finalCapital) / sevenDaysAgoData.finalCapital) * 100
      : 0;

    // 30 giorni fa
    const thirtyDaysAgo = Math.max(0, currentDayIndex - 30);
    const thirtyDaysAgoData = investmentData[thirtyDaysAgo];
    const thirtyDaysValue = current - (thirtyDaysAgoData?.finalCapital || current);
    const thirtyDaysPercentage = thirtyDaysAgoData?.finalCapital 
      ? ((current - thirtyDaysAgoData.finalCapital) / thirtyDaysAgoData.finalCapital) * 100
      : 0;

    const getTrend = (value: number) => {
      if (value > 0) return 'up' as const;
      if (value < 0) return 'down' as const;
      return 'neutral' as const;
    };

    return [
      { 
        period: '24H', 
        value: oneDayValue, 
        percentage: oneDayPercentage, 
        trend: getTrend(oneDayValue) 
      },
      { 
        period: '7G', 
        value: sevenDaysValue, 
        percentage: sevenDaysPercentage, 
        trend: getTrend(sevenDaysValue) 
      },
      { 
        period: '30G', 
        value: thirtyDaysValue, 
        percentage: thirtyDaysPercentage, 
        trend: getTrend(thirtyDaysValue) 
      }
    ];
  };

  const trends = calculateTrends();

  return (
    <ModernTooltipProvider>
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                📈 Dashboard {currentConfigName ? currentConfigName : "Investimenti"}
              </h1>
              <p className="text-muted-foreground text-lg">
                {currentConfigName 
                  ? `Monitora la crescita della strategia "${currentConfigName}"`
                  : "Monitora la crescita del tuo portafoglio e analizza le performance"}
              </p>
            </div>
            {currentConfigName && (
              <div className="text-right bg-primary/10 rounded-lg p-3 border border-primary/20">
                <p className="text-sm text-muted-foreground font-medium">Configurazione attiva</p>
                <p className="text-xl font-bold text-primary">
                  {currentConfigName}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Hero Investment Card */}
        <HeroInvestmentCard 
          summary={summary}
          currency={config.currency}
          className="animate-fade-in"
        />

        {/* Trend Indicators */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            📊 Andamento Recente
          </h2>
          <TrendIndicators 
            trends={trends}
            currency={config.currency}
          />
        </div>

        {/* Interactive Chart */}
        <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            📈 Grafico Crescita
          </h2>
          <InvestmentChart 
            data={investmentData} 
            currency={config.currency} 
          />
        </div>

        {/* Quick Actions */}
        <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="bg-card rounded-xl p-6 border border-border shadow-lg">
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              ⚡ Azioni Rapide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button 
                onClick={() => navigate('/configurations')}
                className="group p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all duration-300 text-left hover:scale-[1.02] hover:from-primary/15 hover:to-primary/10"
              >
                <div className="text-lg font-bold text-primary group-hover:text-primary/90 transition-colors mb-2">
                  🔧 Modifica Configurazione
                </div>
                <div className="text-sm text-muted-foreground">
                  Aggiorna parametri di investimento
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/history')}
                className="group p-6 bg-gradient-to-br from-chart-2/10 to-chart-2/5 rounded-xl border-2 border-chart-2/20 hover:border-chart-2/40 hover:shadow-lg transition-all duration-300 text-left hover:scale-[1.02] hover:from-chart-2/15 hover:to-chart-2/10"
              >
                <div className="text-lg font-bold text-chart-2 group-hover:text-chart-2/90 transition-colors mb-2">
                  📊 Visualizza Storico
                </div>
                <div className="text-sm text-muted-foreground">
                  Analizza rendimenti passati
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/reminders')}
                className="group p-6 bg-gradient-to-br from-chart-3/10 to-chart-3/5 rounded-xl border-2 border-chart-3/20 hover:border-chart-3/40 hover:shadow-lg transition-all duration-300 text-left hover:scale-[1.02] hover:from-chart-3/15 hover:to-chart-3/10"
              >
                <div className="text-lg font-bold text-chart-3 group-hover:text-chart-3/90 transition-colors mb-2">
                  🔔 Gestisci Promemoria
                </div>
                <div className="text-sm text-muted-foreground">
                  Configura notifiche PAC
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModernTooltipProvider>
  );
};

export default Dashboard;