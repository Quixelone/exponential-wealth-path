import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Strategy, StrategyConfig } from '@/types/strategy';
import { useToast } from '@/hooks/use-toast';

export const useStrategyDatabase = () => {
  const [loading, setLoading] = useState(false);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const { toast } = useToast();

  const loadStrategies = useCallback(async (): Promise<void> => {
    if (loading) return;
    
    console.log('🔄 Caricamento strategie...');
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log('❌ Utente non autenticato');
        return;
      }

      const { data: configs, error } = await supabase
        .from('investment_configs')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const strategiesData: Strategy[] = [];
      console.log(`📊 Trovate ${configs?.length || 0} configurazioni`);

      for (const config of configs || []) {
        // Carica daily returns
        const { data: dailyReturns } = await supabase
          .from('daily_returns')
          .select('*')
          .eq('config_id', config.id);

        // Carica daily PAC overrides
        const { data: dailyPACOverrides } = await supabase
          .from('daily_pac_overrides')
          .select('*')
          .eq('config_id', config.id);

        const dailyReturnsMap: { [day: number]: number } = {};
        (dailyReturns || []).forEach(dr => {
          dailyReturnsMap[dr.day] = dr.return_rate;
        });

        const dailyPACOverridesMap: { [day: number]: number } = {};
        (dailyPACOverrides || []).forEach(po => {
          dailyPACOverridesMap[po.day] = po.pac_amount;
        });

        strategiesData.push({
          id: config.id,
          name: config.name,
          config: {
            initialCapital: config.initial_capital,
            timeHorizon: config.time_horizon,
            dailyReturnRate: config.daily_return_rate,
            currency: config.currency as 'EUR' | 'USD' | 'USDT',
            pacConfig: {
              amount: config.pac_amount,
              frequency: (config.pac_frequency || 'monthly') as 'daily' | 'weekly' | 'monthly' | 'custom',
              customDays: config.pac_custom_days,
              startDate: new Date(config.pac_start_date || new Date())
            }
          },
          dailyReturns: dailyReturnsMap,
          dailyPACOverrides: dailyPACOverridesMap,
          created_at: config.created_at,
          updated_at: config.updated_at
        });
      }

      console.log(`✅ Caricate ${strategiesData.length} strategie`);
      setStrategies(strategiesData);
    } catch (error) {
      console.error('Errore caricamento strategie:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le strategie",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [loading, toast]);

  const saveStrategy = useCallback(async (
    name: string,
    config: StrategyConfig,
    dailyReturns: { [day: number]: number },
    dailyPACOverrides: { [day: number]: number }
  ): Promise<string | null> => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Errore",
          description: "Devi essere autenticato per salvare una strategia",
          variant: "destructive",
        });
        return null;
      }

      const { data: savedConfig, error: configError } = await supabase
        .from('investment_configs')
        .insert({
          user_id: user.user.id,
          name,
          initial_capital: config.initialCapital,
          time_horizon: config.timeHorizon,
          daily_return_rate: config.dailyReturnRate,
          currency: config.currency || 'EUR',
          pac_amount: config.pacConfig.amount,
          pac_frequency: config.pacConfig.frequency,
          pac_custom_days: config.pacConfig.customDays,
          pac_start_date: config.pacConfig.startDate.toISOString().split('T')[0],
        })
        .select()
        .single();

      if (configError) throw configError;

      // Salva daily returns
      if (Object.keys(dailyReturns).length > 0) {
        const returnsToInsert = Object.entries(dailyReturns).map(([day, rate]) => ({
          config_id: savedConfig.id,
          day: parseInt(day),
          return_rate: rate,
        }));

        const { error: returnsError } = await supabase
          .from('daily_returns')
          .insert(returnsToInsert);

        if (returnsError) throw returnsError;
      }

      // Salva daily PAC overrides
      if (Object.keys(dailyPACOverrides).length > 0) {
        const pacOverridesToInsert = Object.entries(dailyPACOverrides).map(([day, amount]) => ({
          config_id: savedConfig.id,
          day: parseInt(day),
          pac_amount: amount,
        }));

        const { error: pacError } = await supabase
          .from('daily_pac_overrides')
          .insert(pacOverridesToInsert);

        if (pacError) throw pacError;
      }

      await loadStrategies();
      
      toast({
        title: "Strategia salvata",
        description: `La strategia "${name}" è stata salvata con successo`,
      });

      return savedConfig.id;
    } catch (error) {
      console.error('Errore salvataggio strategia:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare la strategia",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadStrategies, toast]);

  const updateStrategy = useCallback(async (
    strategyId: string,
    name: string,
    config: StrategyConfig,
    dailyReturns: { [day: number]: number },
    dailyPACOverrides: { [day: number]: number }
  ): Promise<boolean> => {
    setLoading(true);
    try {
      // Aggiorna config principale
      const { error: configError } = await supabase
        .from('investment_configs')
        .update({
          name,
          initial_capital: config.initialCapital,
          time_horizon: config.timeHorizon,
          daily_return_rate: config.dailyReturnRate,
          currency: config.currency || 'EUR',
          pac_amount: config.pacConfig.amount,
          pac_frequency: config.pacConfig.frequency,
          pac_custom_days: config.pacConfig.customDays,
          pac_start_date: config.pacConfig.startDate.toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        })
        .eq('id', strategyId);

      if (configError) throw configError;

      // Elimina e reinserisci daily returns
      await supabase.from('daily_returns').delete().eq('config_id', strategyId);
      if (Object.keys(dailyReturns).length > 0) {
        const returnsToInsert = Object.entries(dailyReturns).map(([day, rate]) => ({
          config_id: strategyId,
          day: parseInt(day),
          return_rate: rate,
        }));
        await supabase.from('daily_returns').insert(returnsToInsert);
      }

      // Elimina e reinserisci daily PAC overrides
      await supabase.from('daily_pac_overrides').delete().eq('config_id', strategyId);
      if (Object.keys(dailyPACOverrides).length > 0) {
        const pacOverridesToInsert = Object.entries(dailyPACOverrides).map(([day, amount]) => ({
          config_id: strategyId,
          day: parseInt(day),
          pac_amount: amount,
        }));
        await supabase.from('daily_pac_overrides').insert(pacOverridesToInsert);
      }

      await loadStrategies();
      
      toast({
        title: "Strategia aggiornata",
        description: `La strategia "${name}" è stata aggiornata con successo`,
      });

      return true;
    } catch (error) {
      console.error('Errore aggiornamento strategia:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la strategia",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadStrategies, toast]);

  const deleteStrategy = useCallback(async (strategyId: string): Promise<void> => {
    setLoading(true);
    try {
      // Elimina in cascata: prima daily returns e PAC overrides, poi config
      await supabase.from('daily_returns').delete().eq('config_id', strategyId);
      await supabase.from('daily_pac_overrides').delete().eq('config_id', strategyId);
      
      const { error } = await supabase
        .from('investment_configs')
        .delete()
        .eq('id', strategyId);

      if (error) throw error;

      setStrategies(prev => prev.filter(s => s.id !== strategyId));
      
      toast({
        title: "Strategia eliminata",
        description: "La strategia è stata eliminata con successo",
      });
    } catch (error) {
      console.error('Errore eliminazione strategia:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare la strategia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    strategies,
    loadStrategies,
    saveStrategy,
    updateStrategy,
    deleteStrategy,
  };
};