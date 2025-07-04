import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, TrendingUp } from 'lucide-react';
import { useStrategiesManager } from '@/hooks/useStrategiesManager';
import StrategyConfiguration from './StrategyConfiguration';
import StrategiesList from './StrategiesList';
import StrategyActions from './StrategyActions';

interface StrategyPanelProps {
  strategiesManager: ReturnType<typeof useStrategiesManager>;
}

const StrategyPanel: React.FC<StrategyPanelProps> = ({ strategiesManager }) => {
  const {
    hasUnsavedChanges,
    loading,
    summary,
    strategyConfig,
    currentStrategy,
  } = strategiesManager;

  const displayName = currentStrategy?.name || 'Nuova Strategia';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Pannello Configurazione Strategia */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header Strategia */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">{displayName}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {currentStrategy && !hasUnsavedChanges && (
                      <Badge variant="secondary" className="text-xs">
                        <Save className="h-3 w-3 mr-1" />
                        Salvata
                      </Badge>
                    )}
                    {hasUnsavedChanges && (
                      <Badge variant="destructive" className="animate-pulse text-xs">
                        <Save className="h-3 w-3 mr-1" />
                        Non salvata
                      </Badge>
                    )}
                    {summary && (
                      <Badge variant="outline" className="text-xs">
                        ROI: {summary.profitPercentage.toFixed(2)}%
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <StrategyActions strategiesManager={strategiesManager} />
            </div>
          </CardHeader>
        </Card>

        {/* Configurazione */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Parametri Strategia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StrategyConfiguration strategiesManager={strategiesManager} />
          </CardContent>
        </Card>

        {/* Riepilogo Performance */}
        {summary && (
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Riepilogo Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    €{summary.finalCapital.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground">Capitale Finale</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    €{summary.totalProfit.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground">Profitto Totale</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {summary.profitPercentage.toFixed(2)}%
                  </div>
                  <div className="text-sm text-muted-foreground">ROI</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    €{summary.totalPACInvested.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground">PAC Investiti</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pannello Strategie Salvate */}
      <div className="space-y-6">
        <StrategiesList 
          strategiesManager={strategiesManager}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default StrategyPanel;