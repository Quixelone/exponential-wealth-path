import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RestoreResult {
  success: boolean;
  restored: {
    daily_returns: number;
    daily_pac_overrides: number;
    actual_trades: number;
    pac_payments: number;
  };
  backup_date: string;
  config_name: string;
}

export function AdminBackupRestore() {
  const { toast } = useToast();
  const [backupId, setBackupId] = useState('');
  const [configId, setConfigId] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(null);

  const handleRestore = async () => {
    if (!backupId) {
      toast({
        title: 'Campo mancante',
        description: 'Inserisci almeno il Backup ID',
        variant: 'destructive',
      });
      return;
    }

    try {
      setRestoring(true);

      const { data, error } = await supabase.functions.invoke('admin-restore-backup', {
        body: {
          backup_id: backupId.trim(),
          config_id: configId.trim(),
          target_user_id: targetUserId.trim() || undefined,
          create_snapshot: true,
        }
      });

      if (error) throw error;

      setRestoreResult(data as RestoreResult);
      
      toast({
        title: 'Backup ripristinato',
        description: `Strategia "${data.config_name}" ripristinata con successo`,
      });

      setShowConfirmDialog(false);
      
    } catch (error: any) {
      console.error('Restore error:', error);
      toast({
        title: 'Errore ripristino',
        description: error.message || 'Impossibile ripristinare il backup',
        variant: 'destructive',
      });
    } finally {
      setRestoring(false);
    }
  };

  const handleConfirm = () => {
    setShowConfirmDialog(true);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Strumento admin per ripristinare backup di strategie utente. Verrà creato automaticamente uno snapshot prima del ripristino.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Ripristino Backup Admin</CardTitle>
          <CardDescription>
            Ripristina un backup per qualsiasi utente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="backupId">Backup ID *</Label>
            <Input
              id="backupId"
              placeholder="es: 46574576-1d65-4ab7-b19d-eacc87869279"
              value={backupId}
              onChange={(e) => setBackupId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="configId">Config ID (opzionale se strategia eliminata)</Label>
            <Input
              id="configId"
              placeholder="es: d4be9c9d-e171-4039-89ce-8c0b68b103e8"
              value={configId}
              onChange={(e) => setConfigId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Lascia vuoto per ricreare automaticamente la strategia dal backup
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetUserId">Target User ID (opzionale)</Label>
            <Input
              id="targetUserId"
              placeholder="es: af229873-4697-478a-8368-8ddb126e2c6a"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Opzionale: per verificare che la config appartenga a questo utente
            </p>
          </div>

          <Button
            onClick={handleConfirm}
            disabled={!backupId || restoring}
            className="w-full"
          >
            {restoring ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Ripristino in corso...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Ripristina Backup
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {restoreResult && (
        <Card className="border-green-500/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <CardTitle>Ripristino Completato</CardTitle>
            </div>
            <CardDescription>
              Strategia "{restoreResult.config_name}" ripristinata dal backup del {restoreResult.backup_date}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Returns:</span>
                <span className="font-medium">{restoreResult.restored.daily_returns}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PAC Overrides:</span>
                <span className="font-medium">{restoreResult.restored.daily_pac_overrides}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Actual Trades:</span>
                <span className="font-medium">{restoreResult.restored.actual_trades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PAC Payments:</span>
                <span className="font-medium">{restoreResult.restored.pac_payments}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confermare ripristino backup?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Stai per ripristinare il backup con i seguenti dati:</p>
              <div className="bg-muted p-3 rounded-lg space-y-1 text-xs font-mono">
                <div><strong>Backup ID:</strong> {backupId}</div>
                <div><strong>Config ID:</strong> {configId}</div>
                {targetUserId && <div><strong>User ID:</strong> {targetUserId}</div>}
              </div>
              <p className="text-sm text-amber-600 dark:text-amber-500 font-medium mt-2">
                ⚠️ Questa azione sostituirà i dati attuali. Verrà creato uno snapshot automatico prima del ripristino.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restoring}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestore}
              disabled={restoring}
              className="bg-primary"
            >
              {restoring ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ripristino...
                </>
              ) : (
                'Conferma Ripristino'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
