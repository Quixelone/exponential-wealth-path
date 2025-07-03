
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, AlertTriangle } from 'lucide-react';

interface NewConfigurationDialogProps {
  onCreateNew: (name: string, copyFromCurrent: boolean) => void;
  hasCurrentConfig: boolean;
  currentConfigName: string;
}

const NewConfigurationDialog: React.FC<NewConfigurationDialogProps> = ({
  onCreateNew,
  hasCurrentConfig,
  currentConfigName
}) => {
  const [open, setOpen] = useState(false);
  const [configName, setConfigName] = useState('');
  const [createMode, setCreateMode] = useState<'empty' | 'copy'>('empty');

  const handleCreate = () => {
    if (configName.trim()) {
      onCreateNew(configName.trim(), createMode === 'copy');
      setConfigName('');
      setCreateMode('empty');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuova Configurazione
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
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
              className="w-full"
            />
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

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!configName.trim()}
            >
              Crea Configurazione
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewConfigurationDialog;
