
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, BarChart3 } from 'lucide-react';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import ReportTable from '@/components/ReportTable';
import InvestmentChart from '@/components/InvestmentChart';

export default function ReportsPage() {
  const {
    config,
    investmentData,
    summary,
    updateDailyReturn,
    updatePACForDay,
    removePACOverride,
    exportToCSV
  } = useInvestmentCalculator();

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
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          Report e Analisi
        </h1>
        <p className="page-subtitle">
          Analisi dettagliate dei tuoi investimenti
        </p>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="stat-label">
              Valore Finale
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">
              €{summary.final.finalCapital.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="stat-label">
              Rendimento Totale
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">
              {summary.final.totalReturn.toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="stat-label">
              Totale Investito
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">
              €{summary.final.totalInvested.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="stat-label">
              Profitto/Perdita
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">
              €{summary.final.totalInterest.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="bg-white mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Grafico Dettagliato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InvestmentChart data={investmentData} currency={config.currency} />
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-success" />
              Tabella Dettagliata
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-md font-medium transition-colors duration-200 shadow-sm"
            >
              <Download className="h-4 w-4" />
              Esporta CSV
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
