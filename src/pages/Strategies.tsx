import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { useSupabaseConfig } from '@/hooks/useSupabaseConfig';
import { useAuth } from '@/hooks/useAuth';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import SavedConfigurationsPanel from '@/components/configuration/SavedConfigurationsPanel';
import NewConfigurationButton from '@/components/configuration/NewConfigurationButton';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useDeviceInfo } from '@/hooks/use-mobile';
import { ModernTooltipProvider } from '@/components/ui/ModernTooltip';
import ModernSidebar from '@/components/dashboard/ModernSidebar';
import ModernHeader from '@/components/dashboard/ModernHeader';
import MobileHeader from '@/components/mobile/MobileHeader';
import MobileDrawer from '@/components/mobile/MobileDrawer';
import BottomNavigation from '@/components/mobile/BottomNavigation';

const Strategies: React.FC = () => {
  const { user, userProfile, loading: authLoading, signOut, isAdmin } = useAuth();
  const { isMobile, isTablet } = useDeviceInfo();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
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
    dailyReturns,
    dailyPACOverrides,
    loadSavedConfiguration,
    currentConfigId,
    currentConfigName,
    hasUnsavedChanges
  } = useInvestmentCalculator();

  const handleCreateNewConfiguration = async (name: string, copyFromCurrent: boolean) => {
    console.log('🔄 Strategies: Creating new configuration', { name, copyFromCurrent });
    try {
      if (copyFromCurrent) {
        // Salva la configurazione corrente con il nuovo nome
        await saveConfiguration(name, config, dailyReturns, dailyPACOverrides);
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
    } catch (error) {
      console.error('❌ Strategies: Error creating configuration', error);
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
      toast({
        title: "Strategia caricata",
        description: `La strategia "${config.name}" è stata caricata.`,
      });
      navigate('/');
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
      await saveConfiguration(name, config, dailyReturns, dailyPACOverrides);
      toast({
        title: "Strategia salvata",
        description: `La strategia "${name}" è stata salvata.`,
      });
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

  // Load configurations on mount
  useEffect(() => {
    if (user) {
      console.log('🔄 Strategies: Loading configurations for user');
      loadConfigurations();
    }
  }, [user, loadConfigurations]);

  const handleRetryLoad = () => {
    console.log('🔄 Strategies: Manual retry triggered');
    loadConfigurations();
  };

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento dati utente...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth via useEffect
  }

  const renderStrategiesContent = () => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Gestione Strategie
          </h1>
          <p className="text-muted-foreground">
            Crea, modifica e gestisci le tue strategie di investimento
          </p>
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

  return (
    <ModernTooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Desktop Layout */}
        {!isMobile && !isTablet && (
          <div className="flex min-h-screen w-full">
            <ModernSidebar 
              isAdmin={isAdmin}
              onCollapseChange={setIsSidebarCollapsed}
            />
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
              <ModernHeader 
                userProfile={userProfile}
                onLogout={handleLogout}
                onSettings={() => navigate('/settings')}
                isAdmin={isAdmin}
              />
              <main className="flex-1 p-6">
                {renderStrategiesContent()}
              </main>
            </div>
          </div>
        )}

        {/* Mobile Layout */}
        {(isMobile || isTablet) && (
          <>
            <MobileHeader 
              userProfile={userProfile}
              onMenuClick={() => setIsMobileDrawerOpen(true)}
              onLogout={handleLogout}
              isAdmin={isAdmin}
            />
            <MobileDrawer 
              isOpen={isMobileDrawerOpen}
              onClose={() => setIsMobileDrawerOpen(false)}
              isAdmin={isAdmin}
            />
            <div className="pt-14 pb-20 px-4">
              {renderStrategiesContent()}
            </div>
            <BottomNavigation 
              isAdmin={isAdmin} 
            />
          </>
        )}
      </div>
    </ModernTooltipProvider>
  );
};

export default Strategies;