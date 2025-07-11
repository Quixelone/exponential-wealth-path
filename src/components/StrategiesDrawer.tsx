import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Plus, X } from 'lucide-react';
import { useSupabaseConfig } from '@/hooks/useSupabaseConfig';
import { useAuth } from '@/hooks/useAuth';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import SavedConfigurationsPanel from '@/components/configuration/SavedConfigurationsPanel';
import NewConfigurationButton from '@/components/configuration/NewConfigurationButton';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface StrategiesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const StrategiesDrawer: React.FC<StrategiesDrawerProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  
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

  // Load configurations when drawer opens
  React.useEffect(() => {
    if (isOpen && user) {
      loadConfigurations();
    }
  }, [isOpen, user, loadConfigurations]);

  const handleCreateNewConfiguration = (name: string, copyFromCurrent: boolean) => {
    if (copyFromCurrent) {
      // Salva la configurazione corrente con il nuovo nome
      saveConfiguration(name, config, dailyReturns, dailyPACOverrides);
      toast({
        title: "Strategia creata",
        description: `La strategia "${name}" è stata creata copiando la configurazione corrente.`,
      });
    } else {
      // Chiudi il drawer e torna al dashboard per configurare una nuova strategia
      onClose();
      toast({
        title: "Nuova strategia",
        description: "Puoi configurare la nuova strategia usando i parametri di configurazione.",
      });
    }
  };

  const handleLoadConfiguration = (config: any) => {
    loadSavedConfiguration(config);
    toast({
      title: "Strategia caricata",
      description: `La strategia "${config.name}" è stata caricata.`,
    });
    onClose();
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
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Gestione Strategie
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Nuova Strategia */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Plus className="h-4 w-4" />
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
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4" />
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
      </SheetContent>
    </Sheet>
  );
};

export default StrategiesDrawer;