
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UnsavedChangesAlert from './UnsavedChangesAlert';

interface NewConfigurationDialogProps {
  onCreateNew: (name: string, copyFromCurrent: boolean, currency: 'EUR' | 'USD' | 'USDT') => void;
  hasCurrentConfig: boolean;
  currentConfigName: string;
  hasUnsavedChanges?: boolean;
}

const NewConfigurationDialog: React.FC<NewConfigurationDialogProps> = ({
  onCreateNew,
  hasCurrentConfig,
  currentConfigName,
  hasUnsavedChanges = false
}) => {
  const [open, setOpen] = useState(false);
  const [configName, setConfigName] = useState('');
  const [createMode, setCreateMode] = useState<'empty' | 'copy'>('empty');
  const [currency, setCurrency] = useState<'EUR' | 'USD' | 'USDT'>('EUR');
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
  const [pendingCreate, setPendingCreate] = useState<{ name: string; copyMode: boolean; currency: 'EUR' | 'USD' | 'USDT' } | null>(null);

  const handleCreateAttempt = () => {
    if (configName.trim()) {
      if (hasUnsavedChanges) {
        setPendingCreate({ name: configName.trim(), copyMode: createMode === 'copy', currency });
        setShowUnsavedAlert(true);
      } else {
        executeCreate(configName.trim(), createMode === 'copy', currency);
      }
    }
  };

  const executeCreate = (name: string, copyMode: boolean, curr: 'EUR' | 'USD' | 'USDT') => {
    onCreateNew(name, copyMode, curr);
    setConfigName('');
    setCreateMode('empty');
    setCurrency('EUR');
    setOpen(false);
  };

  const confirmCreate = () => {
    if (pendingCreate) {
      executeCreate(pendingCreate.name, pendingCreate.copyMode, pendingCreate.currency);
      setPendingCreate(null);
      setShowUnsavedAlert(false);
    }
  };

  const cancelCreate = () => {
    setPendingCreate(null);
    setShowUnsavedAlert(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuova Configurazione
        </Button>
      </DialogTrigger>
      <DialogContent className="mobile-dialog sm:max-w-md max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Plus className="h-5 w-5 text-primary" />
            Crea Nuova Configurazione
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="config-name">Nome della configurazione</Label>
            <Input
              id="config-name"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="Es: Strategia aggressiva"
              className="w-full touch-target text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency-select">Valuta</Label>
            <Select
              value={currency}
              onValueChange={(val) => setCurrency(val as 'EUR' | 'USD' | 'USDT')}
              disabled={createMode === 'copy'}
            >
              <SelectTrigger id="currency-select">
                <SelectValue placeholder="Seleziona valuta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">Euro (€)</SelectItem>
                <SelectItem value="USD">US Dollar ($)</SelectItem>
                <SelectItem value="USDT">Tether (USDT)</SelectItem>
              </SelectContent>
            </Select>
            {createMode === 'copy' && (
              <p className="text-xs text-muted-foreground">
                La valuta verrà mantenuta uguale alla strategia copiata.
              </p>
            )}
          </div>

          {hasCurrentConfig && (
            <div className="space-y-3">
              <Label>Punto di partenza</Label>
              <RadioGroup value={createMode} onValueChange={(value) => setCreateMode(value as 'empty' | 'copy')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="empty" id="empty" />
                  <Label htmlFor="empty">Inizia da zero (valori predefiniti)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="copy" id="copy" />
                  <Label htmlFor="copy">
                    Copia da "{currentConfigName}"
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Le modifiche non salvate della configurazione corrente andranno perse.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto touch-target">
              Annulla
            </Button>
            <Button
              onClick={handleCreateAttempt}
              disabled={!configName.trim()}
              className="w-full sm:w-auto touch-target"
            >
              Crea Configurazione
            </Button>
          </div>
        </div>

        <UnsavedChangesAlert
          open={showUnsavedAlert}
          onContinue={confirmCreate}
          onCancel={cancelCreate}
        />
      </DialogContent>
    </Dialog>
  );
};

export default NewConfigurationDialog;
