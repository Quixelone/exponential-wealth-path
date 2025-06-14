
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface NewConfigurationButtonProps {
  onCreateNew: () => void;
  hasCustomData: boolean;
}

const NewConfigurationButton: React.FC<NewConfigurationButtonProps> = ({
  onCreateNew,
  hasCustomData
}) => {
  const handleCreateNew = () => {
    onCreateNew();
  };

  if (hasCustomData) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuova Configurazione
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Attenzione
            </AlertDialogTitle>
            <AlertDialogDescription>
              Stai per creare una nuova configurazione. Tutti i rendimenti giornalieri personalizzati e le modifiche PAC verranno azzerati.
              Vuoi continuare?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateNew}>
              Crea Nuova Configurazione
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button onClick={handleCreateNew} className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      Nuova Configurazione
    </Button>
  );
};

export default NewConfigurationButton;
