
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
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Modifica Nome Configurazione</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Nome della configurazione</label>
          <Input
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            placeholder="Nome configurazione"
            className="mt-1"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button 
            onClick={onUpdate}
            disabled={!configName.trim() || loading}
          >
            {loading ? 'Aggiornando...' : 'Aggiorna'}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default EditConfigDialog;
