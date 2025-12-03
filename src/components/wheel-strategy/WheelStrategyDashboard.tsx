import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowUp, ArrowDown, TrendingUp, Activity, Target, AlertCircle, RefreshCw, Send, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import NewOptionForm from './NewOptionForm';

interface TechnicalIndicators {
  rsi: number;
  macd: { macd: number; signal: number; histogram: number };
  bollinger: { upper: number; middle: number; lower: number; position: number };
  twap: number;
  vwap: number;
  volatility: number;
  trend: string;
  support: number;
  resistance: number;
  score: number;
}

interface OnChainMetrics {
  fundingRate: number;
  longShortRatio: number;
  fearGreedIndex: number;
  openInterest: number;
  sentiment: string;
  score: number;
}

interface StrikeOption {
  strike: number;
  distance: number;
  delta: number;
  premium: number;
  score: number;
  recommendation: string;
}

interface AnalysisData {
  timestamp: string;
  price: number;
  technical: TechnicalIndicators;
  onchain: OnChainMetrics;
  strikes: StrikeOption[];
  recommendation: StrikeOption;
}

export default function WheelStrategyDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [hasTelegram, setHasTelegram] = useState(false);
  const [hasRecentAnalysis, setHasRecentAnalysis] = useState(false);
  const [showNewOptionDialog, setShowNewOptionDialog] = useState(false);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const { data: analysisData, error } = await supabase.functions.invoke('wheel-strategy-analysis');
      
      if (error) throw error;
      
      if (analysisData.success) {
        setData(analysisData);
        setLastUpdate(new Date());
        setHasRecentAnalysis(true);
      } else {
        throw new Error(analysisData.error);
      }
    } catch (error: any) {
      console.error('Error fetching analysis:', error);
      toast.error('Errore nel caricamento analisi');
      setHasRecentAnalysis(false);
    } finally {
      setLoading(false);
    }
  };

  const checkTelegramConfig = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasTelegram(false);
        return;
      }

      const { data: settings } = await supabase
        .from('notification_settings')
        .select('telegram_chat_id, notifications_enabled')
        .eq('user_id', user.id)
        .maybeSingle();
      
      setHasTelegram(!!settings?.telegram_chat_id && settings?.notifications_enabled);
    } catch (error) {
      console.error('Error checking Telegram config:', error);
      setHasTelegram(false);
    }
  };

  const sendTelegramSignal = async () => {
    try {
      setSending(true);
      const { data: result, error } = await supabase.functions.invoke('send-wheel-strategy-signal');
      
      if (error) throw error;
      
      if (result.success) {
        toast.success('Segnale inviato su Telegram!');
      } else {
        // Show the specific message from backend (e.g., "no recent analysis")
        if (result.message) {
          toast.info(result.message);
        } else {
          toast.error(result.error || 'Errore invio segnale');
        }
      }
    } catch (error: any) {
      console.error('Error sending signal:', error);
      // Only show generic error for actual network/server errors
      if (error.message && !error.message.includes('analisi')) {
        toast.error('Errore nella comunicazione con il server');
      }
    } finally {
      setSending(false);
    }
  };

  const handleOptionSubmit = async (optionData: any) => {
    try {
      const { error } = await supabase
        .from('options_trades')
        .insert(optionData);

      if (error) throw error;

      toast.success('Opzione salvata con successo!');
      setShowNewOptionDialog(false);
    } catch (error: any) {
      console.error('Error saving option:', error);
      toast.error('Errore nel salvataggio dell\'opzione');
    }
  };

  useEffect(() => {
    fetchAnalysis();
    checkTelegramConfig();
    const interval = setInterval(fetchAnalysis, 300000); // 5 minuti
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!data) return null;

  const getSentimentColor = (sentiment: string) => {
    const colors: Record<string, string> = {
      extreme_fear: 'bg-red-500',
      fear: 'bg-orange-500',
      neutral: 'bg-yellow-500',
      greed: 'bg-lime-500',
      extreme_greed: 'bg-green-500'
    };
    return colors[sentiment] || 'bg-gray-500';
  };

  const getActionIcon = (action: string) => {
    if (action === 'SELL_PUT') return <ArrowDown className="h-5 w-5" />;
    if (action === 'SELL_CALL') return <ArrowUp className="h-5 w-5" />;
    return <Activity className="h-5 w-5" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Wheel Strategy Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Ultimo aggiornamento: {lastUpdate?.toLocaleTimeString('it-IT')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowNewOptionDialog(true)} disabled={!data}>
            <Plus className="h-4 w-4 mr-2" />
            Nuova Opzione
          </Button>
          <Button onClick={fetchAnalysis} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
          {hasTelegram ? (
            <Button 
              onClick={sendTelegramSignal} 
              disabled={sending || !hasRecentAnalysis}
              title={!hasRecentAnalysis ? 'Clicca prima su Aggiorna per generare una nuova analisi' : ''}
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Invio...' : 'Invia Telegram'}
            </Button>
          ) : (
            <Button variant="outline" disabled>
              <Send className="h-4 w-4 mr-2" />
              Telegram non configurato
            </Button>
          )}
        </div>
      </div>

      {/* Dialog Nuova Opzione */}
      <Dialog open={showNewOptionDialog} onOpenChange={setShowNewOptionDialog}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Nuova Opzione</DialogTitle>
            <DialogDescription>Inserisci i dettagli della nuova opzione</DialogDescription>
          </DialogHeader>
          {data && user && (
            <NewOptionForm
              configId={user.id} 
              userId={user.id}
              availableStrikes={data.strikes.map(s => s.strike)}
              defaultCapital={10000}
              currentBtcPrice={data.price}
              onSubmit={handleOptionSubmit}
              onCancel={() => setShowNewOptionDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Price & Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Prezzo BTC</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                ${data.price.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Azione Raccomandata</p>
              <div className="flex items-center gap-2 mt-2">
                {getActionIcon(data.recommendation.recommendation)}
                <span className="text-xl font-bold text-foreground">
                  {data.recommendation.recommendation}
                </span>
              </div>
            </div>
            <Badge variant={data.recommendation.score > 75 ? 'default' : 'secondary'}>
              {data.recommendation.score.toFixed(0)}/100
            </Badge>
          </div>
        </Card>

        <Card className="p-6 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Strike Ottimale</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                ${data.recommendation.strike.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Premium: {data.recommendation.premium.toFixed(2)}%
              </p>
            </div>
            <Target className="h-8 w-8 text-primary" />
          </div>
        </Card>
      </div>

      {/* Technical Analysis */}
      <Card className="p-6 bg-card">
        <h2 className="text-xl font-semibold text-foreground mb-4">Analisi Tecnica</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">RSI (14)</p>
            <p className="text-2xl font-bold text-foreground">{data.technical.rsi.toFixed(2)}</p>
            <Badge variant={data.technical.rsi < 30 ? 'destructive' : data.technical.rsi > 70 ? 'destructive' : 'default'} className="mt-1">
              {data.technical.rsi < 30 ? 'Oversold' : data.technical.rsi > 70 ? 'Overbought' : 'Neutral'}
            </Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">MACD</p>
            <p className="text-2xl font-bold text-foreground">{data.technical.macd.histogram.toFixed(2)}</p>
            <Badge variant={data.technical.macd.histogram > 0 ? 'default' : 'secondary'} className="mt-1">
              {data.technical.macd.histogram > 0 ? 'Bullish' : 'Bearish'}
            </Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Volatilità 24h</p>
            <p className="text-2xl font-bold text-foreground">{data.technical.volatility.toFixed(2)}%</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Trend</p>
            <p className="text-2xl font-bold text-foreground capitalize">{data.technical.trend}</p>
            <Badge variant="outline" className="mt-1">Score: {data.technical.score}/100</Badge>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-muted-foreground">Support: ${data.technical.support.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Resistance: ${data.technical.resistance.toLocaleString()}</span>
          </div>
        </div>
      </Card>

      {/* On-Chain Metrics */}
      <Card className="p-6 bg-card">
        <h2 className="text-xl font-semibold text-foreground mb-4">Metriche On-Chain</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Funding Rate</p>
            <p className="text-2xl font-bold text-foreground">{(data.onchain.fundingRate * 100).toFixed(4)}%</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Long/Short Ratio</p>
            <p className="text-2xl font-bold text-foreground">{data.onchain.longShortRatio.toFixed(2)}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Sentiment</p>
            <Badge className={getSentimentColor(data.onchain.sentiment)}>
              {data.onchain.sentiment.replace('_', ' ')}
            </Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">On-Chain Score</p>
            <p className="text-2xl font-bold text-foreground">{data.onchain.score}/100</p>
          </div>
        </div>
      </Card>

      {/* Top Strikes */}
      <Card className="p-6 bg-card">
        <h2 className="text-xl font-semibold text-foreground mb-4">Top 5 Strike Options</h2>
        <div className="space-y-3">
          {data.strikes.map((strike, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${
                idx === 0 ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant={idx === 0 ? 'default' : 'outline'}>#{idx + 1}</Badge>
                  <div>
                    <p className="font-semibold text-foreground">${strike.strike.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">
                      Distance: {(strike.distance * 100).toFixed(2)}% | Delta: {strike.delta.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{strike.premium.toFixed(2)}%</p>
                  <Badge variant={strike.score > 75 ? 'default' : 'secondary'}>
                    Score: {strike.score.toFixed(0)}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
