
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  message_number: number;
  status: 'success' | 'error';
  sid?: string;
  error?: string;
  error_code?: number;
  to: string;
  timestamp: string;
}

interface TestSummary {
  total_messages: number;
  successful: number;
  failed: number;
  success_rate: string;
  phone_number: string;
  test_completed_at: string;
}

const NotificationTester = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messageCount, setMessageCount] = useState(1);
  const [customMessage, setCustomMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testSummary, setTestSummary] = useState<TestSummary | null>(null);
  const { toast } = useToast();

  const handleTest = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un numero WhatsApp valido",
        variant: "destructive",
      });
      return;
    }

    // Validazione formato numero
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast({
        title: "Formato non valido",
        description: "Il numero deve essere in formato internazionale (es. +393331234567)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setTestResults([]);
    setTestSummary(null);

    try {
      console.log(`Starting WhatsApp test: ${messageCount} messages to ${phoneNumber}`);

      const { data, error } = await supabase.functions.invoke('test-whatsapp', {
        body: {
          phone_number: phoneNumber,
          message_count: messageCount,
          test_message: customMessage.trim() || undefined
        }
      });

      if (error) {
        console.error('Test WhatsApp error:', error);
        throw new Error(error.message || 'Errore durante il test');
      }

      console.log('Test WhatsApp response:', data);

      if (data?.success) {
        setTestResults(data.detailed_results || []);
        setTestSummary(data.summary);
        
        toast({
          title: "Test completato!",
          description: data.message,
          variant: data.summary.successful > 0 ? "default" : "destructive",
        });
      } else {
        throw new Error(data?.error || 'Test fallito');
      }

    } catch (error: any) {
      console.error('Error testing WhatsApp:', error);
      toast({
        title: "Errore nel test",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">Successo</Badge>;
      case 'error':
        return <Badge variant="destructive">Errore</Badge>;
      default:
        return <Badge variant="outline">In attesa</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Test Notifiche WhatsApp
          </CardTitle>
          <CardDescription>
            Testa l'invio di notifiche WhatsApp per verificare la configurazione di Twilio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Numero WhatsApp</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+393331234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Formato internazionale richiesto (es. +393331234567)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="count">Numero di messaggi</Label>
              <Select value={messageCount.toString()} onValueChange={(value) => setMessageCount(parseInt(value))}>
                <SelectTrigger disabled={isLoading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 5, 10].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} messaggio{num > 1 ? 'i' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Messaggio personalizzato (opzionale)</Label>
            <Textarea
              id="message"
              placeholder="Lascia vuoto per usare il messaggio di test predefinito..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Nota:</strong> Assicurati che il numero WhatsApp sia registrato nella sandbox di Twilio 
              e che abbia inviato il messaggio di conferma "join sandbox-xxxxxxx" al numero +1 415 523 8886.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleTest} 
            disabled={isLoading || !phoneNumber.trim()}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Invio in corso...' : `Testa WhatsApp (${messageCount} messaggio${messageCount > 1 ? 'i' : ''})`}
          </Button>
        </CardContent>
      </Card>

      {/* Riepilogo risultati */}
      {testSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Riepilogo Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{testSummary.total_messages}</div>
                <div className="text-sm text-muted-foreground">Totale</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{testSummary.successful}</div>
                <div className="text-sm text-muted-foreground">Successi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{testSummary.failed}</div>
                <div className="text-sm text-muted-foreground">Errori</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{testSummary.success_rate}</div>
                <div className="text-sm text-muted-foreground">Successo</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dettagli risultati */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dettagli Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium">Messaggio #{result.message_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(result.timestamp).toLocaleString('it-IT')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {getStatusBadge(result.status)}
                    {result.status === 'success' && result.sid && (
                      <div className="text-xs text-muted-foreground mt-1">
                        SID: {result.sid.substring(0, 20)}...
                      </div>
                    )}
                    {result.status === 'error' && result.error && (
                      <div className="text-xs text-red-600 mt-1 max-w-48 truncate">
                        {result.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationTester;
