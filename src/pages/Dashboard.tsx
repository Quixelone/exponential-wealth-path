
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
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title">Dashboard Investimenti</h1>
        <p className="page-subtitle">
          Panoramica della tua strategia di investimento
        </p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="stat-label">
              Configurazione Attiva
            </CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">
              {currentConfigName || 'Nessuna'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Strategia corrente
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="stat-label">
              Capitale Iniziale
            </CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">
              €{config.initialCapital.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Investimento base
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="stat-label">
              Giorno Corrente
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">
              {currentDayIndex + 1}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              di {config.timeHorizon} giorni
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="stat-label">
              Valore Finale
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">
              €{summary.final.finalCapital.toLocaleString()}
            </div>
            <p className="text-xs text-success mt-1">
              +{summary.final.totalReturn.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
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
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-success" />
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
  );
}
