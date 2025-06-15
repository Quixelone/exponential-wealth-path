
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Save, FileText, Trash2, Calendar, TrendingUp, Edit, Crown, AlertTriangle } from 'lucide-react';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Alert per modifiche non salvate quando si tenta il cambio config
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
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {currentConfigId ? (hasUnsavedChanges ? "Salva modifiche" : "Aggiorna") : "Salva"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {currentConfigId ? (hasUnsavedChanges ? "Salva modifiche alla Configurazione" : "Aggiorna Configurazione") : "Salva Configurazione"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome della configurazione</label>
                    <Input
                      value={configName}
                      onChange={(e) => setConfigName(e.target.value)}
                      placeholder={currentConfigId ? currentConfigName : "Es: Strategia conservativa"}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                      Annulla
                    </Button>
                    <Button 
                      onClick={handleSaveConfiguration}
                      disabled={!configName.trim() || loading}
                    >
                      {loading
                        ? 'Salvando...'
                        : (currentConfigId ? (hasUnsavedChanges ? 'Salva modifiche' : 'Aggiorna') : 'Salva')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
              <Card key={savedConfig.id} className="border border-gray-200 hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{savedConfig.name}</h4>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(savedConfig.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {savedConfig.config.dailyReturnRate.toFixed(3)}%
                        </div>
                      </div>
                    </div>
                    {currentConfigId === savedConfig.id && (
                      <Badge variant="secondary" className="text-xs">
                        Attuale
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-muted-foreground">Capitale:</span>
                      <div className="font-medium">{formatCurrency(savedConfig.config.initialCapital)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Giorni:</span>
                      <div className="font-medium">{savedConfig.config.timeHorizon}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">PAC:</span>
                      <div className="font-medium">{formatCurrency(savedConfig.config.pacConfig.amount)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Frequenza:</span>
                      <div className="font-medium capitalize">{savedConfig.config.pacConfig.frequency}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      {Object.keys(savedConfig.dailyReturns).length} rendimenti personalizzati
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLoadConfigWithCheck(savedConfig)}
                        disabled={loading}
                        className="h-7 px-2 text-xs"
                      >
                        Carica
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditConfiguration(savedConfig)}
                        disabled={loading}
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                            disabled={loading}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Elimina Configurazione</AlertDialogTitle>
                            <AlertDialogDescription>
                              Sei sicuro di voler eliminare la configurazione "{savedConfig.name}"? 
                              Questa azione non può essere annullata.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteConfiguration(savedConfig.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Elimina
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Prompt modifiche non salvate */}
        <AlertDialog open={showUnsavedAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Modifiche non salvate
              </AlertDialogTitle>
              <AlertDialogDescription>
                Hai modifiche non salvate nella configurazione corrente. Se cambi configurazione, perderai queste modifiche. Vuoi continuare?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelLoadConfig}>Annulla</AlertDialogCancel>
              <AlertDialogAction className="bg-green-600 hover:bg-green-700" onClick={continueLoadConfig}>
                Continua
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifica Nome Configurazione</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome della configurazione</label>
                <Input
                  value={editingConfigName}
                  onChange={(e) => setEditingConfigName(e.target.value)}
                  placeholder="Nome configurazione"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Annulla
                </Button>
                <Button 
                  onClick={handleUpdateConfiguration}
                  disabled={!editingConfigName.trim() || loading}
                >
                  {loading ? 'Aggiornando...' : 'Aggiorna'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SavedConfigurationsPanel;
