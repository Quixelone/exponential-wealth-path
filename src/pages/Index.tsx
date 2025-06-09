
import React, { useState } from 'react';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import InvestmentChart from '@/components/InvestmentChart';
import ConfigurationPanel from '@/components/ConfigurationPanel';
import InvestmentSummary from '@/components/InvestmentSummary';
import ReportTable from '@/components/ReportTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Settings, TrendingUp, Calculator, Table } from 'lucide-react';

const Index = () => {
  const {
    config,
    updateConfig,
    investmentData,
    dailyReturns,
    updateDailyReturn,
    removeDailyReturn,
    exportToCSV,
    summary
  } = useInvestmentCalculator();

  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="wealth-gradient text-white py-8 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <Calculator className="inline-block mr-3 h-12 w-12 md:h-16 md:w-16" />
              Finanza Creativa
            </h1>
            <p className="text-xl md:text-2xl mb-2 opacity-90">
              Gestore Interesse Composto
            </p>
            <p className="text-lg md:text-xl opacity-80">
              Trasforma i tuoi risparmi in un fiume in piena
            </p>
            <Button 
              size="lg" 
              className="mt-6 bg-white text-primary hover:bg-gray-100 animate-pulse-gentle"
              onClick={() => setActiveTab('dashboard')}
            >
              Inizia la tua crescita esponenziale
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurazione
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              Report
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Scenari
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Summary Cards */}
            <InvestmentSummary summary={summary} />
            
            {/* Main Chart */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3">
                <InvestmentChart data={investmentData} />
              </div>
              
              {/* Quick Stats */}
              <div className="space-y-4">
                <Card className="animate-fade-in">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold wealth-gradient-text mb-2">
                        {Math.round(config.timeHorizon / 365 * 10) / 10}
                      </div>
                      <div className="text-sm text-muted-foreground">Anni di investimento</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold wealth-gradient-text mb-2">
                        {config.dailyReturnRate.toFixed(3)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Rendimento giornaliero</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold wealth-gradient-text mb-2">
                        {Object.keys(dailyReturns).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Rendimenti personalizzati</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Educational Message */}
            <Card className="animate-fade-in bg-gradient-to-r from-blue-50 to-teal-50 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2 wealth-gradient-text">
                    💡 Il Potere dell'Interesse Composto
                  </h3>
                  <p className="text-muted-foreground">
                    "L'interesse composto è l'ottava meraviglia del mondo. Chi lo capisce, lo guadagna; 
                    chi non lo capisce, lo paga." - Albert Einstein
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <InvestmentChart data={investmentData} />
              </div>
              <div>
                <ConfigurationPanel
                  config={config}
                  onConfigChange={updateConfig}
                  dailyReturns={dailyReturns}
                  onUpdateDailyReturn={updateDailyReturn}
                  onRemoveDailyReturn={removeDailyReturn}
                  onExportCSV={exportToCSV}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="report" className="space-y-6">
            <ReportTable data={investmentData} onExportCSV={exportToCSV} />
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-6">
            <Card className="animate-fade-in">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Analisi Scenari</h3>
                  <p className="text-muted-foreground mb-4">
                    Funzionalità in sviluppo per confrontare scenari ottimistici, realistici e pessimistici
                  </p>
                  <Button variant="outline">
                    Scopri di più
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 py-8 px-4 md:px-6 mt-12">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 Wealth Compass - Il tuo compagno per la crescita finanziaria
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
