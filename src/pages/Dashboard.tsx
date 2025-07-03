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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Dashboard Investimenti
          </h1>
          <p className="text-slate-600">
            Monitora la crescita del tuo portafoglio e analizza le performance
          </p>
        </div>

        {/* Hero Investment Card */}
        <HeroInvestmentCard 
          summary={summary}
          currency={config.currency}
          className="animate-fade-in"
        />

        {/* Trend Indicators */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Andamento Recente
          </h2>
          <TrendIndicators 
            trends={trends}
            currency={config.currency}
          />
        </div>

        {/* Interactive Chart */}
        <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Grafico Crescita
          </h2>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <InvestmentChart 
              data={investmentData} 
              currency={config.currency} 
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Azioni Rapide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => navigate('/configurations')}
                className="p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left"
              >
                <div className="text-sm font-medium text-slate-900">Modifica Configurazione</div>
                <div className="text-xs text-slate-600 mt-1">
                  Aggiorna parametri di investimento
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/history')}
                className="p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left"
              >
                <div className="text-sm font-medium text-slate-900">Visualizza Storico</div>
                <div className="text-xs text-slate-600 mt-1">
                  Analizza rendimenti passati
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/reminders')}
                className="p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left"
              >
                <div className="text-sm font-medium text-slate-900">Gestisci Promemoria</div>
                <div className="text-xs text-slate-600 mt-1">
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