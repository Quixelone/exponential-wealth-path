
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EditConfigDialogProps {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  configName: string;
  setConfigName: (name: string) => void;
  onUpdate: () => void;
  loading: boolean;
}

const EditConfigDialog: React.FC<EditConfigDialogProps> = ({
  open,
  onOpenChange,
  configName,
  setConfigName,
  onUpdate,
  loading
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="mobile-dialog">
      <DialogHeader>
        <DialogTitle className="text-base sm:text-lg">Modifica Nome Configurazione</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Nome della configurazione</label>
          <Input
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            placeholder="Nome configurazione"
            className="mt-1 touch-target text-base"
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto touch-target">
            Annulla
          </Button>
          <Button 
            onClick={onUpdate}
            disabled={!configName.trim() || loading}
            className="w-full sm:w-auto touch-target"
          >
            {loading ? 'Aggiornando...' : 'Aggiorna'}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default EditConfigDialog;
