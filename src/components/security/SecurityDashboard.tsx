import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Users, Eye, Activity, Download } from 'lucide-react';
import { useSecurity } from '@/hooks/useSecurity';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

const SecurityDashboard = () => {
  const { auditLogs, metrics, loading, fetchAuditLogs } = useSecurity();

  const exportAuditLogs = () => {
    const csvContent = [
      ['Data/Ora', 'Utente', 'Azione', 'Tabella', 'Campi Acceduti', 'Admin'].join(','),
      ...auditLogs.map(log => [
        new Date(log.created_at).toLocaleString('it-IT'),
        log.user_profiles?.email || log.user_id,
        log.action,
        log.table_name,
        log.accessed_fields?.join(';') || '',
        log.admin_user_id ? 'Sì' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `security_audit_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'SELECT': return 'default';
      case 'UPDATE': return 'secondary';
      case 'INSERT': return 'outline';
      case 'DELETE': return 'destructive';
      default: return 'default';
    }
  };

  const getSeverityLevel = (log: any) => {
    if (log.action === 'DELETE') return 'high';
    if (log.admin_user_id && log.accessed_fields?.some((field: string) => 
      ['email', 'phone', 'google_id'].includes(field)
    )) return 'medium';
    return 'low';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Sicurezza</h2>
          <p className="text-muted-foreground">
            Monitoraggio accessi e audit dei dati sensibili
          </p>
        </div>
        <Button onClick={exportAuditLogs} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Esporta Log
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accessi Totali (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAccess}</div>
            <p className="text-xs text-muted-foreground">
              Tutte le operazioni monitorate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accessi Admin</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.adminAccess}</div>
            <p className="text-xs text-muted-foreground">
              Operazioni da parte di amministratori
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dati Sensibili</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.sensitiveFieldAccess}</div>
            <p className="text-xs text-muted-foreground">
              Accessi a campi sensibili
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alert Recenti</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.recentAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Attività sospette rilevate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Log Audit Sicurezza</CardTitle>
          <CardDescription>
            Cronologia dettagliata degli accessi ai dati sensibili
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Caricamento log di sicurezza...
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nessun log di sicurezza disponibile
            </div>
          ) : (
            <div className="space-y-4">
              {auditLogs.slice(0, 20).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action}
                      </Badge>
                      {getSeverityLevel(log) === 'high' && (
                        <Badge variant="destructive">Alta Severità</Badge>
                      )}
                      {getSeverityLevel(log) === 'medium' && (
                        <Badge variant="secondary">Media Severità</Badge>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {log.user_profiles?.email || `User ${log.user_id.slice(0, 8)}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {log.table_name}
                        {log.accessed_fields?.length > 0 && (
                          <span> • Campi: {log.accessed_fields.join(', ')}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatDistanceToNow(new Date(log.created_at), { 
                        addSuffix: true, 
                        locale: it 
                      })}
                    </p>
                    {log.admin_user_id && (
                      <Badge variant="outline" className="text-xs">
                        Accesso Admin
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {auditLogs.length > 20 && (
                <div className="text-center pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => fetchAuditLogs(auditLogs.length + 50)}
                  >
                    Carica Altri Log
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;