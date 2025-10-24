import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, PlayCircle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AITest() {
  const [isInvoking, setIsInvoking] = useState(false);
  const [result, setResult] = useState<any>(null);

  const invokeAIAgent = async () => {
    setIsInvoking(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-trading-agent', {
        body: {}
      });

      if (error) throw error;

      setResult(data);
      toast.success(`AI Agent completato: ${data.processed} strategie processate`);
    } catch (error: any) {
      console.error('Error invoking AI agent:', error);
      toast.error(error.message || 'Errore durante l\'invocazione dell\'AI agent');
      setResult({ error: error.message });
    } finally {
      setIsInvoking(false);
    }
  };

  const invokeTelegramSender = async () => {
    setIsInvoking(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('telegram-notification-sender', {
        body: {}
      });

      if (error) throw error;

      toast.success(`Telegram sender completato: ${data.sent || 0} messaggi inviati`);
    } catch (error: any) {
      console.error('Error invoking telegram sender:', error);
      toast.error(error.message || 'Errore durante l\'invocazione del telegram sender');
    } finally {
      setIsInvoking(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Trading Agent - Test Console</h1>
        <p className="text-muted-foreground">
          Invoca manualmente le edge functions per testare il sistema
        </p>
      </div>

      <div className="grid gap-6">
        {/* AI Trading Agent */}
        <Card>
          <CardHeader>
            <CardTitle>AI Trading Agent</CardTitle>
            <CardDescription>
              Genera segnali di trading per tutti gli utenti attivi con assicurazione pagata
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={invokeAIAgent} 
              disabled={isInvoking}
              className="w-full"
              size="lg"
            >
              {isInvoking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Invocazione in corso...
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Esegui AI Agent
                </>
              )}
            </Button>

            {result && (
              <div className="mt-4 p-4 bg-secondary rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">Risultato:</span>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? (
                      <>
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Successo
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-1 h-3 w-3" />
                        Errore
                      </>
                    )}
                  </Badge>
                </div>
                
                {result.success && (
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Strategie processate:</span> {result.processed}
                    </p>
                    
                    {result.results && result.results.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Segnali generati:</p>
                        <div className="space-y-2">
                          {result.results.map((r: any, idx: number) => (
                            <div key={idx} className="bg-background p-3 rounded border">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  User: {r.user_id?.substring(0, 8)}...
                                </span>
                                <Badge variant={
                                  r.action === 'SELL_PUT' ? 'default' :
                                  r.action === 'SELL_CALL' ? 'secondary' : 'outline'
                                }>
                                  {r.action}
                                </Badge>
                              </div>
                              <div className="mt-2 text-sm">
                                <span className="font-medium">Premium:</span> {r.premium}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {result.error && (
                  <p className="text-sm text-destructive">{result.error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Telegram Notification Sender */}
        <Card>
          <CardHeader>
            <CardTitle>Telegram Notification Sender</CardTitle>
            <CardDescription>
              Invia tutti i messaggi in coda su Telegram
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={invokeTelegramSender} 
              disabled={isInvoking}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {isInvoking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Invocazione in corso...
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Invia Notifiche Telegram
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">ℹ️ Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              • <strong>AI Agent:</strong> Analizza il mercato BTC e genera segnali di trading per gli utenti attivi
            </p>
            <p>
              • <strong>Telegram Sender:</strong> Processa la coda di notifiche e le invia su Telegram
            </p>
            <p className="text-muted-foreground mt-4">
              💡 I cron jobs eseguono queste funzioni automaticamente ogni 15 minuti (AI Agent) e ogni 5 minuti (Telegram)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
