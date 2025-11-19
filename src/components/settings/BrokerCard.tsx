import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Link, RefreshCw, Settings, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import type { BrokerConnection } from '@/types/broker';
import { BROKER_INFO } from '@/types/broker';

interface BrokerCardProps {
  broker: typeof BROKER_INFO[keyof typeof BROKER_INFO];
  connection?: BrokerConnection;
  onConnect: () => void;
  onSync: () => void;
  onSettings: () => void;
  onDisconnect: () => void;
  isSyncing?: boolean;
}

export const BrokerCard: React.FC<BrokerCardProps> = ({
  broker,
  connection,
  onConnect,
  onSync,
  onSettings,
  onDisconnect,
  isSyncing = false,
}) => {
  const isConnected = !!connection && connection.is_active;
  const status = connection?.connection_status || 'never_synced';

  const statusColors = {
    connected: 'bg-green-500/10 text-green-600 border-green-500/20',
    error: 'bg-red-500/10 text-red-600 border-red-500/20',
    never_synced: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  };

  const statusLabels = {
    connected: 'Connesso',
    error: 'Errore',
    never_synced: 'Non connesso',
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 bg-card border border-border/50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl">
            {broker.icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{broker.displayName}</h3>
            <p className="text-sm text-muted-foreground">{broker.description}</p>
          </div>
        </div>
        
        <Badge variant="outline" className={statusColors[status]}>
          {statusLabels[status]}
        </Badge>
      </div>

      {connection?.last_sync_date && (
        <div className="mb-4 text-xs text-muted-foreground flex items-center gap-2">
          <Clock className="w-3 h-3" />
          Ultima sincronizzazione:{' '}
          {formatDistanceToNow(new Date(connection.last_sync_date), {
            addSuffix: true,
            locale: it,
          })}
        </div>
      )}

      {connection?.last_error_message && (
        <div className="mb-4 text-xs text-destructive">
          {connection.last_error_message}
        </div>
      )}

      <div className="flex gap-2">
        {isConnected ? (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={onSync}
              disabled={isSyncing}
              className="flex-1"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              Sincronizza
            </Button>
            <Button size="sm" variant="outline" onClick={onSettings}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="destructive" onClick={onDisconnect}>
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={onConnect} className="w-full">
            <Link className="w-4 h-4 mr-2" />
            Collega
          </Button>
        )}
      </div>
    </Card>
  );
};
