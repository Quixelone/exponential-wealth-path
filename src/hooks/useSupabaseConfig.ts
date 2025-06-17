
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InvestmentConfig } from '@/types/investment';
import { DatabaseConfig, DatabaseDailyReturn, DatabaseDailyPACOverride, SavedConfiguration } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseConfig = () => {
  const [loading, setLoading] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<SavedConfiguration[]>([]);
  const { toast } = useToast();

  const saveConfiguration = useCallback(async (
    name: string,
    config: InvestmentConfig,
    dailyReturns: { [day: number]: number },
    dailyPACOverrides: { [day: number]: number } = {}
  ): Promise<string | null> => {
    try {
      setLoading(true);
      
      // Verificare che l'utente sia autenticato
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Errore",
          description: "Devi essere autenticato per salvare una configurazione",
          variant: "destructive",
        });
        return null;
      }
      
      // Salvare la configurazione principale
      const { data: configData, error: configError } = await supabase
        .from('investment_configs')
        .insert({
          name,
          user_id: user.id,
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

      if (configError) {
        console.error('Errore salvando la configurazione:', configError);
        throw configError;
      }

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

        if (returnsError) {
          console.error('Errore salvando i rendimenti:', returnsError);
          throw returnsError;
        }
      }

      // Salvare le modifiche PAC giornaliere personalizzate
      if (Object.keys(dailyPACOverrides).length > 0) {
        const dailyPACOverridesData = Object.entries(dailyPACOverrides).map(([day, pacAmount]) => ({
          config_id: configId,
          day: parseInt(day),
          pac_amount: pacAmount
        }));

        const { error: pacOverridesError } = await supabase
          .from('daily_pac_overrides')
          .insert(dailyPACOverridesData);

        if (pacOverridesError) {
          console.error('Errore salvando le modifiche PAC:', pacOverridesError);
          throw pacOverridesError;
        }
      }

      // Ricaricare le configurazioni dopo il salvataggio
      await loadConfigurations();

      toast({
        title: "Configurazione salvata",
        description: `"${name}" è stata salvata con successo`,
      });

      return configId;
    } catch (error: any) {
      console.error('Errore nel salvare la configurazione:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile salvare la configurazione",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateConfiguration = useCallback(async (
    configId: string,
    name: string,
    config: InvestmentConfig,
    dailyReturns: { [day: number]: number },
    dailyPACOverrides: { [day: number]: number } = {}
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Verificare che l'utente sia autenticato
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Errore",
          description: "Devi essere autenticato per aggiornare una configurazione",
          variant: "destructive",
        });
        return false;
      }
      
      // Aggiornare la configurazione principale
      const { error: configError } = await supabase
        .from('investment_configs')
        .update({
          name,
          initial_capital: config.initialCapital,
          time_horizon: config.timeHorizon,
          daily_return_rate: config.dailyReturnRate,
          pac_amount: config.pacConfig.amount,
          pac_frequency: config.pacConfig.frequency,
          pac_custom_days: config.pacConfig.customDays,
          pac_start_date: config.pacConfig.startDate.toISOString().split('T')[0]
        })
        .eq('id', configId)
        .eq('user_id', user.id); // Assicurarsi che l'utente possa modificare solo le proprie configurazioni

      if (configError) {
        console.error('Errore aggiornando la configurazione:', configError);
        throw configError;
      }

      // Rimuovere i vecchi rendimenti giornalieri
      const { error: deleteReturnsError } = await supabase
        .from('daily_returns')
        .delete()
        .eq('config_id', configId);

      if (deleteReturnsError) {
        console.error('Errore eliminando i vecchi rendimenti:', deleteReturnsError);
        throw deleteReturnsError;
      }

      // Rimuovere le vecchie modifiche PAC
      const { error: deletePACError } = await supabase
        .from('daily_pac_overrides')
        .delete()
        .eq('config_id', configId);

      if (deletePACError) {
        console.error('Errore eliminando le vecchie modifiche PAC:', deletePACError);
        throw deletePACError;
      }

      // Inserire i nuovi rendimenti giornalieri
      if (Object.keys(dailyReturns).length > 0) {
        const dailyReturnsData = Object.entries(dailyReturns).map(([day, returnRate]) => ({
          config_id: configId,
          day: parseInt(day),
          return_rate: returnRate
        }));

        const { error: returnsError } = await supabase
          .from('daily_returns')
          .insert(dailyReturnsData);

        if (returnsError) {
          console.error('Errore inserendo i nuovi rendimenti:', returnsError);
          throw returnsError;
        }
      }

      // Inserire le nuove modifiche PAC
      if (Object.keys(dailyPACOverrides).length > 0) {
        const dailyPACOverridesData = Object.entries(dailyPACOverrides).map(([day, pacAmount]) => ({
          config_id: configId,
          day: parseInt(day),
          pac_amount: pacAmount
        }));

        const { error: pacOverridesError } = await supabase
          .from('daily_pac_overrides')
          .insert(dailyPACOverridesData);

        if (pacOverridesError) {
          console.error('Errore inserendo le nuove modifiche PAC:', pacOverridesError);
          throw pacOverridesError;
        }
      }

      // Ricaricare le configurazioni dopo l'aggiornamento
      await loadConfigurations();

      toast({
        title: "Configurazione aggiornata",
        description: `"${name}" è stata aggiornata con successo`,
      });

      return true;
    } catch (error: any) {
      console.error('Errore nell\'aggiornare la configurazione:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile aggiornare la configurazione",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadConfigurations = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Verificare che l'utente sia autenticato
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Utente non autenticato, non carico le configurazioni');
        setSavedConfigs([]);
        return;
      }
      
      console.log('Caricamento configurazioni per utente:', user.id);
      
      const { data: configs, error: configError } = await supabase
        .from('investment_configs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (configError) {
        console.error('Errore caricando le configurazioni:', configError);
        throw configError;
      }

      console.log('Configurazioni caricate:', configs?.length || 0);

      const savedConfigurations: SavedConfiguration[] = [];

      for (const dbConfig of configs || []) {
        // Caricare i rendimenti giornalieri per questa configurazione
        const { data: dailyReturns, error: returnsError } = await supabase
          .from('daily_returns')
          .select('*')
          .eq('config_id', dbConfig.id);

        if (returnsError) {
          console.error('Errore caricando i rendimenti per config:', dbConfig.id, returnsError);
          throw returnsError;
        }

        // Caricare le modifiche PAC giornaliere per questa configurazione
        const { data: dailyPACOverrides, error: pacOverridesError } = await supabase
          .from('daily_pac_overrides')
          .select('*')
          .eq('config_id', dbConfig.id);

        if (pacOverridesError) {
          console.error('Errore caricando le modifiche PAC per config:', dbConfig.id, pacOverridesError);
          throw pacOverridesError;
        }

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
        (dailyReturns || []).forEach(dr => {
          dailyReturnsMap[dr.day] = dr.return_rate;
        });

        const dailyPACOverridesMap: { [day: number]: number } = {};
        (dailyPACOverrides || []).forEach(po => {
          dailyPACOverridesMap[po.day] = po.pac_amount;
        });

        savedConfigurations.push({
          id: dbConfig.id,
          name: dbConfig.name,
          config,
          dailyReturns: dailyReturnsMap,
          dailyPACOverrides: dailyPACOverridesMap,
          created_at: dbConfig.created_at,
          updated_at: dbConfig.updated_at
        });
      }

      setSavedConfigs(savedConfigurations);
      console.log('Configurazioni salvate nello stato:', savedConfigurations.length);
    } catch (error: any) {
      console.error('Errore nel caricare le configurazioni:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile caricare le configurazioni salvate",
        variant: "destructive",
      });
      setSavedConfigs([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteConfiguration = useCallback(async (configId: string): Promise<void> => {
    try {
      setLoading(true);
      
      // Verificare che l'utente sia autenticato
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Errore",
          description: "Devi essere autenticato per eliminare una configurazione",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('investment_configs')
        .delete()
        .eq('id', configId)
        .eq('user_id', user.id); // Assicurarsi che l'utente possa eliminare solo le proprie configurazioni

      if (error) {
        console.error('Errore eliminando la configurazione:', error);
        throw error;
      }

      setSavedConfigs(prev => prev.filter(config => config.id !== configId));
      
      toast({
        title: "Configurazione eliminata",
        description: "La configurazione è stata eliminata con successo",
      });
    } catch (error: any) {
      console.error('Errore nell\'eliminare la configurazione:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile eliminare la configurazione",
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
    updateConfiguration,
    loadConfigurations,
    deleteConfiguration
  };
};
