import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Unplug, 
  RefreshCw,
  Bell,
  Clock,
  Loader2
} from 'lucide-react';

interface NotificationSetupProps {
  userId: string;
}

type ConnectionState = 'disconnected' | 'generating' | 'waiting' | 'connected';

export function NotificationSetup({ userId }: NotificationSetupProps) {
  const [state, setState] = useState<ConnectionState>('disconnected');
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [chatId, setChatId] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingTest, setSendingTest] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);

  // Check connection status on mount
  const checkConnection = useCallback(async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) return;

      const response = await supabase.functions.invoke('telegram-verify-connection', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });

      if (response.data?.connected) {
        setState('connected');
        setChatId(response.data.chatId);
        setNotificationsEnabled(response.data.notificationsEnabled);
      } else {
        setState('disconnected');
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Countdown timer
  useEffect(() => {
    if (!expiresAt || state !== 'waiting') return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      setTimeLeft(diff);

      if (diff === 0) {
        setState('disconnected');
        setCode(null);
        setExpiresAt(null);
        toast.error('Codice scaduto', { description: 'Genera un nuovo codice per collegare Telegram' });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, state]);

  // Polling for connection verification
  useEffect(() => {
    if (state !== 'waiting') return;

    const pollInterval = setInterval(async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.access_token) return;

        const response = await supabase.functions.invoke('telegram-verify-connection', {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`
          }
        });

        if (response.data?.connected) {
          setState('connected');
          setChatId(response.data.chatId);
          setNotificationsEnabled(response.data.notificationsEnabled);
          setCode(null);
          setExpiresAt(null);
          toast.success('Telegram collegato!', { description: 'Riceverai le notifiche su Telegram' });
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [state]);

  const generateCode = async () => {
    setState('generating');
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        toast.error('Sessione scaduta');
        setState('disconnected');
        return;
      }

      const response = await supabase.functions.invoke('telegram-generate-link-code', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setCode(response.data.code);
      setExpiresAt(new Date(response.data.expiresAt));
      setTimeLeft(300);
      setState('waiting');
    } catch (error) {
      console.error('Error generating code:', error);
      toast.error('Errore generazione codice');
      setState('disconnected');
    }
  };

  const copyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(`/connect ${code}`);
      setCopied(true);
      toast.success('Comando copiato!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Errore copia');
    }
  };

  const sendTest = async () => {
    setSendingTest(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        toast.error('Sessione scaduta');
        return;
      }

      const response = await supabase.functions.invoke('telegram-send-test', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });

      if (response.data?.success) {
        toast.success('Messaggio test inviato!', { description: 'Controlla Telegram' });
      } else {
        throw new Error(response.data?.error || 'Errore');
      }
    } catch (error) {
      console.error('Error sending test:', error);
      toast.error('Errore invio test');
    } finally {
      setSendingTest(false);
    }
  };

  const disconnect = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        toast.error('Sessione scaduta');
        return;
      }

      const response = await supabase.functions.invoke('telegram-disconnect', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });

      if (response.data?.success) {
        setState('disconnected');
        setChatId(null);
        toast.success('Telegram scollegato');
      } else {
        throw new Error(response.data?.error || 'Errore');
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Errore scollegamento');
    }
    setShowDisconnectDialog(false);
  };

  const toggleNotifications = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('notification_settings')
        .update({ 
          notifications_enabled: enabled,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
      setNotificationsEnabled(enabled);
      toast.success(enabled ? 'Notifiche attivate' : 'Notifiche disattivate');
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast.error('Errore aggiornamento');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maskChatId = (id: string) => {
    if (id.length <= 4) return id;
    return id.slice(0, 3) + '***' + id.slice(-3);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#0088cc]/10">
                <svg 
                  viewBox="0 0 24 24" 
                  className="h-6 w-6 text-[#0088cc]"
                  fill="currentColor"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </div>
              <div>
                <CardTitle className="text-lg">Notifiche Telegram</CardTitle>
                <CardDescription>
                  Ricevi notifiche quando le tue opzioni scadono
                </CardDescription>
              </div>
            </div>
            {state === 'connected' && (
              <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                <Check className="h-3 w-3 mr-1" />
                Collegato
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Disconnected State */}
          {state === 'disconnected' && (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                Collega il tuo account Telegram per ricevere notifiche in tempo reale
              </p>
              <Button onClick={generateCode} className="gap-2">
                <Bell className="h-4 w-4" />
                Genera Codice di Collegamento
              </Button>
            </div>
          )}

          {/* Generating State */}
          {state === 'generating' && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-2">Generazione codice...</p>
            </div>
          )}

          {/* Waiting State */}
          {state === 'waiting' && code && (
            <div className="space-y-6">
              {/* Code Display */}
              <div className="relative">
                <div 
                  className="bg-muted/50 border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={copyCode}
                >
                  <p className="text-xs text-muted-foreground mb-2">Comando da inviare:</p>
                  <code className="text-2xl md:text-3xl font-mono font-bold tracking-wider">
                    /connect {code}
                  </code>
                  <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-green-500">Copiato!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Clicca per copiare</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Timer */}
                <div className="absolute -top-2 -right-2">
                  <Badge 
                    variant={timeLeft < 60 ? "destructive" : "secondary"}
                    className="gap-1"
                  >
                    <Clock className="h-3 w-3" />
                    {formatTime(timeLeft)}
                  </Badge>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Come collegare:</p>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">1</span>
                    <span>Apri Telegram sul tuo dispositivo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">2</span>
                    <span>Cerca <strong>@BTCWheelProBot</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">3</span>
                    <span>Invia il comando: <code className="bg-muted px-1 rounded">/connect {code}</code></span>
                  </li>
                </ol>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  asChild
                >
                  <a 
                    href="https://t.me/BTCWheelProBot" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Apri Telegram
                  </a>
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex-1 gap-2"
                  onClick={generateCode}
                >
                  <RefreshCw className="h-4 w-4" />
                  Nuovo Codice
                </Button>
              </div>

              {/* Polling indicator */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>In attesa del collegamento...</span>
              </div>
            </div>
          )}

          {/* Connected State */}
          {state === 'connected' && (
            <div className="space-y-6">
              {/* Connection Info */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Chat ID</p>
                  <p className="font-mono">{chatId ? maskChatId(chatId) : '---'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="notifications-toggle" className="text-sm">
                    Notifiche attive
                  </Label>
                  <Switch
                    id="notifications-toggle"
                    checked={notificationsEnabled}
                    onCheckedChange={toggleNotifications}
                  />
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  onClick={sendTest}
                  disabled={sendingTest}
                >
                  {sendingTest ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Invia Test
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex-1 gap-2 text-destructive hover:text-destructive"
                  onClick={() => setShowDisconnectDialog(true)}
                >
                  <Unplug className="h-4 w-4" />
                  Scollega
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Scollega Telegram?</AlertDialogTitle>
            <AlertDialogDescription>
              Non riceverai più notifiche su Telegram. Potrai ricollegare il tuo account in qualsiasi momento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={disconnect} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Scollega
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
