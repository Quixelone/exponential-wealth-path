import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import ReportTable from '@/components/ReportTable';
import { ModernTooltipProvider } from '@/components/ui/ModernTooltip';

const HistoryPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    config,
    investmentData,
    updateDailyReturn,
    updatePACForDay,
    removePACOverride,
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
          <p className="text-slate-600">Caricamento storico...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleUpdateDailyReturnInReport = (day: number, newReturn: number) => {
    updateDailyReturn(day, newReturn); 
  };

  const handleUpdatePACInReport = (day: number, newPAC: number) => {
    updatePACForDay(day, newPAC);
  };

  const handleRemovePACOverride = (day: number) => {
    removePACOverride(day);
  };

  return (
    <ModernTooltipProvider>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Storico Rendimenti
          </h1>
          <p className="text-slate-600">
            Visualizza e modifica i dettagli giornalieri del tuo investimento
          </p>
        </div>

        {/* Report Table */}
        <div className="animate-fade-in">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
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
    </ModernTooltipProvider>
  );
};

export default HistoryPage;