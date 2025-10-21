import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ActualTrade } from '@/types/investment';
import { useToast } from '@/hooks/use-toast';

interface UseActualTradesProps {
  configId?: string | null;
}

export const useActualTrades = ({ configId }: UseActualTradesProps) => {
  const [trades, setTrades] = useState<ActualTrade[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadTrades = useCallback(async () => {
    if (!configId) {
      setTrades([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('actual_trades')
        .select('*')
        .eq('config_id', configId)
        .order('day', { ascending: true });

      if (error) throw error;
      setTrades((data || []) as ActualTrade[]);
    } catch (error) {
      console.error('Error loading trades:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i trade",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [configId, toast]);

  const deleteTrade = useCallback(async (tradeId: string) => {
    try {
      const { error } = await supabase
        .from('actual_trades')
        .delete()
        .eq('id', tradeId);

      if (error) throw error;
      
      await loadTrades();
      toast({
        title: "Trade eliminato",
        description: "Il trade è stato rimosso con successo"
      });
    } catch (error) {
      console.error('Error deleting trade:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il trade",
        variant: "destructive"
      });
    }
  }, [loadTrades, toast]);

  const getTradeForDay = useCallback((day: number): ActualTrade | undefined => {
    return trades.find(trade => trade.day === day);
  }, [trades]);

  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  return {
    trades,
    loading,
    loadTrades,
    deleteTrade,
    getTradeForDay
  };
};