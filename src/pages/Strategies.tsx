import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Plus, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useSupabaseConfig } from '@/hooks/useSupabaseConfig';
import { useAuth } from '@/contexts/AuthContext';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import SavedConfigurationsPanel from '@/components/configuration/SavedConfigurationsPanel';
import NewStrategyWizard from '@/components/configuration/NewStrategyWizard';
import ConfigurationPanel from '@/components/ConfigurationPanel';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layout/AppLayout';

const Strategies: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    savedConfigs,
    loading: supabaseLoading,
    error: supabaseError,
    deleteConfiguration,
    saveConfiguration,
    updateConfiguration,
    loadConfigurations,
  } = useSupabaseConfig();

  const {
    config,
    updateConfig,
    createNewConfiguration,
    dailyReturns,
    updateDailyReturn,
    removeDailyReturn,
    exportToCSV,
    dailyPACOverrides,
    updatePACForDay,
    removePACOverride,
    loadSavedConfiguration,
    currentConfigId,
    currentConfigName,
    hasUnsavedChanges,
    saveCurrentConfiguration,
    updateCurrentConfiguration,
    undoConfiguration,
    redoConfiguration,
    canUndo,
    canRedo
  } = useInvestmentCalculator();

  const handleCreateNewConfiguration = async (name: string, copyFromCurrent: boolean, currency: 'EUR' | 'USD' | 'USDT') => {
    console.log('🔄 Strategies: Creating new configuration', { name, copyFromCurrent, currency });
    try {
      if (copyFromCurrent) {
        // Salva la configurazione corrente con il nuovo nome
        console.log('🔄 Strategies: Attempting to save configuration with data:', {
          name,
          configKeys: Object.keys(config),
          dailyReturnsCount: Object.keys(dailyReturns).length,
          dailyPACOverridesCount: Object.keys(dailyPACOverrides).length
        });
        
        const result = await saveConfiguration(name, config, dailyReturns, dailyPACOverrides);
        
        if (result) {
          console.log('✅ Strategies: Configuration saved successfully, ID:', result);
          toast({
            title: "Strategia creata",
            description: `La strategia "${name}" è stata creata copiando la configurazione corrente.`,
          });
          
          // Stay on strategies page after creating the configuration
          // Non ricaricare le configurazioni per evitare di sovrascrivere la selezione corrente
        } else {
          console.error('❌ Strategies: Save returned null/false');
          toast({
            title: "Errore",
            description: "Non è stato possibile salvare la strategia.",
            variant: "destructive"
          });
        }
      } else {
        // Crea una nuova strategia base e imposta la valuta scelta
        createNewConfiguration();
        updateConfig({ currency });
        toast({
          title: "Nuova strategia",
          description: `Strategia "${name}" creata. Imposta i parametri e salva quando pronto.`,
        });
      }

    } catch (error) {
      console.error('❌ Strategies: Error creating configuration', error);
      toast({
        title: "Errore",
        description: "Errore durante la creazione della strategia.",
        variant: "destructive"
      });
    }
  };

  const handleWizardCreate = async (payload: {
    name: string;
    copyFromCurrent: boolean;
    currency: 'EUR' | 'USD' | 'USDT';
    params?: {
      initialCapital: number;
      timeHorizon: number;
      dailyReturnRate: number;
      pacAmount: number;
      pacFrequency: 'daily' | 'weekly' | 'monthly' | 'custom';
      pacCustomDays?: number;
      pacStartDate: Date;
    };
  }) => {
    const { name, copyFromCurrent, currency, params } = payload;
    console.log('🔄 [Strategies] handleWizardCreate called:', { name, copyFromCurrent, currency, params });
    
    if (copyFromCurrent) {
      await handleCreateNewConfiguration(name, true, currency);
      return;
    }

    try {
      // Create new local configuration using quick params
      createNewConfiguration();
      
      const newConfig = {
        currency,
        initialCapital: params?.initialCapital ?? 1000,
        timeHorizon: params?.timeHorizon ?? 365,
        dailyReturnRate: params?.dailyReturnRate ?? 0.1,
        pacConfig: {
          amount: params?.pacAmount ?? 100,
          frequency: params?.pacFrequency ?? 'monthly',
          customDays: params?.pacFrequency === 'custom' ? params?.pacCustomDays : undefined,
          startDate: params?.pacStartDate ?? new Date(),
        }
      };
      
      console.log('🔄 [Strategies] Updating config with:', newConfig);
      updateConfig(newConfig);
      
      // Salva automaticamente la nuova strategia
      console.log('🔄 [Strategies] Auto-saving new strategy:', name);
      const result = await saveConfiguration(name, { 
        ...config, 
        ...newConfig 
      }, {}, {});
      
      if (result) {
        console.log('✅ [Strategies] New strategy auto-saved with ID:', result);
        toast({
          title: 'Strategia creata e salvata',
          description: `La strategia "${name}" è stata creata e salvata automaticamente.`,
        });
      } else {
        console.error('❌ [Strategies] Auto-save failed');
        toast({
          title: 'Strategia creata',
          description: `La strategia "${name}" è stata creata. Salvala manualmente per conservarla.`,
        });
      }
    } catch (error) {
      console.error('❌ [Strategies] Error in handleWizardCreate:', error);
      toast({
        title: "Errore",
        description: "Errore durante la creazione della strategia.",
        variant: "destructive"
      });
    }
  };
  const handleLoadConfiguration = (config: any) => {
    console.log('🔄 Strategies: Loading configuration', { configId: config.id, name: config.name });
    try {
      loadSavedConfiguration(config);
      console.log('✅ Strategies: Configuration loaded successfully, navigating to dashboard');
      toast({
        title: "Strategia caricata",
        description: `La strategia "${config.name}" è stata caricata.`,
      });
      navigate('/app');
    } catch (error) {
      console.error('❌ Strategies: Error loading configuration', error);
      toast({
        title: "Errore",
        description: "Errore durante il caricamento della strategia.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteConfiguration = async (configId: string) => {
    console.log('🔄 Strategies: Deleting configuration', { configId });
    try {
      await deleteConfiguration(configId);
      toast({
        title: "Strategia eliminata",
        description: "La strategia è stata eliminata con successo.",
      });
    } catch (error) {
      console.error('❌ Strategies: Error deleting configuration', error);
      toast({
        title: "Errore",
        description: "Errore durante l'eliminazione della strategia.",
        variant: "destructive"
      });
    }
  };

  const handleSaveConfiguration = async (name: string) => {
    console.log('🔄 Strategies: Saving configuration', { name });
    try {
      const result = await saveConfiguration(name, config, dailyReturns, dailyPACOverrides);
      if (result) {
        console.log('✅ Strategies: Configuration saved successfully, ID:', result);
        toast({
          title: "Strategia salvata",
          description: `La strategia "${name}" è stata salvata.`,
        });
        // Non ricaricare le configurazioni per evitare di sovrascrivere la selezione corrente
      } else {
        console.error('❌ Strategies: Save returned null/false');
        toast({
          title: "Errore",
          description: "Non è stato possibile salvare la strategia.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Strategies: Error saving configuration', error);
      toast({
        title: "Errore",
        description: "Errore durante il salvataggio della strategia.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateConfiguration = async (configId: string, name: string) => {
    console.log('🔄 Strategies: Updating configuration', { configId, name });
    try {
      await updateConfiguration(configId, name, config, dailyReturns, dailyPACOverrides);
      console.log('✅ Strategies: Configuration updated successfully');
      toast({
        title: "Strategia aggiornata",
        description: `La strategia "${name}" è stata aggiornata.`,
      });
    } catch (error) {
      console.error('❌ Strategies: Error updating configuration', error);
      toast({
        title: "Errore",
        description: "Errore durante l'aggiornamento della strategia.",
        variant: "destructive"
      });
    }
  };

  // Load configurations on mount - only once
  useEffect(() => {
    if (user && savedConfigs.length === 0 && !supabaseLoading) {
      console.log('🔄 Strategies: Loading configurations for user (first time)');
      loadConfigurations();
    }
  }, [user, savedConfigs.length, supabaseLoading]);

  const handleRetryLoad = () => {
    console.log('🔄 Strategies: Manual retry triggered');
    loadConfigurations();
  };

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Will redirect to auth via useEffect
  }

  const renderStrategiesContent = () => {
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/app')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Gestione Strategie
            </h1>
            <p className="text-muted-foreground">
              Configura e gestisci le tue strategie di investimento
            </p>
          </div>
        </div>

        {/* Error State */}
        {supabaseError && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <div className="flex-1">
                  <h3 className="font-semibold">Errore nel caricamento</h3>
                  <p className="text-sm opacity-90">{supabaseError}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetryLoad}
                  className="border-destructive/20 hover:bg-destructive/10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Riprova
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuration Panel */}
        <ConfigurationPanel
          config={config}
          onConfigChange={updateConfig}
          customReturns={dailyReturns}
          onUpdateDailyReturn={updateDailyReturn}
          onRemoveDailyReturn={removeDailyReturn}
          onExportCSV={exportToCSV}
          isAdmin={isAdmin}
          dailyPACOverrides={dailyPACOverrides}
          onUpdatePACForDay={updatePACForDay}
          onRemovePACOverride={removePACOverride}
          hasUnsavedChanges={hasUnsavedChanges}
          currentConfigId={currentConfigId}
          currentConfigName={currentConfigName}
          onSaveStrategy={saveCurrentConfiguration}
          onUpdateStrategy={updateCurrentConfiguration}
          onUndo={undoConfiguration}
          onRedo={redoConfiguration}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        {/* Nuova Strategia */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Crea Nuova Strategia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NewStrategyWizard
              onCreate={handleWizardCreate}
              hasCurrentConfig={!!currentConfigId}
              currentConfigName={currentConfigName || 'Configurazione attuale'}
            />
          </CardContent>
        </Card>

        {/* Strategie Salvate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Le Tue Strategie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SavedConfigurationsPanel
              savedConfigs={savedConfigs}
              onLoadConfiguration={handleLoadConfiguration}
              onDeleteConfiguration={handleDeleteConfiguration}
              onSaveConfiguration={handleSaveConfiguration}
              onUpdateConfiguration={handleUpdateConfiguration}
              currentConfigId={currentConfigId}
              currentConfigName={currentConfigName}
              loading={supabaseLoading}
              isAdmin={isAdmin}
              hasUnsavedChanges={hasUnsavedChanges}
            />
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <AppLayout hasUnsavedChanges={hasUnsavedChanges}>
      {renderStrategiesContent()}
    </AppLayout>
  );
};

export default Strategies;