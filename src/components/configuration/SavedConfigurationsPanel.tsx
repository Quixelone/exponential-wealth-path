
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, FileText, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import SavedConfigCard from './SavedConfigCard';
import SaveConfigDialog from './SaveConfigDialog';
import EditConfigDialog from './EditConfigDialog';
import UnsavedChangesAlert from './UnsavedChangesAlert';
import { SavedConfiguration } from '@/types/database';

interface SavedConfigurationsPanelProps {
  savedConfigs: SavedConfiguration[];
  onLoadConfiguration: (config: SavedConfiguration) => void;
  onDeleteConfiguration: (configId: string) => void;
  onSaveConfiguration: (name: string) => void;
  onUpdateConfiguration: (configId: string, name: string) => void;
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
      // Sempre richiedi conferma per il cambio configurazione
      const confirmLoad = window.confirm(
        `Vuoi caricare la configurazione "${config.name}"?\n\nQuesto sostituirà la configurazione attuale.`
      );
      if (confirmLoad) {
        onLoadConfiguration(config);
      }
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
            {hasUnsavedChanges && (
              <Badge variant="destructive" className="animate-pulse">Modificato</Badge>
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
      <CardContent>
        {currentConfigId && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2 items-center">
            <Save className="h-4 w-4" />
            <span className="text-sm font-medium">
              Configurazione attuale: "{currentConfigName}"
            </span>
            {hasUnsavedChanges && (
              <Badge variant="destructive" className="ml-2">Modificato</Badge>
            )}
          </div>
        )}

        <div className="space-y-3">
          {savedConfigs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nessuna configurazione salvata</p>
              <p className="text-sm">Salva la tua prima configurazione per iniziare</p>
            </div>
          ) : (
            savedConfigs.map((savedConfig) => (
              <SavedConfigCard
                key={savedConfig.id}
                savedConfig={savedConfig}
                onLoad={() => handleLoadConfigWithCheck(savedConfig)}
                onEdit={() => handleEditConfiguration(savedConfig)}
                onDelete={() => onDeleteConfiguration(savedConfig.id)}
                isCurrent={currentConfigId === savedConfig.id}
                loading={loading}
              />
            ))
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
