import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Plus, X } from 'lucide-react';
import { useSupabaseConfig } from '@/hooks/useSupabaseConfig';
import { useAuth } from '@/contexts/AuthContext';
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

  // Load configurations when drawer opens (only if not already loaded)
  React.useEffect(() => {
    if (isOpen && user && savedConfigs.length === 0 && !supabaseLoading) {
      loadConfigurations();
    }
  }, [isOpen, user, savedConfigs.length, supabaseLoading]);

  const handleCreateNewConfiguration = async (name: string, copyFromCurrent: boolean) => {
    if (copyFromCurrent) {
      try {
        // Salva la configurazione corrente con il nuovo nome
        console.log('🔄 Tentativo di salvare nuova strategia:', name);
        const configId = await saveConfiguration(name, config, dailyReturns, dailyPACOverrides);
        if (configId) {
          console.log('✅ Strategia salvata con successo, ID:', configId);
          toast({
            title: "Strategia creata",
            description: `La strategia "${name}" è stata creata copiando la configurazione corrente.`,
          });
        } else {
          console.error('❌ Salvataggio fallito - nessun ID restituito');
          toast({
            title: "Errore",
            description: "Non è stato possibile salvare la strategia",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('❌ Errore durante il salvataggio:', error);
        toast({
          title: "Errore",
          description: "Non è stato possibile salvare la strategia",
          variant: "destructive",
        });
      }
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

  const handleSaveConfiguration = async (name: string) => {
    try {
      console.log('🔄 Tentativo di salvare strategia esistente:', name);
      const configId = await saveConfiguration(name, config, dailyReturns, dailyPACOverrides);
      if (configId) {
        console.log('✅ Strategia salvata con successo, ID:', configId);
        toast({
          title: "Strategia salvata",
          description: `La strategia "${name}" è stata salvata.`,
        });
      } else {
        console.error('❌ Salvataggio fallito - nessun ID restituito');
        toast({
          title: "Errore",
          description: "Non è stato possibile salvare la strategia",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Errore durante il salvataggio:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile salvare la strategia",
        variant: "destructive",
      });
    }
  };

  const handleUpdateConfiguration = async (configId: string, name: string) => {
    try {
      console.log('🔄 Tentativo di aggiornare strategia:', name, configId);
      const success = await updateConfiguration(configId, name, config, dailyReturns, dailyPACOverrides);
      if (success) {
        console.log('✅ Strategia aggiornata con successo');
        toast({
          title: "Strategia aggiornata",
          description: `La strategia "${name}" è stata aggiornata.`,
        });
      } else {
        console.error('❌ Aggiornamento fallito');
        toast({
          title: "Errore",
          description: "Non è stato possibile aggiornare la strategia",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Errore durante l\'aggiornamento:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile aggiornare la strategia",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Gestione Strategie
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Stato di caricamento */}
          {supabaseLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Caricamento strategie...</p>
            </div>
          )}
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
              {savedConfigs.length === 0 && !supabaseLoading ? (
                <div className="text-center py-8">
                  <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-semibold text-lg mb-2">Nessuna strategia salvata</h3>
                  <p className="text-muted-foreground mb-4">
                    Crea la tua prima strategia personalizzata configurando i parametri di investimento
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
                    <strong>Suggerimento:</strong> Configura i tuoi parametri di investimento nel dashboard principale, 
                    poi torna qui per salvare la strategia con un nome personalizzato.
                  </div>
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StrategiesDrawer;