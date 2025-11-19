import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Link2, RefreshCw, Settings, X, CheckCircle2, AlertCircle, Circle, MoreVertical } from 'lucide-react';
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

  const IconComponent = broker.icon;
  
  const statusConfig = {
    connected: {
      color: 'bg-success/10 text-success border-success/20',
      icon: CheckCircle2,
      label: 'Connesso'
    },
    error: {
      color: 'bg-destructive/10 text-destructive border-destructive/20',
      icon: AlertCircle,
      label: 'Errore'
    },
    never_synced: {
      color: 'bg-muted text-muted-foreground border-border',
      icon: Circle,
      label: 'Non connesso'
    }
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  return (
    <Card className="p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 bg-card/50 backdrop-blur-sm border border-border/50 relative group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-background shadow-sm border border-border/50 flex items-center justify-center transition-transform group-hover:scale-105">
            <IconComponent size={32} />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{broker.displayName}</h3>
            <p className="text-sm text-muted-foreground">{broker.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`${currentStatus.color} flex items-center gap-1.5`}>
            <StatusIcon className="w-3 h-3" />
            {currentStatus.label}
          </Badge>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
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
              className="flex-1 border-border/50 hover:border-primary/50 hover:bg-primary/5"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              Sincronizza
            </Button>
            <Button size="sm" variant="outline" onClick={onSettings} className="border-border/50 hover:border-primary/50 hover:bg-primary/5">
              <Settings className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={onDisconnect} className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive">
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button 
            size="sm" 
            onClick={onConnect} 
            className="w-full bg-transparent border-2 border-success text-success hover:bg-success hover:text-success-foreground transition-all duration-200 font-medium"
            variant="outline"
          >
            <Link2 className="w-4 h-4 mr-2" />
            Connect
          </Button>
        )}
      </div>
    </Card>
  );
};
