
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Calendar, Target } from 'lucide-react';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import InvestmentChart from '@/components/InvestmentChart';
import InvestmentSummary from '@/components/InvestmentSummary';

export default function Dashboard() {
  const { 
    config, 
    investmentData, 
    summary, 
    currentConfigName,
    currentDayIndex 
  } = useInvestmentCalculator();

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Investimenti</h1>
          <p className="text-slate-600 mt-1">
            Panoramica della tua strategia di investimento
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Configurazione Attiva
              </CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {currentConfigName || 'Nessuna'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Strategia corrente
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Capitale Iniziale
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                €{config.initialCapital.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Investimento base
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Giorno Corrente
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {currentDayIndex + 1}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                di {config.timeHorizon} giorni
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Valore Finale
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                €{summary.final.finalCapital.toLocaleString()}
              </div>
              <p className="text-xs text-green-600 mt-1">
                +{summary.final.totalReturn.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2">
            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Grafico Investimenti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InvestmentChart data={investmentData} currency={config.currency} />
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Sommario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InvestmentSummary summary={summary} currency={config.currency} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
