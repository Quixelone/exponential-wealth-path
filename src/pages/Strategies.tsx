import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Plus } from 'lucide-react';
import { useSupabaseConfig } from '@/hooks/useSupabaseConfig';
import { useAuth } from '@/hooks/useAuth';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import SavedConfigurationsPanel from '@/components/configuration/SavedConfigurationsPanel';
import NewConfigurationButton from '@/components/configuration/NewConfigurationButton';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Strategies: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    savedConfigs,
    loading: supabaseLoading,
    deleteConfiguration,
    saveConfiguration,
    updateConfiguration,
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

  const handleCreateNewConfiguration = (name: string, copyFromCurrent: boolean) => {
    if (copyFromCurrent) {
      // Salva la configurazione corrente con il nuovo nome
      saveConfiguration(name, config, dailyReturns, dailyPACOverrides);
      toast({
        title: "Strategia creata",
        description: `La strategia "${name}" è stata creata copiando la configurazione corrente.`,
      });
    } else {
      // Crea una nuova strategia e naviga al dashboard
      toast({
        title: "Nuova strategia",
        description: "Redirecting al dashboard per configurare la nuova strategia.",
      });
      navigate('/');
    }
  };

  const handleLoadConfiguration = (config: any) => {
    loadSavedConfiguration(config);
    toast({
      title: "Strategia caricata",
      description: `La strategia "${config.name}" è stata caricata.`,
    });
    navigate('/');
  };

  const handleDeleteConfiguration = (configId: string) => {
    deleteConfiguration(configId);
    toast({
      title: "Strategia eliminata",
      description: "La strategia è stata eliminata con successo.",
    });
  };

  const handleSaveConfiguration = (name: string) => {
    saveConfiguration(name, config, dailyReturns, dailyPACOverrides);
    toast({
      title: "Strategia salvata",
      description: `La strategia "${name}" è stata salvata.`,
    });
  };

  const handleUpdateConfiguration = (configId: string, name: string) => {
    updateConfiguration(configId, name, config, dailyReturns, dailyPACOverrides);
    toast({
      title: "Strategia aggiornata",
      description: `La strategia "${name}" è stata aggiornata.`,
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground">
                Accedi per gestire le tue strategie di investimento.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Gestione Strategie
        </h1>
        <p className="text-muted-foreground">
          Crea, modifica e gestisci le tue strategie di investimento
        </p>
      </div>

      {/* Nuova Strategia */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Crea Nuova Strategia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NewConfigurationButton 
            onCreateNew={handleCreateNewConfiguration}
            hasCurrentConfig={!!currentConfigId}
            currentConfigName={currentConfigName || "Configurazione attuale"}
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

export default Strategies;