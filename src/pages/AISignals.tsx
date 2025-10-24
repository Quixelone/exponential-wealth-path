import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, PauseCircle, Shield, Send } from 'lucide-react';

interface AISignal {
  id: string;
  signal_date: string;
  signal_time: string;
  btc_price_usd: number;
  rsi_14: number;
  macd_signal: string;
  bollinger_position: string;
  volatility_24h: number;
  recommended_action: string;
  recommended_strike_price: number | null;
  recommended_premium_pct: number;
  confidence_score: number;
  reasoning: string;
  telegram_sent: boolean;
  is_premium_too_low: boolean;
  insurance_activated: boolean;
  current_position_type: string | null;
  current_strike_price: number | null;
  will_be_filled: boolean;
}

export default function AISignals() {
  const { user } = useAuth();
  const [signals, setSignals] = useState<AISignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    loadSignals();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('ai-signals-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_trading_signals',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New signal received:', payload);
          setSignals(prev => [payload.new as AISignal, ...prev]);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  const loadSignals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_trading_signals')
        .select('*')
        .eq('user_id', user.id)
        .order('signal_date', { ascending: false })
        .order('signal_time', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      
      setSignals(data as AISignal[] || []);
    } catch (err: any) {
      console.error('Error loading signals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>
            Devi essere autenticato per visualizzare i segnali AI.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-12 w-64" />
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Errore nel caricamento dei segnali: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'SELL_PUT':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'SELL_CALL':
        return <TrendingDown className="h-5 w-5 text-blue-500" />;
      case 'HOLD':
        return <PauseCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };
  
  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'SELL_PUT':
        return 'default';
      case 'SELL_CALL':
        return 'secondary';
      case 'HOLD':
        return 'outline';
      default:
        return 'outline';
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          🤖 Segnali AI Trading
        </h1>
        <p className="text-muted-foreground mt-2">
          Analisi tecnica giornaliera e suggerimenti per le tue opzioni BTC
        </p>
      </div>
      
      {signals.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              Nessun segnale disponibile. I segnali vengono generati ogni giorno alle 10:00 AM.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {signals.map(signal => (
            <Card key={signal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {getActionIcon(signal.recommended_action)}
                    <div>
                      <CardTitle className="text-lg">
                        {new Date(signal.signal_date).toLocaleDateString('it-IT', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(signal.signal_time).toLocaleTimeString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getActionBadgeVariant(signal.recommended_action)}>
                      {signal.recommended_action}
                    </Badge>
                    {signal.telegram_sent && (
                      <Badge variant="outline" className="gap-1">
                        <Send className="h-3 w-3" />
                        Inviato
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Market Data */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Prezzo BTC</p>
                    <p className="font-mono text-lg font-semibold">
                      ${signal.btc_price_usd.toFixed(0)}
                    </p>
                  </div>
                  {signal.recommended_strike_price && (
                    <div>
                      <p className="text-xs text-muted-foreground">Strike Consigliato</p>
                      <p className="font-mono text-lg font-semibold">
                        ${signal.recommended_strike_price.toFixed(0)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Premio Stimato</p>
                    <p className={`font-mono text-lg font-semibold ${
                      signal.recommended_premium_pct < 0.10 ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {signal.recommended_premium_pct.toFixed(3)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <p className="font-mono text-lg font-semibold">
                      {(signal.confidence_score * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                
                {/* Technical Indicators */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">RSI (14)</p>
                    <p className="font-mono text-sm">{signal.rsi_14?.toFixed(1) || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">MACD</p>
                    <p className="text-sm capitalize">{signal.macd_signal || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Bollinger</p>
                    <p className="text-sm capitalize">{signal.bollinger_position || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Volatilità 24h</p>
                    <p className="font-mono text-sm">{signal.volatility_24h?.toFixed(2) || 'N/A'}%</p>
                  </div>
                </div>
                
                {/* Current Position */}
                {signal.current_position_type && (
                  <div className="p-3 border border-primary/20 bg-primary/5 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Posizione Attuale
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm">
                        {signal.current_position_type} @ ${signal.current_strike_price?.toFixed(0)}
                      </p>
                      <Badge variant={signal.will_be_filled ? 'destructive' : 'default'}>
                        {signal.will_be_filled ? 'FILLATA' : 'OTM'}
                      </Badge>
                    </div>
                  </div>
                )}
                
                {/* Insurance Coverage Alert */}
                {signal.insurance_activated && (
                  <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                    <Shield className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                      Copertura assicurativa attivata - Premio troppo basso ({signal.recommended_premium_pct.toFixed(3)}%). 
                      Riceverai 0.15% garantito.
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* AI Reasoning */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Analisi AI:</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {signal.reasoning}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
