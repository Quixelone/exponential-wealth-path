import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, CheckCircle2, AlertCircle, ExternalLink, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function TelegramSetup() {
  const [chatId, setChatId] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data: settings } = await supabase
        .from('notification_settings')
        .select('telegram_chat_id, notifications_enabled')
        .single();

      if (settings) {
        setChatId(settings.telegram_chat_id || '');
        setEnabled(settings.notifications_enabled || false);
        setIsConfigured(!!settings.telegram_chat_id);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!chatId.trim()) {
      toast.error('Inserisci il tuo Chat ID');
      return;
    }

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          telegram_chat_id: chatId.trim(),
          notifications_enabled: enabled,
          preferred_method: 'telegram'
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setIsConfigured(true);
      toast.success('Configurazione Telegram salvata!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-wheel-strategy-signal');
      
      if (error) throw error;
      
      if (data.success) {
        toast.success('Test riuscito! Controlla Telegram');
      } else {
        toast.error(data.message || data.error);
      }
    } catch (error: any) {
      toast.error('Errore nel test');
    }
  };

  const copyBotUsername = () => {
    navigator.clipboard.writeText('@userinfobot');
    toast.success('Username copiato!');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-xl font-semibold text-foreground">Configurazione Telegram</h2>
          <p className="text-sm text-muted-foreground">
            Ricevi notifiche e segnali trading su Telegram
          </p>
        </div>
      </div>

      {isConfigured && (
        <Alert className="mb-6 border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            Telegram configurato correttamente
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Step 1 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              1
            </div>
            <h3 className="font-semibold text-foreground">Avvia il Bot Telegram</h3>
          </div>
          <div className="ml-8 space-y-2">
            <p className="text-sm text-muted-foreground">
              Cerca questo bot su Telegram per ottenere il tuo Chat ID:
            </p>
            <div className="flex items-center gap-2">
              <code className="px-3 py-2 bg-muted rounded-md text-sm flex-1">
                @userinfobot
              </code>
              <Button variant="outline" size="sm" onClick={copyBotUsername}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Apri Telegram
                </a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Clicca "Start" o invia /start - il bot ti risponderà con il tuo Chat ID
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              2
            </div>
            <h3 className="font-semibold text-foreground">Ottieni il tuo Chat ID</h3>
          </div>
          <div className="ml-8 space-y-2">
            <p className="text-sm text-muted-foreground">
              Il bot ti invierà automaticamente il tuo Chat ID. Copialo e incollalo qui sotto.
            </p>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Il Chat ID è un numero tipo: <code className="text-xs bg-muted px-1 rounded">123456789</code>
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Step 3 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              3
            </div>
            <h3 className="font-semibold text-foreground">Inserisci Chat ID</h3>
          </div>
          <div className="ml-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chatId">Telegram Chat ID</Label>
              <Input
                id="chatId"
                placeholder="123456789"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Incolla il Chat ID che il bot ti ha inviato
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="notifications"
                  checked={enabled}
                  onCheckedChange={setEnabled}
                  disabled={loading}
                />
                <Label htmlFor="notifications" className="cursor-pointer">
                  Abilita notifiche
                </Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveSettings} disabled={saving || loading || !chatId.trim()}>
                {saving ? 'Salvataggio...' : 'Salva Configurazione'}
              </Button>
              {isConfigured && (
                <Button variant="outline" onClick={testConnection}>
                  Test Connessione
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h4 className="font-semibold text-sm text-foreground mb-2">💡 Suggerimenti</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Riceverai segnali trading automatici via Telegram</li>
          <li>• Puoi disabilitare le notifiche in qualsiasi momento</li>
          <li>• Il bot è sicuro e non richiede permessi aggiuntivi</li>
        </ul>
      </div>
    </Card>
  );
}
