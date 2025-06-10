
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InvestmentConfig } from '@/types/investment';
import { DatabaseConfig, DatabaseDailyReturn, SavedConfiguration } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseConfig = () => {
  const [loading, setLoading] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<SavedConfiguration[]>([]);
  const { toast } = useToast();

  const saveConfiguration = useCallback(async (
    name: string,
    config: InvestmentConfig,
    dailyReturns: { [day: number]: number }
  ): Promise<string | null> => {
    try {
      setLoading(true);
      
      // Salvare la configurazione principale
      const { data: configData, error: configError } = await supabase
        .from('investment_configs')
        .insert({
          name,
          initial_capital: config.initialCapital,
          time_horizon: config.timeHorizon,
          daily_return_rate: config.dailyReturnRate,
          pac_amount: config.pacConfig.amount,
          pac_frequency: config.pacConfig.frequency,
          pac_custom_days: config.pacConfig.customDays,
          pac_start_date: config.pacConfig.startDate.toISOString().split('T')[0]
        })
        .select()
        .single();

      if (configError) throw configError;

      const configId = configData.id;

      // Salvare i rendimenti giornalieri personalizzati
      if (Object.keys(dailyReturns).length > 0) {
        const dailyReturnsData = Object.entries(dailyReturns).map(([day, returnRate]) => ({
          config_id: configId,
          day: parseInt(day),
          return_rate: returnRate
        }));

        const { error: returnsError } = await supabase
          .from('daily_returns')
          .insert(dailyReturnsData);

        if (returnsError) throw returnsError;
      }

      toast({
        title: "Configurazione salvata",
        description: `"${name}" è stata salvata con successo`,
      });

      return configId;
    } catch (error) {
      console.error('Errore nel salvare la configurazione:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare la configurazione",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadConfigurations = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      
      const { data: configs, error: configError } = await supabase
        .from('investment_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (configError) throw configError;

      const savedConfigurations: SavedConfiguration[] = [];

      for (const dbConfig of configs) {
        // Caricare i rendimenti giornalieri per questa configurazione
        const { data: dailyReturns, error: returnsError } = await supabase
          .from('daily_returns')
          .select('*')
          .eq('config_id', dbConfig.id);

        if (returnsError) throw returnsError;

        // Convertire i dati del database nel formato dell'applicazione
        const config: InvestmentConfig = {
          initialCapital: dbConfig.initial_capital,
          timeHorizon: dbConfig.time_horizon,
          dailyReturnRate: dbConfig.daily_return_rate,
          pacConfig: {
            amount: dbConfig.pac_amount,
            frequency: dbConfig.pac_frequency as 'daily' | 'weekly' | 'monthly' | 'custom',
            customDays: dbConfig.pac_custom_days,
            startDate: new Date(dbConfig.pac_start_date)
          }
        };

        const dailyReturnsMap: { [day: number]: number } = {};
        dailyReturns.forEach(dr => {
          dailyReturnsMap[dr.day] = dr.return_rate;
        });

        savedConfigurations.push({
          id: dbConfig.id,
          name: dbConfig.name,
          config,
          dailyReturns: dailyReturnsMap,
          created_at: dbConfig.created_at,
          updated_at: dbConfig.updated_at
        });
      }

      setSavedConfigs(savedConfigurations);
    } catch (error) {
      console.error('Errore nel caricare le configurazioni:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le configurazioni salvate",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteConfiguration = useCallback(async (configId: string): Promise<void> => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('investment_configs')
        .delete()
        .eq('id', configId);

      if (error) throw error;

      setSavedConfigs(prev => prev.filter(config => config.id !== configId));
      
      toast({
        title: "Configurazione eliminata",
        description: "La configurazione è stata eliminata con successo",
      });
    } catch (error) {
      console.error('Errore nell\'eliminare la configurazione:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare la configurazione",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    savedConfigs,
    saveConfiguration,
    loadConfigurations,
    deleteConfiguration
  };
};
