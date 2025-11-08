import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { enhancedToast } from '@/components/ui/enhanced-toast';

/**
 * Demo component showcasing enhanced toast notifications
 * This component is for demonstration purposes only
 */
export function ToastDemo() {
  const showSuccessToast = () => {
    enhancedToast.success({
      title: 'Operazione completata',
      description: 'I tuoi dati sono stati salvati con successo.',
      duration: 4000,
    });
  };

  const showErrorToast = () => {
    enhancedToast.error({
      title: 'Errore durante il salvataggio',
      description: 'Si è verificato un errore. Riprova più tardi.',
      duration: 5000,
      action: {
        label: 'Riprova',
        onClick: () => console.log('Retry clicked'),
      },
    });
  };

  const showWarningToast = () => {
    enhancedToast.warning({
      title: 'Attenzione',
      description: 'Hai modifiche non salvate. Salvale prima di continuare.',
      action: {
        label: 'Salva',
        onClick: () => console.log('Save clicked'),
      },
    });
  };

  const showInfoToast = () => {
    enhancedToast.info({
      title: 'Informazione',
      description: 'Questa è una notifica informativa con dettagli utili.',
    });
  };

  const showLoadingToast = () => {
    const toastId = enhancedToast.loading({
      title: 'Caricamento in corso...',
      description: 'Attendere il completamento dell\'operazione.',
    });

    // Simulate async operation
    setTimeout(() => {
      enhancedToast.dismiss(toastId);
      enhancedToast.success({
        title: 'Completato!',
        description: 'L\'operazione è stata completata con successo.',
      });
    }, 3000);
  };

  const showPromiseToast = () => {
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve({ data: 'Success!' }) : reject(new Error('Failed!'));
      }, 2000);
    });

    enhancedToast.promise(promise, {
      loading: 'Elaborazione in corso...',
      success: 'Operazione completata!',
      error: 'Operazione fallita.',
      description: 'Attendere il completamento.',
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Enhanced Toast Notifications Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={showSuccessToast} variant="success">
            Success Toast
          </Button>
          <Button onClick={showErrorToast} variant="destructive">
            Error Toast
          </Button>
          <Button onClick={showWarningToast} variant="warning">
            Warning Toast
          </Button>
          <Button onClick={showInfoToast} variant="soft">
            Info Toast
          </Button>
          <Button onClick={showLoadingToast} variant="outline">
            Loading Toast
          </Button>
          <Button onClick={showPromiseToast} variant="gradient">
            Promise Toast
          </Button>
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold text-sm mb-2">Features:</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>✓ Contextual icons with animations</li>
            <li>✓ Success, error, warning, info states</li>
            <li>✓ Loading states with auto-dismiss</li>
            <li>✓ Promise-based toasts</li>
            <li>✓ Action buttons</li>
            <li>✓ Smooth slide-in animations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
