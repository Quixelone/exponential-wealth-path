import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import InvestmentChart from '@/components/InvestmentChart';
import InvestmentSummary from '@/components/InvestmentSummary';
import { ModernTooltipProvider } from '@/components/ui/ModernTooltip';

const ChartsPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    config,
    investmentData,
    summary,
    exportToCSV
  } = useInvestmentCalculator();

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
          <p className="text-slate-600">Caricamento grafici...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ModernTooltipProvider>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Analisi Grafica
          </h1>
          <p className="text-slate-600">
            Visualizza l'andamento dettagliato del tuo investimento nel tempo
          </p>
        </div>

        {/* Investment Summary */}
        <div className="animate-fade-in">
          <InvestmentSummary summary={summary} currency={config.currency} />
        </div>

        {/* Main Chart */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <InvestmentChart 
              data={investmentData} 
              currency={config.currency} 
            />
          </div>
        </div>

        {/* Export Actions */}
        <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Esporta Dati
            </h3>
            <p className="text-slate-600 mb-4">
              Scarica i dati del tuo investimento per analisi più approfondite
            </p>
            <button
              onClick={exportToCSV}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Esporta CSV
            </button>
          </div>
        </div>
      </div>
    </ModernTooltipProvider>
  );
};

export default ChartsPage;