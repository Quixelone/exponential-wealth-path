import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Download, Calendar, Database, HardDrive, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Backup {
  id: string;
  backup_date: string;
  config_id: string;
  backup_data: {
    compressed?: boolean;
    version?: string;
    data?: string;
    original_size?: number;
    compressed_size?: number;
    config: any;
    metadata: {
      total_records: number;
      backup_timestamp: string;
    };
  };
}

interface BackupStats {
  total_backups: number;
  oldest_backup: string | null;
  newest_backup: string | null;
  total_size_bytes: number;
  configs_backed_up: number;
  available_dates: string[];
}

export function BackupManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  useEffect(() => {
    if (user) {
      loadBackups();
      loadStats();
    }
  }, [user]);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('strategy_backups')
        .select('*')
        .eq('user_id', user?.id)
        .order('backup_date', { ascending: false });

      if (error) throw error;

      setBackups((data || []) as unknown as Backup[]);
    } catch (error: any) {
      console.error('Error loading backups:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i backup',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_backup_stats', {
        user_uuid: user?.id
      });

      if (error) throw error;
      setStats(data as unknown as BackupStats);
    } catch (error: any) {
      console.error('Error loading backup stats:', error);
    }
  };

  const handleRestore = async () => {
    if (!selectedBackup) return;

    try {
      setRestoring(true);

      const { data, error } = await supabase.functions.invoke('restore-strategy-backup', {
        body: {
          backup_id: selectedBackup.id,
          config_id: selectedBackup.config_id,
          create_snapshot: true
        }
      });

      if (error) throw error;

      toast({
        title: 'Backup ripristinato',
        description: `Strategia ripristinata dal backup del ${format(new Date(selectedBackup.backup_date), 'dd/MM/yyyy', { locale: it })}`,
      });

      setShowRestoreDialog(false);
      setSelectedBackup(null);

      // Reload page to show restored data
      setTimeout(() => window.location.reload(), 1000);

    } catch (error: any) {
      console.error('Error restoring backup:', error);
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile ripristinare il backup',
        variant: 'destructive',
      });
    } finally {
      setRestoring(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Backup Totali</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_backups}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Strategie</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.configs_backed_up}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dimensione</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBytes(stats.total_size_bytes)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ultimo Backup</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {stats.newest_backup 
                  ? format(new Date(stats.newest_backup), 'dd/MM/yyyy', { locale: it })
                  : 'N/D'
                }
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          I backup vengono creati automaticamente ogni giorno alle 3:00 AM e mantenuti per 7 giorni.
          Puoi ripristinare qualsiasi backup recente in qualsiasi momento.
        </AlertDescription>
      </Alert>

      {/* Backups List */}
      <Card>
        <CardHeader>
          <CardTitle>Backup Disponibili</CardTitle>
          <CardDescription>
            Ultimi backup delle tue strategie (7 giorni)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nessun backup disponibile
            </div>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(backup.backup_date), 'EEEE dd MMMM yyyy', { locale: it })}
                      </span>
                      {backup.backup_date === stats?.newest_backup && (
                        <Badge variant="secondary">Più recente</Badge>
                      )}
                      {backup.backup_data.compressed && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                          Compresso
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {backup.backup_data.config?.name || 'Strategia'} • {backup.backup_data.metadata?.total_records || 0} record
                      {backup.backup_data.compressed && backup.backup_data.original_size && backup.backup_data.compressed_size && (
                        <>
                          {' • '}
                          {formatBytes(backup.backup_data.original_size)} → {formatBytes(backup.backup_data.compressed_size)}
                          {' '}
                          ({((1 - backup.backup_data.compressed_size / backup.backup_data.original_size) * 100).toFixed(0)}%)
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedBackup(backup);
                      setShowRestoreDialog(true);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Ripristina
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ripristinare questo backup?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione sostituirà la strategia corrente con il backup del{' '}
              {selectedBackup && format(new Date(selectedBackup.backup_date), 'dd/MM/yyyy', { locale: it })}.
              <br /><br />
              <strong>Verrà creato automaticamente uno snapshot della strategia attuale prima del ripristino.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restoring}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestore}
              disabled={restoring}
            >
              {restoring ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ripristino...
                </>
              ) : (
                'Ripristina Backup'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
