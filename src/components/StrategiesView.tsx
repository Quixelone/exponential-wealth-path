import React, { useState } from 'react';
import { ChevronLeft, Plus, Target, FileText, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSupabaseConfig } from '@/hooks/useSupabaseConfig';
import { useAuth } from '@/hooks/useAuth';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import { useToast } from '@/hooks/use-toast';
import NewConfigurationDialog from '@/components/configuration/NewConfigurationDialog';
import { formatCurrency, Currency } from '@/lib/utils';
import { SavedConfiguration } from '@/types/database';

interface StrategiesViewProps {
  onBackToDashboard: () => void;
}

const StrategiesView: React.FC<StrategiesViewProps> = ({ onBackToDashboard }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showNewDialog, setShowNewDialog] = useState(false);
  
  const {
    savedConfigs,
    loading: supabaseLoading,
    deleteConfiguration,
    saveConfiguration,
    updateConfiguration,
    loadConfigurations,
  } = useSupabaseConfig();

  const {
    config,
    dailyReturns,
    dailyPACOverrides,
    loadSavedConfiguration,
    currentConfigId,
    currentConfigName,
    hasUnsavedChanges
  } = useInvestmentCalculator();

  // Load configurations when component mounts
  React.useEffect(() => {
    if (user) {
      loadConfigurations();
    }
  }, [user, loadConfigurations]);

  const handleCreateNewConfiguration = (name: string, copyFromCurrent: boolean) => {
    if (copyFromCurrent) {
      saveConfiguration(name, config, dailyReturns, dailyPACOverrides);
      toast({
        title: "Strategia creata",
        description: `La strategia "${name}" è stata creata copiando la configurazione corrente.`,
      });
    } else {
      onBackToDashboard();
      toast({
        title: "Nuova strategia",
        description: "Puoi configurare la nuova strategia usando i parametri di configurazione.",
      });
    }
    setShowNewDialog(false);
  };

  const handleLoadConfiguration = (config: any) => {
    loadSavedConfiguration(config);
    toast({
      title: "Strategia caricata",
      description: `La strategia "${config.name}" è stata caricata.`,
    });
    onBackToDashboard();
  };

  const handleDeleteConfiguration = (configId: string) => {
    deleteConfiguration(configId);
    toast({
      title: "Strategia eliminata",
      description: "La strategia è stata eliminata con successo.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const getStrategyMetrics = (strategy: SavedConfiguration) => {
    const config = strategy.config;
    const totalDays = config.timeHorizon;
    const pacFrequency = config.pacConfig.frequency;
    let paymentsPerYear = 0;
    
    switch (pacFrequency) {
      case 'daily': paymentsPerYear = 365; break;
      case 'weekly': paymentsPerYear = 52; break;
      case 'monthly': paymentsPerYear = 12; break;
      case 'custom': paymentsPerYear = config.pacConfig.customDays ? Math.floor(365 / config.pacConfig.customDays) : 0; break;
      default: paymentsPerYear = 0;
    }
    
    const totalInvestment = config.initialCapital + (config.pacConfig.amount * paymentsPerYear * (totalDays / 365));
    
    return {
      totalInvestment,
      annualReturn: config.dailyReturnRate * 365,
      timeHorizon: totalDays
    };
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Effettua il login per gestire le tue strategie</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBackToDashboard}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Target className="h-8 w-8 text-primary" />
              Gestione Strategie
            </h1>
            <p className="text-muted-foreground">Crea e gestisci le tue strategie di investimento</p>
          </div>
        </div>
        
        <Button onClick={() => setShowNewDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuova Strategia
        </Button>
      </div>

      {/* Current Strategy Alert */}
      {currentConfigName && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-primary rounded-full animate-pulse"></div>
              <div>
                <p className="font-medium">Strategia attiva: {currentConfigName}</p>
                <p className="text-sm text-muted-foreground">
                  {hasUnsavedChanges ? 'Modifiche non salvate' : 'Configurazione caricata'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategies Grid */}
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Le Tue Strategie</h2>
          <Badge variant="secondary" className="text-sm">
            {savedConfigs.length} {savedConfigs.length === 1 ? 'strategia' : 'strategie'}
          </Badge>
        </div>
        
        {supabaseLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : savedConfigs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Nessuna strategia salvata</h3>
              <p className="text-muted-foreground mb-4">
                Crea la tua prima strategia di investimento per iniziare
              </p>
              <Button onClick={() => setShowNewDialog(true)}>
                Crea Prima Strategia
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedConfigs.map((strategy) => {
              const isActive = currentConfigId === strategy.id;
              const metrics = getStrategyMetrics(strategy);
              
              return (
                <Card 
                  key={strategy.id} 
                  className={`group hover:shadow-lg transition-all duration-200 cursor-pointer ${
                    isActive ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {strategy.name}
                          {isActive && (
                            <Badge variant="default" className="text-xs">
                              Attiva
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(strategy.created_at)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Capitale iniziale</p>
                        <p className="font-medium">{formatCurrency(strategy.config.initialCapital, 'EUR')}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">PAC</p>
                        <p className="font-medium">{formatCurrency(strategy.config.pacConfig.amount, 'EUR')}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Rendimento</p>
                        <p className="font-medium flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          {formatPercentage(metrics.annualReturn)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Orizzonte</p>
                        <p className="font-medium">{Math.floor(metrics.timeHorizon / 365)} anni</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm">Investimento totale stimato</p>
                      <p className="font-semibold text-primary">{formatCurrency(metrics.totalInvestment, 'EUR')}</p>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant={isActive ? "secondary" : "default"}
                        className="flex-1"
                        onClick={() => handleLoadConfiguration(strategy)}
                        disabled={isActive}
                      >
                        {isActive ? 'In uso' : 'Carica'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteConfiguration(strategy.id)}
                      >
                        Elimina
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {showNewDialog && (
        <NewConfigurationDialog
          onCreateNew={handleCreateNewConfiguration}
          hasCurrentConfig={!!currentConfigId}
          currentConfigName={currentConfigName || "Configurazione attuale"}
        />
      )}
    </div>
  );
};

export default StrategiesView;