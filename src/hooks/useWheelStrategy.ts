import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export function useWheelStrategy(autoRefresh: boolean = true, refreshInterval: number = 300000) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: analysisData, error: fetchError } = await supabase.functions.invoke(
        'wheel-strategy-analysis'
      );

      if (fetchError) throw fetchError;

      if (analysisData.success) {
        setData(analysisData);
        setLastUpdate(new Date());
      } else {
        throw new Error(analysisData.error || 'Unknown error');
      }
    } catch (err: any) {
      console.error('Error fetching wheel strategy analysis:', err);
      setError(err.message || 'Failed to fetch analysis');
      toast.error('Errore nel caricamento dell\'analisi');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendTelegramSignal = useCallback(async () => {
    try {
      const { data: result, error: sendError } = await supabase.functions.invoke(
        'send-wheel-strategy-signal'
      );

      if (sendError) throw sendError;

      if (result.success) {
        toast.success('Segnale inviato su Telegram!');
        return true;
      } else {
        throw new Error(result.error || 'Failed to send signal');
      }
    } catch (err: any) {
      console.error('Error sending Telegram signal:', err);
      toast.error(err.message || 'Errore nell\'invio del segnale');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchAnalysis();

    if (autoRefresh) {
      const interval = setInterval(fetchAnalysis, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchAnalysis]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refetch: fetchAnalysis,
    sendTelegramSignal
  };
}
