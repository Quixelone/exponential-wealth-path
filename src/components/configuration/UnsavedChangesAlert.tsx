
import React from 'react';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction } from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface UnsavedChangesAlertProps {
  open: boolean;
  onContinue: () => void;
  onCancel: () => void;
}

const UnsavedChangesAlert: React.FC<UnsavedChangesAlertProps> = ({
  open,
  onContinue,
  onCancel,
}) => (
  <AlertDialog open={open}>
    <AlertDialogContent className="clean-card">
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Modifiche non salvate
        </AlertDialogTitle>
        <AlertDialogDescription>
          Hai modifiche non salvate nella configurazione corrente. Se cambi configurazione, perderai queste modifiche. Vuoi continuare?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel} className="clean-btn-secondary">
          Annulla
        </AlertDialogCancel>
        <AlertDialogAction className="clean-btn-primary" onClick={onContinue}>
          Continua
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default UnsavedChangesAlert;
