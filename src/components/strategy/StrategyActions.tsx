import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Download, Copy, Plus } from 'lucide-react';
import { useStrategiesManager } from '@/hooks/useStrategiesManager';

interface StrategyActionsProps {
  strategiesManager: ReturnType<typeof useStrategiesManager>;
}

interface StrategyActionsProps {
  strategiesManager: ReturnType<typeof useStrategiesManager>;
}

interface StrategyActionsProps {
  strategiesManager: ReturnType<typeof useStrategiesManager>;
}

const StrategyActions: React.FC<StrategyActionsProps> = ({ strategiesManager }) => {
  const {
    currentStrategy,
    hasUnsavedChanges,
    saveCurrentStrategy,
    updateCurrentStrategy,
    exportToCSV,
    loading,
  } = strategiesManager;

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [strategyName, setStrategyName] = useState(''); 
  const [isCopyMode, setIsCopyMode] = useState(false);
  const [isCopyMode, setIsCopyMode] = useState(false);

  const handleSaveClick = () => {
    if (currentStrategy) {
      // Se è una strategia esistente, aggiorna direttamente
      setStrategyName(currentStrategy.name || 'Strategia senza nome');
    } else {
      // Se è una nuova strategia, apri il dialog
      setStrategyName('Nuova strategia');
    }
    setSaveDialogOpen(true);
  };

  const handleSave = async () => {
    if (!strategyName.trim()) return;
    
    let success = false;
    if (currentStrategy && !isCopyMode) {
      success = await updateCurrentStrategy(currentStrategy.id, strategyName.trim());
    } else {
      const strategyId = await saveCurrentStrategy(strategyName.trim());
      success = !!strategyId;
    }

    if (success) {
    }
  };

  const handleCopyStrategy = () => {
    const copyName = `${currentStrategy?.name || 'Strategia'} (copia)`;
    setStrategyName(copyName); 
    setIsCopyMode(true);
    setIsCopyMode(true);
    setSaveDialogOpen(true); 
  };

  return (
    <div className="flex items-center gap-2">
      {/* Salva/Aggiorna */}
      <Button
        onClick={handleSaveClick}
        disabled={loading}
        variant={hasUnsavedChanges ? "default" : "outline"}
        className="h-8"
      >
        <Save className="h-4 w-4 mr-1" />
        {currentStrategy ? 'Aggiorna' : 'Salva'}
      </Button>

      {/* Copia Strategia */}
      {currentStrategy && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopyStrategy}
          disabled={loading}
          className="h-8"
        >
          <Copy className="h-4 w-4 mr-1" />
          Copia
        </Button>
      )}

      {/* Esporta CSV */}
      <Button
        size="sm"
        variant="outline"
        onClick={exportToCSV}
        disabled={loading}
        className="h-8"
      >
        <Download className="h-4 w-4 mr-1" />
        CSV
      </Button>

      {/* Dialog Salvataggio */}
      <Dialog 
        open={saveDialogOpen} 
        onOpenChange={(open) => {
          setSaveDialogOpen(open);
          if (!open) {
            setStrategyName('');
            setIsCopyMode(false);
          }
        }}
      >
      <Dialog 
        open={saveDialogOpen} 
        onOpenChange={(open) => {
          setSaveDialogOpen(open);
          if (!open) {
            setStrategyName('');
            setIsCopyMode(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentStrategy ? 'Aggiorna Strategia' : 'Salva Nuova Strategia'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="strategyName">Nome Strategia</Label>
              <Input
                id="strategyName"
                placeholder="Inserisci il nome della strategia"
                value={strategyName}
                onChange={(e) => setStrategyName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && strategyName.trim()) {
                    handleSave();
                  }
                }}
              />
            </div>

            {hasUnsavedChanges && (
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-sm text-warning-foreground">
                  <strong>Attenzione:</strong> Sono presenti modifiche non salvate che verranno incluse nel salvataggio.
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setSaveDialogOpen(false)}
                disabled={loading}
              >
                Annulla
              </Button>
              <Button
                onClick={handleSave}
                disabled={!strategyName.trim() || loading}
              >
                <Save className="h-4 w-4 mr-1" />
                {currentStrategy ? 'Aggiorna' : 'Salva'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StrategyActions;