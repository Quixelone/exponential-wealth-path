
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Plus, Save } from 'lucide-react';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import ConfigurationPanel from '@/components/ConfigurationPanel';

export default function ConfigurationsPage() {
  const {
    config,
    updateConfig,
    dailyReturns,
    updateDailyReturn,
    removeDailyReturn,
    dailyPACOverrides,
    updatePACForDay,
    removePACOverride,
    savedConfigs,
    loadSavedConfiguration,
    deleteConfiguration,
    saveCurrentConfiguration,
    updateCurrentConfiguration,
    currentConfigId,
    currentConfigName,
    supabaseLoading,
    hasUnsavedChanges,
    createNewConfiguration
  } = useInvestmentCalculator();

  const handleLoadConfigWithWarning = (savedConfig: any) => {
    if (hasUnsavedChanges) {
      const confirmLoad = window.confirm(
        'Hai modifiche non salvate nella configurazione corrente. Caricando una nuova configurazione perderai queste modifiche. Vuoi continuare?'
      );
      if (!confirmLoad) return;
    }
    loadSavedConfiguration(savedConfig);
  };

  const handleSaveCurrentConfiguration = async () => {
    if (!currentConfigName) {
      const name = prompt('Nome della configurazione:');
      if (name) {
        await saveCurrentConfiguration(name);
      }
    } else {
      await saveCurrentConfiguration(currentConfigName);
    }
  };

  const handleCreateNewConfiguration = () => {
    const confirmCreate = window.confirm(
      'Sei sicuro di voler creare una nuova configurazione? Tutte le modifiche non salvate andranno perse.'
    );
    if (confirmCreate) {
      createNewConfiguration();
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          Gestione Configurazioni
        </h1>
        <p className="page-subtitle">
          Configura e gestisci le tue strategie di investimento
        </p>
      </div>

      {/* Status Cards */}
      <div className="stats-grid">
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="stat-label">
              Configurazione Attiva
            </CardTitle>
            <Settings className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="stat-value text-lg">
              {currentConfigName || 'Nessuna configurazione'}
            </div>
            {hasUnsavedChanges && (
              <div className="mt-2">
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                  Modifiche non salvate
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="stat-label">
              Configurazioni Salvate
            </CardTitle>
            <Save className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="stat-value">
              {savedConfigs.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Strategie disponibili
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="stat-label">
              Azioni Rapide
            </CardTitle>
            <Plus className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button
                onClick={handleSaveCurrentConfiguration}
                disabled={!hasUnsavedChanges}
                className="w-full text-left px-3 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Salva Modifiche
              </button>
              <button
                onClick={handleCreateNewConfiguration}
                className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
              >
                Nuova Configurazione
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Panel */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Pannello di Configurazione</CardTitle>
        </CardHeader>
        <CardContent>
          <ConfigurationPanel
            config={config}
            onConfigChange={updateConfig}
            customReturns={dailyReturns}
            onUpdateDailyReturn={updateDailyReturn}
            onRemoveDailyReturn={removeDailyReturn}
            onExportCSV={() => {}}
            savedConfigs={savedConfigs}
            onLoadConfiguration={handleLoadConfigWithWarning}
            onDeleteConfiguration={deleteConfiguration}
            onSaveConfiguration={handleSaveCurrentConfiguration}
            onUpdateConfiguration={updateCurrentConfiguration}
            currentConfigId={currentConfigId}
            currentConfigName={currentConfigName}
            supabaseLoading={supabaseLoading}
            isAdmin={false}
            dailyPACOverrides={dailyPACOverrides}
            onUpdatePACForDay={updatePACForDay}
            onRemovePACOverride={removePACOverride}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </CardContent>
      </Card>
    </div>
  );
}
