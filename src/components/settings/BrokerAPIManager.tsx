import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { BrokerCard } from './BrokerCard';
import { BrokerConnectionDialog } from './BrokerConnectionDialog';
import { useBrokerConnections } from '@/hooks/useBrokerConnections';
import { BROKER_INFO, type BrokerName } from '@/types/broker';
import { EnhancedEmptyState } from '@/components/ui/enhanced-empty-state';

export const BrokerAPIManager: React.FC = () => {
  const {
    connections,
    isLoading,
    saveConnection,
    isSaving,
    syncHistory,
    isSyncing,
    deleteConnection,
    isDeleting,
  } = useBrokerConnections();

  const [selectedBroker, setSelectedBroker] = useState<BrokerName | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleConnect = (broker: BrokerName) => {
    setSelectedBroker(broker);
    setDialogOpen(true);
  };

  const handleSettings = (broker: BrokerName) => {
    setSelectedBroker(broker);
    setDialogOpen(true);
  };

  const handleDisconnect = async (connectionId: string) => {
    if (confirm('Sei sicuro di voler scollegare questo broker?')) {
      deleteConnection(connectionId);
    }
  };

  const handleSync = (connectionId: string) => {
    syncHistory(connectionId);
  };

  const getConnectionForBroker = (brokerName: BrokerName) => {
    return connections.find((c) => c.broker_name === brokerName);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 h-[180px] animate-pulse">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-muted rounded w-32" />
                  <div className="h-4 bg-muted rounded w-48" />
                </div>
              </div>
              <div className="h-8 bg-muted rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const brokers = Object.values(BROKER_INFO);
  const hasAnyConnection = connections.length > 0;

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Sicurezza garantita:</strong> Le tue API keys sono criptate e utilizzate solo per
          leggere i dati. Non effettuiamo mai operazioni di trading.
        </AlertDescription>
      </Alert>

      {!hasAnyConnection && (
        <EnhancedEmptyState
          icon={Shield}
          title="Nessun broker collegato"
          description="Collega le tue API per sincronizzare automaticamente le opzioni e dual investment"
          action={{
            label: 'Scopri come collegare',
            onClick: () => {
              // Scroll to first broker card
              document.querySelector('.broker-grid')?.scrollIntoView({ behavior: 'smooth' });
            },
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 broker-grid">
        {brokers.map((broker) => {
          const connection = getConnectionForBroker(broker.name);
          return (
            <BrokerCard
              key={broker.name}
              broker={broker}
              connection={connection}
              onConnect={() => handleConnect(broker.name)}
              onSync={() => connection && handleSync(connection.id)}
              onSettings={() => handleSettings(broker.name)}
              onDisconnect={() => connection && handleDisconnect(connection.id)}
              isSyncing={isSyncing}
            />
          );
        })}
      </div>

      {selectedBroker && (
        <BrokerConnectionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          broker={selectedBroker}
          existingConnection={getConnectionForBroker(selectedBroker)}
          onSave={(connection) => {
            saveConnection(connection);
            setDialogOpen(false);
          }}
          isSaving={isSaving}
        />
      )}

      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Domande Frequenti (FAQ)</h3>
        <div className="space-y-4 text-sm">
          <div>
            <strong className="text-foreground">Q: I miei fondi sono al sicuro?</strong>
            <p className="text-muted-foreground mt-1">
              A: Sì! Usiamo solo permessi READ-ONLY. Non possiamo mai fare trading o spostare fondi.
            </p>
          </div>
          <div>
            <strong className="text-foreground">
              Q: Quanto spesso vengono sincronizzati i dati?
            </strong>
            <p className="text-muted-foreground mt-1">
              A: Puoi scegliere: tempo reale, ogni ora, o giornaliero. Puoi anche sincronizzare
              manualmente.
            </p>
          </div>
          <div>
            <strong className="text-foreground">
              Q: Cosa succede se cambio le mie API keys?
            </strong>
            <p className="text-muted-foreground mt-1">
              A: Devi aggiornarle anche qui. Riceverai una notifica se la connessione fallisce.
            </p>
          </div>
          <div>
            <strong className="text-foreground">
              Q: Posso collegare più broker contemporaneamente?
            </strong>
            <p className="text-muted-foreground mt-1">
              A: Sì! Puoi collegare tutti e 6 i broker se vuoi.
            </p>
          </div>
          <div>
            <strong className="text-foreground">Q: I dati storici vengono importati?</strong>
            <p className="text-muted-foreground mt-1">
              A: Alla prima sincronizzazione importiamo gli ultimi 90 giorni di history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
