import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, ExternalLink, Shield, FileText, Link2 } from 'lucide-react';
import { BROKER_INFO, type BrokerName, type BrokerConnection, type SyncFrequency } from '@/types/broker';

interface BrokerConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  broker: BrokerName;
  existingConnection?: BrokerConnection;
  onSave: (connection: Partial<BrokerConnection>) => void;
  isSaving: boolean;
}

const BROKER_INSTRUCTIONS: Record<BrokerName, { steps: string[]; notes: string[] }> = {
  pionex: {
    steps: [
      "Apri l'app Pionex",
      'Vai su Account > API Management',
      'Clicca "Create API"',
      'Nome suggerito: "FinGenius Sync"',
      'Permessi necessari: Read Account Info, Read Order History, Read Position',
      '❌ Trade (NON necessario)',
      'Copia API Key e Secret',
    ],
    notes: ['Usa solo permessi READ-ONLY', 'Rate limit: 100 richieste/minuto'],
  },
  bybit: {
    steps: [
      'Login su bybit.com',
      'Vai su Account & Security > API Management',
      'Clicca "Create New Key"',
      'Tipo: "System-generated API Keys"',
      'Permessi: Read-Only (contract/spot/option)',
      'IP Whitelist: Opzionale (raccomandato)',
      'Completa verifica 2FA',
      'Copia Key ID e API Secret',
    ],
    notes: ['IP whitelist aumenta la sicurezza', 'Rate limit: 120 richieste/minuto'],
  },
  binance: {
    steps: [
      'Login su binance.com',
      'Vai su Profile > API Management',
      'Clicca "Create API"',
      'Etichetta: "FinGenius Report Sync"',
      'Permessi: Enable Reading SOLAMENTE',
      '❌ Enable Spot & Margin Trading (disabilitato)',
      'Completa verifica email + 2FA',
      '⚠️ IMPORTANTE: Salva subito il Secret (non sarà più visibile)',
    ],
    notes: [
      'IP Restriction consigliato per sicurezza',
      'Rate limit: 1200 richieste/minuto (molto alto)',
    ],
  },
  bitget: {
    steps: [
      'Login su bitget.com',
      'Vai su Account > API Management',
      'Clicca "Create API Key"',
      'Permessi: Read Only',
      '❌ Trade (disabilitato)',
      'Whitelist IP: Opzionale',
      'Copia API Key, Secret Key e Passphrase',
    ],
    notes: ['Nota rate limits: 20 richieste/secondo', 'Salvare tutti e 3 i parametri'],
  },
  kucoin: {
    steps: [
      'Login su kucoin.com',
      'Vai su API Management nella sezione Account',
      'Clicca "Create API"',
      '⚠️ Crea una Passphrase forte (IMPORTANTE: salvala!)',
      'Permessi: General (Read Only)',
      '❌ Trade (disabilitato)',
      '❌ Transfer (disabilitato)',
      'Completa verifica 2FA',
      'Salva: API Key, API Secret, Passphrase',
    ],
    notes: [
      'ATTENZIONE: KuCoin richiede tutti e 3 i parametri',
      'La Passphrase è obbligatoria',
    ],
  },
  bingx: {
    steps: [
      'Login su bingx.com',
      'Vai su Account > API Management',
      'Clicca "Create Standard API"',
      'Permessi: Query Only',
      '❌ Trading (disabilitato)',
      'Completa verifica email/SMS',
      'IP Whitelist: Opzionale',
      'Copia API Key e Secret Key',
    ],
    notes: ['Rate limit: 10 req/sec (basso, attenzione)', 'Verifica email/SMS obbligatoria'],
  },
};

export const BrokerConnectionDialog: React.FC<BrokerConnectionDialogProps> = ({
  open,
  onOpenChange,
  broker,
  existingConnection,
  onSave,
  isSaving,
}) => {
  const brokerInfo = BROKER_INFO[broker];
  const instructions = BROKER_INSTRUCTIONS[broker];

  const [apiKey, setApiKey] = useState(existingConnection?.api_key || '');
  const [apiSecret, setApiSecret] = useState(existingConnection?.api_secret || '');
  const [apiPassphrase, setApiPassphrase] = useState(existingConnection?.api_passphrase || '');
  const [autoSync, setAutoSync] = useState(existingConnection?.auto_sync_enabled ?? true);
  const [syncFrequency, setSyncFrequency] = useState<SyncFrequency>(
    existingConnection?.sync_frequency || 'daily'
  );
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);

  const handleSave = () => {
    onSave({
      broker_name: broker,
      api_key: apiKey,
      api_secret: apiSecret,
      api_passphrase: brokerInfo.requiresPassphrase ? apiPassphrase : undefined,
      auto_sync_enabled: autoSync,
      sync_frequency: syncFrequency,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{brokerInfo.icon}</span>
            Collega {brokerInfo.displayName}
          </DialogTitle>
          <DialogDescription>{brokerInfo.description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="instructions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="instructions" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Come ottenere le API
            </TabsTrigger>
            <TabsTrigger value="connect" className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Collega API
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Sicurezza
            </TabsTrigger>
          </TabsList>

          <TabsContent value="instructions" className="space-y-4 mt-4">
            <Alert>
              <ExternalLink className="h-4 w-4" />
              <AlertDescription>
                <a
                  href={brokerInfo.apiDocsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Apri documentazione ufficiale API {brokerInfo.displayName}
                </a>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-semibold">Passaggi:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                {instructions.steps.map((step, index) => (
                  <li key={index} className="text-muted-foreground">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <Alert>
              <AlertDescription>
                <strong>⚠️ Note importanti:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {instructions.notes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="connect" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key *</Label>
                <div className="relative">
                  <Input
                    id="api-key"
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Inserisci la tua API Key"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-secret">API Secret *</Label>
                <div className="relative">
                  <Input
                    id="api-secret"
                    type={showApiSecret ? 'text' : 'password'}
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    placeholder="Inserisci il tuo API Secret"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowApiSecret(!showApiSecret)}
                  >
                    {showApiSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {brokerInfo.requiresPassphrase && (
                <div className="space-y-2">
                  <Label htmlFor="api-passphrase">API Passphrase *</Label>
                  <Input
                    id="api-passphrase"
                    type="password"
                    value={apiPassphrase}
                    onChange={(e) => setApiPassphrase(e.target.value)}
                    placeholder="Inserisci la tua Passphrase"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sincronizzazione automatica</Label>
                  <p className="text-sm text-muted-foreground">
                    Sincronizza automaticamente i dati dal broker
                  </p>
                </div>
                <Switch checked={autoSync} onCheckedChange={setAutoSync} />
              </div>

              {autoSync && (
                <div className="space-y-2">
                  <Label htmlFor="sync-frequency">Frequenza sincronizzazione</Label>
                  <Select value={syncFrequency} onValueChange={(value: SyncFrequency) => setSyncFrequency(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Tempo reale</SelectItem>
                      <SelectItem value="hourly">Ogni ora</SelectItem>
                      <SelectItem value="daily">Giornaliera</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                onClick={handleSave}
                disabled={!apiKey || !apiSecret || (brokerInfo.requiresPassphrase && !apiPassphrase) || isSaving}
                className="w-full"
              >
                {isSaving ? 'Salvataggio...' : 'Salva e Collega'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Informazioni sulla sicurezza</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-600">✅</span>
                <span>Le tue API keys sono criptate nel database</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">✅</span>
                <span>Usiamo solo permessi READ-ONLY</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">✅</span>
                <span>Nessuna operazione di trading viene mai eseguita</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">✅</span>
                <span>Puoi revocare l'accesso in qualsiasi momento</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">✅</span>
                <span>Log completo di ogni sincronizzazione</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">✅</span>
                <span>Notifiche in caso di errori di connessione</span>
              </div>
            </div>

            <Alert variant="default">
              <AlertDescription>
                <strong>⚠️ Best Practices:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Usa sempre permessi READ-ONLY</li>
                  <li>Attiva l'IP whitelist sul broker (se supportato)</li>
                  <li>Non condividere mai le tue API keys</li>
                  <li>Cambia le keys periodicamente</li>
                  <li>Controlla il log di sincronizzazione regolarmente</li>
                </ul>
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
