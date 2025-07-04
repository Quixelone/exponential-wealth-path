import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Strategy } from '@/types/strategy';

export const useStrategyDatabase = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStrategies = useCallback(async (): Promise<void> => {
    if (loading) return;
    
    console.log('🔄 Caricamento strategie...');
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log('❌ Utente non autenticato');
        setLoading(false);
        return;
      }

      const { data: configs, error } = await supabase
        .from('investment_configs')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching configs:', error);
        setLoading(false);
        return;
      }

      const strategiesData: Strategy[] = [];

      console.log(`📊 Trovate ${configs?.length || 0} configurazioni`);

      for (const config of configs || []) {
        try {
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
        } catch (configError) {
          console.error(`Error processing config ${config.id}:`, configError);
        }
      }

      console.log(`✅ Caricate ${strategiesData.length} strategie`);
      setStrategies(strategiesData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const saveStrategy = useCallback(async (strategy: Omit<Strategy, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data: config, error } = await supabase
        .from('investment_configs')
        .insert({
          user_id: user.user.id,
          name: strategy.name,
          initial_capital: strategy.config.initialCapital,
          time_horizon: strategy.config.timeHorizon,
          daily_return_rate: strategy.config.dailyReturnRate,
          currency: strategy.config.currency,
          pac_amount: strategy.config.pacConfig.amount,
          pac_frequency: strategy.config.pacConfig.frequency,
          pac_custom_days: strategy.config.pacConfig.customDays,
          pac_start_date: strategy.config.pacConfig.startDate.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Save daily returns
      if (Object.keys(strategy.dailyReturns).length > 0) {
        const dailyReturnsData = Object.entries(strategy.dailyReturns).map(([day, rate]) => ({
          config_id: config.id,
          day: parseInt(day),
          return_rate: rate
        }));

        await supabase.from('daily_returns').insert(dailyReturnsData);
      }

      // Save daily PAC overrides
      if (Object.keys(strategy.dailyPACOverrides).length > 0) {
        const dailyPACData = Object.entries(strategy.dailyPACOverrides).map(([day, amount]) => ({
          config_id: config.id,
          day: parseInt(day),
          pac_amount: amount
        }));

        await supabase.from('daily_pac_overrides').insert(dailyPACData);
      }

      await loadStrategies();
      return config.id;
    } catch (error) {
      console.error('Error saving strategy:', error);
      return null;
    }
  }, [loadStrategies]);

  const updateStrategy = useCallback(async (id: string, updates: Partial<Strategy>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('investment_configs')
        .update({
          name: updates.name,
          initial_capital: updates.config?.initialCapital,
          time_horizon: updates.config?.timeHorizon,
          daily_return_rate: updates.config?.dailyReturnRate,
          currency: updates.config?.currency,
          pac_amount: updates.config?.pacConfig?.amount,
          pac_frequency: updates.config?.pacConfig?.frequency,
          pac_custom_days: updates.config?.pacConfig?.customDays,
          pac_start_date: updates.config?.pacConfig?.startDate?.toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Update daily returns if provided
      if (updates.dailyReturns) {
        await supabase.from('daily_returns').delete().eq('config_id', id);
        
        if (Object.keys(updates.dailyReturns).length > 0) {
          const dailyReturnsData = Object.entries(updates.dailyReturns).map(([day, rate]) => ({
            config_id: id,
            day: parseInt(day),
            return_rate: rate
          }));
          await supabase.from('daily_returns').insert(dailyReturnsData);
        }
      }

      // Update daily PAC overrides if provided
      if (updates.dailyPACOverrides) {
        await supabase.from('daily_pac_overrides').delete().eq('config_id', id);
        
        if (Object.keys(updates.dailyPACOverrides).length > 0) {
          const dailyPACData = Object.entries(updates.dailyPACOverrides).map(([day, amount]) => ({
            config_id: id,
            day: parseInt(day),
            pac_amount: amount
          }));
          await supabase.from('daily_pac_overrides').insert(dailyPACData);
        }
      }

      await loadStrategies();
      return true;
    } catch (error) {
      console.error('Error updating strategy:', error);
      return false;
    }
  }, [loadStrategies]);

  const deleteStrategy = useCallback(async (id: string): Promise<boolean> => {
    try {
      // Delete related data first
      await supabase.from('daily_returns').delete().eq('config_id', id);
      await supabase.from('daily_pac_overrides').delete().eq('config_id', id);
      
      // Delete the config
      const { error } = await supabase.from('investment_configs').delete().eq('id', id);
      
      if (error) throw error;

      await loadStrategies();
      return true;
    } catch (error) {
      console.error('Error deleting strategy:', error);
      return false;
    }
  }, [loadStrategies]);

  return {
    strategies,
    loading,
    loadStrategies,
    saveStrategy,
    updateStrategy,
    deleteStrategy
  };
};