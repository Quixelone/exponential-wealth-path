
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
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            Report e Analisi
          </h1>
          <p className="text-slate-600 mt-1">
            Analisi dettagliate dei tuoi investimenti
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white border border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Valore Finale
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                €{summary.final.finalCapital.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Rendimento Totale
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {summary.final.totalReturn.toFixed(2)}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Totale Investito
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                €{summary.final.totalInvested.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Profitto/Perdita
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                €{summary.final.totalInterest.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Grafico Dettagliato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InvestmentChart data={investmentData} currency={config.currency} />
          </CardContent>
        </Card>

        {/* Detailed Table */}
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
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
    </div>
  );
}
