
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, FileText, Crown, RefreshCw, Plus, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ResponsiveConfigCards from './ResponsiveConfigCards';
import SaveConfigDialog from './SaveConfigDialog';
import EditConfigDialog from './EditConfigDialog';
import UnsavedChangesAlert from './UnsavedChangesAlert';
import { SavedConfiguration } from '@/types/database';
import { toast } from 'sonner';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { EnhancedEmptyState } from '@/components/ui/enhanced-empty-state';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { cn } from '@/lib/utils';

interface SavedConfigurationsPanelProps {
  savedConfigs: SavedConfiguration[];
  onLoadConfiguration: (config: SavedConfiguration) => void;
  onDeleteConfiguration: (configId: string) => void;
  onSaveConfiguration: (name: string) => void;
  onUpdateConfiguration: (configId: string, name: string) => void;
  onForceReload?: () => Promise<void>;
  currentConfigId: string | null;
  currentConfigName: string;
  loading: boolean;
  isAdmin?: boolean;
  hasUnsavedChanges?: boolean;
}

const SavedConfigurationsPanel: React.FC<SavedConfigurationsPanelProps> = ({
  savedConfigs,
  onLoadConfiguration,
  onDeleteConfiguration,
  onSaveConfiguration,
  onUpdateConfiguration,
  onForceReload,
  currentConfigId,
  currentConfigName,
  loading,
  isAdmin = false,
  hasUnsavedChanges = false,
}) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [configName, setConfigName] = useState('');
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [editingConfigName, setEditingConfigName] = useState('');
  const [pendingLoadConfig, setPendingLoadConfig] = useState<SavedConfiguration | null>(null);
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  // Aggiorna il valore predefinito del nome config
  React.useEffect(() => {
    if (currentConfigId && currentConfigName) {
      setConfigName(currentConfigName);
    } else {
      setConfigName('');
    }
  }, [currentConfigId, currentConfigName, saveDialogOpen]);

  const handleSaveConfiguration = () => {
    if (configName.trim()) {
      if (currentConfigId) {
        onUpdateConfiguration(currentConfigId, configName.trim());
      } else {
        onSaveConfiguration(configName.trim());
      }
      setConfigName('');
      setSaveDialogOpen(false);
    }
  };

  const handleEditConfiguration = (config: SavedConfiguration) => {
    setEditingConfigId(config.id);
    setEditingConfigName(config.name);
    setEditDialogOpen(true);
  };

  const handleUpdateConfiguration = () => {
    if (editingConfigId && editingConfigName.trim()) {
      onUpdateConfiguration(editingConfigId, editingConfigName.trim());
      setEditDialogOpen(false);
      setEditingConfigId(null);
      setEditingConfigName('');
    }
  };

  // Gestione alert per modifiche non salvate
  const handleLoadConfigWithCheck = (config: SavedConfiguration) => {
    if (hasUnsavedChanges) {
      setPendingLoadConfig(config);
      setShowUnsavedAlert(true);
    } else {
      onLoadConfiguration(config);
    }
  };

  const continueLoadConfig = () => {
    if (pendingLoadConfig) {
      onLoadConfiguration(pendingLoadConfig);
      setPendingLoadConfig(null);
      setShowUnsavedAlert(false);
    }
  };

  const cancelLoadConfig = () => {
    setPendingLoadConfig(null);
    setShowUnsavedAlert(false);
  };

  const handleForceReload = async () => {
    if (!onForceReload) return;
    
    setIsReloading(true);
    try {
      await onForceReload();
      toast.success('Strategie ricaricate dal database');
    } catch (error) {
      toast.error('Errore nel ricaricare le strategie');
    } finally {
      setIsReloading(false);
    }
  };

  // Pull to refresh for mobile
  const { pullState, handlers: pullHandlers } = usePullToRefresh({
    onRefresh: async () => {
      if (onForceReload) {
        await handleForceReload();
      }
    },
    threshold: 80,
    disabled: !onForceReload || loading || isReloading,
  });

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Configurazioni Salvate
            {isAdmin && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Admin
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {onForceReload && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleForceReload}
                disabled={isReloading || loading}
                className="touch-target"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isReloading ? 'animate-spin' : ''}`} />
                Ricarica
              </Button>
            )}
            {hasUnsavedChanges && (
              <Badge 
                variant="destructive" 
                className="animate-pulse"
                title="Hai modifiche non salvate. Salva prima di cambiare pagina o chiudere."
              >
                Modificato
              </Badge>
            )}
            <SaveConfigDialog
              open={saveDialogOpen}
              onOpenChange={setSaveDialogOpen}
              configName={configName}
              setConfigName={setConfigName}
              onSave={handleSaveConfiguration}
              loading={loading}
              isUpdate={!!currentConfigId}
              hasUnsavedChanges={hasUnsavedChanges}
              currentConfigName={currentConfigName}
              currentConfigId={currentConfigId}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent 
        className="relative overflow-hidden min-w-0"
        {...pullHandlers}
      >
        {/* Pull to refresh indicator */}
        {(pullState.isPulling || pullState.isRefreshing) && (
          <div
            className={cn(
              'absolute top-0 left-0 right-0 flex items-center justify-center bg-primary/5 transition-all duration-200 z-10',
              pullState.isRefreshing && 'py-3'
            )}
            style={{
              height: pullState.isPulling ? `${pullState.pullDistance}px` : '48px',
            }}
          >
            <div className="flex items-center gap-2 text-primary">
              {pullState.isRefreshing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Aggiornamento...</span>
                </>
              ) : (
                <span className="text-sm font-medium">
                  {pullState.pullDistance > 60 ? 'Rilascia per aggiornare' : 'Trascina per aggiornare'}
                </span>
              )}
            </div>
          </div>
        )}

        {currentConfigId && (
          <div className="mb-4 p-3 bg-success/10 border border-success/30 rounded-lg flex flex-wrap gap-2 items-center text-foreground min-w-0">
            <Save className="h-4 w-4 shrink-0 text-success" />
            <span className="text-sm font-medium break-words min-w-0 flex-1">
              Configurazione attuale: "{currentConfigName}"
            </span>
            {hasUnsavedChanges && (
              <Badge variant="destructive" className="shrink-0">Modificato</Badge>
            )}
          </div>
        )}

        <div className="space-y-3">
          {loading ? (
            <SkeletonLoader type="card" count={3} />
          ) : savedConfigs.length === 0 ? (
            <EnhancedEmptyState
              icon={FileText}
              title="Nessuna configurazione salvata"
              description="Salva la tua prima configurazione per iniziare a gestire le tue strategie di investimento in modo efficace."
              action={{
                label: "Salva Configurazione",
                onClick: () => setSaveDialogOpen(true),
              }}
            />
          ) : (
            <ResponsiveConfigCards
              savedConfigs={savedConfigs}
              onLoad={handleLoadConfigWithCheck}
              onEdit={handleEditConfiguration}
              onDelete={onDeleteConfiguration}
              currentConfigId={currentConfigId}
              loading={loading}
            />
          )}
        </div>

        <UnsavedChangesAlert
          open={showUnsavedAlert}
          onContinue={continueLoadConfig}
          onCancel={cancelLoadConfig}
        />

        <EditConfigDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          configName={editingConfigName}
          setConfigName={setEditingConfigName}
          onUpdate={handleUpdateConfiguration}
          loading={loading}
        />
      </CardContent>
    </Card>
  );
};

export default SavedConfigurationsPanel;
