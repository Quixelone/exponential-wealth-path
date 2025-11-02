
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SaveConfigDialogProps {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  configName: string;
  setConfigName: (name: string) => void;
  onSave: () => void;
  loading: boolean;
  isUpdate: boolean;
  hasUnsavedChanges: boolean;
  currentConfigName: string;
  currentConfigId: string | null;
}

const SaveConfigDialog: React.FC<SaveConfigDialogProps> = ({
  open,
  onOpenChange,
  configName,
  setConfigName,
  onSave,
  loading,
  isUpdate,
  hasUnsavedChanges,
  currentConfigName,
  currentConfigId
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>
      <Button size="sm" className="flex items-center gap-2">
        {isUpdate
          ? (hasUnsavedChanges ? "Salva modifiche" : "Aggiorna")
          : "Salva"}
      </Button>
    </DialogTrigger>
    <DialogContent className="mobile-dialog max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-base sm:text-lg">
          {isUpdate
            ? (hasUnsavedChanges ? "Salva modifiche alla Configurazione" : "Aggiorna Configurazione")
            : "Salva Configurazione"}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Nome della configurazione</label>
          <Input
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            placeholder={isUpdate ? currentConfigName : "Es: Strategia conservativa"}
            className="mt-1 touch-target text-base"
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto touch-target">
            Annulla
          </Button>
          <Button
            onClick={onSave}
            disabled={!configName.trim() || loading}
            className="w-full sm:w-auto touch-target"
          >
            {loading
              ? 'Salvando...'
              : isUpdate
                ? (hasUnsavedChanges ? 'Salva modifiche' : 'Aggiorna')
                : 'Salva'}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default SaveConfigDialog;
