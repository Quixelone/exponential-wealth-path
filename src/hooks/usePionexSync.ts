import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DailyOptionsEntry, BalanceSnapshot, PionexSyncResult } from '@/types/pionex';

/**
 * Hook for Pionex balance synchronization and options tracking
 * Provides manual sync, auto-refresh, and real-time data loading
 */
export function usePionexSync(userId: string | undefined) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [todayEntry, setTodayEntry] = useState<DailyOptionsEntry | null>(null);
  const [recentEntries, setRecentEntries] = useState<DailyOptionsEntry[]>([]);
  const [currentBalance, setCurrentBalance] = useState<BalanceSnapshot | null>(null);
  const { toast } = useToast();

  /**
   * Load data from Supabase (last 30 days options + current balance)
   */
  const loadData = useCallback(async () => {
    if (!userId) return;

    try {
      // Cast to any to bypass TypeScript errors with new tables
      const { data: options, error: optionsError } = await (supabase as any)
        .from('daily_options_log')
        .select('*')
        .eq('user_id', userId)
        .order('option_date', { ascending: false })
        .limit(30);

      if (optionsError) throw optionsError;

      setRecentEntries((options || []) as DailyOptionsEntry[]);

      const today = new Date().toISOString().split('T')[0];
      const todayOption = (options || []).find((o: any) => o.option_date === today);
      setTodayEntry((todayOption as DailyOptionsEntry) || null);

      const { data: balance, error: balanceError } = await (supabase as any)
        .from('balance_history')
        .select('*')
        .eq('user_id', userId)
        .order('check_timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (balanceError) throw balanceError;

      setCurrentBalance((balance || null) as BalanceSnapshot | null);

      if (balance) {
        setLastSync(new Date((balance as any).check_timestamp));
      }

    } catch (err: any) {
      setError(err.message);
    }
  }, [userId]);

  /**
   * Manual synchronization with Pionex API
   */
  const manualSync = useCallback(async () => {
    if (!userId) {
      toast({
        title: "Errore",
        description: "Utente non autenticato",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      toast({
        title: "Sincronizzazione in corso...",
        description: "Collegamento a Pionex API",
      });

      const { data, error: syncError } = await supabase.functions.invoke('sync-pionex-balance', {
        body: { userId, manualSync: true }
      });

      if (syncError) throw syncError;

      if (!data.success) {
        throw new Error(data.error || 'Sync failed');
      }

      const result = data.results?.[0];

      toast({
        title: "✅ Sincronizzazione completata",
        description: result?.option_type 
          ? `${result.option_type}: ${result.premium_eur?.toFixed(2) || '0.00'} €`
          : "Nessuna opzione registrata oggi",
      });

      await loadData();

    } catch (err: any) {
      setError(err.message);
      
      toast({
        title: "❌ Errore sincronizzazione",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast, loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  return {
    isLoading,
    error,
    lastSync,
    todayEntry,
    recentEntries,
    currentBalance,
    manualSync,
    refreshData: loadData
  };
}
