import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import { useStrategiesManager } from '@/hooks/useStrategiesManager';
import ConfigurationPanel from '@/components/ConfigurationPanel';
import StrategyPanel from '@/components/strategy/StrategyPanel';
import { ModernTooltipProvider } from '@/components/ui/ModernTooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Target } from 'lucide-react';

const ConfigurationsPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const {
    config,
    updateConfig,
    dailyReturns,
    updateDailyReturn,
    removeDailyReturn,
    exportToCSV,
    currentConfigId,
    currentConfigName,
    savedConfigs,
    saveCurrentConfiguration,
    updateCurrentConfiguration,
    loadSavedConfiguration,
    deleteConfiguration,
    supabaseLoading,
    dailyPACOverrides,
    updatePACForDay,
    removePACOverride,
    hasUnsavedChanges,
    undoConfiguration,
    redoConfiguration,
    canUndo,
    canRedo
  } = useInvestmentCalculator();
  
  // Strategies manager
  const strategiesManager = useStrategiesManager();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Enhanced unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Hai modifiche non salvate. Sei sicuro di voler uscire?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Caricamento configurazioni...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // CARICAMENTO DIRETTO SENZA WARNING - per permettere caricamento fluido
  const handleLoadConfigWithWarning = (savedConfig: any) => {
    console.log('🚀 CARICAMENTO CONFIGURAZIONE:', savedConfig.name);
    
    if (hasUnsavedChanges) {
      const confirmLoad = window.confirm(
        'Hai modifiche non salvate nella configurazione corrente. Caricando una nuova configurazione perderai queste modifiche. Vuoi continuare?'
      );
      if (!confirmLoad) return;
    }
    
    loadSavedConfiguration(savedConfig);
  };

  return (
    <ModernTooltipProvider>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Gestione Configurazioni
          </h1>
          <p className="text-slate-600 mb-4">
            Configura i parametri del tuo investimento e gestisci le tue strategie
          </p>
          {hasUnsavedChanges && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm font-medium">
                ⚠️ Hai modifiche non salvate. Ricordati di salvare la configurazione prima di uscire.
              </p>
            </div>
          )}
        </div>

        {/* Configuration Panel */}
        <Tabs defaultValue="configurations" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="configurations" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Configurazioni
            </TabsTrigger>
            <TabsTrigger value="strategies" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Strategie
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="configurations" className="animate-fade-in">
            <ConfigurationPanel
              config={config}
              onConfigChange={updateConfig}
              customReturns={dailyReturns}
              onUpdateDailyReturn={updateDailyReturn}
              onRemoveDailyReturn={removeDailyReturn}
              onExportCSV={exportToCSV}
              savedConfigs={savedConfigs}
              onLoadConfiguration={loadSavedConfiguration}
              onDeleteConfiguration={deleteConfiguration}
              onSaveConfiguration={saveCurrentConfiguration}
              onUpdateConfiguration={updateCurrentConfiguration}
              currentConfigId={currentConfigId}
              currentConfigName={currentConfigName}
              supabaseLoading={supabaseLoading}
              isAdmin={isAdmin}
              dailyPACOverrides={dailyPACOverrides}
              onUpdatePACForDay={updatePACForDay}
              onRemovePACOverride={removePACOverride}
              hasUnsavedChanges={hasUnsavedChanges}
              onUndo={undoConfiguration}
              onRedo={redoConfiguration}
              canUndo={canUndo}
              canRedo={canRedo}
            />
          </TabsContent>
          
          <TabsContent value="strategies" className="animate-fade-in">
            <StrategyPanel strategiesManager={strategiesManager} />
          </TabsContent>
        </Tabs>
      </div>
    </ModernTooltipProvider>
  );
};

export default ConfigurationsPage;