/**
 * Configuration Loader Hook
 * 
 * Gestisce il caricamento delle configurazioni salvate dal database Supabase.
 * Carica sia la configurazione principale che i dati associati:
 * - Daily returns (rendimenti giornalieri personalizzati)
 * - Daily PAC overrides (modifiche PAC per giorno specifico)
 * 
 * @module hooks/supabase/configLoader
 */

import { supabase } from '@/integrations/supabase/client';
import { InvestmentConfig } from '@/types/investment';
import { SavedConfiguration } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useAuthValidation } from './configValidation';
import { Currency } from '@/lib/utils';

export const useConfigLoader = () => {
  const { toast } = useToast();
  const { validateUser } = useAuthValidation();

  /**
   * Carica tutte le configurazioni salvate dell'utente corrente
   * 
   * @returns Array di configurazioni salvate ordinate per data di creazione (più recenti prime)
   */
  const loadConfigurations = async (): Promise<SavedConfiguration[]> => {
    try {
      const user = await validateUser();
      if (!user) return [];
      
      // Carica le configurazioni principali
      const { data: configs, error: configError } = await supabase
        .from('investment_configs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (configError) throw configError;

      const savedConfigurations: SavedConfiguration[] = [];

      // Per ogni configurazione, carica anche i dati associati
      for (const dbConfig of configs || []) {
        // Carica i rendimenti giornalieri
        const { data: dailyReturns, error: returnsError } = await supabase
          .from('daily_returns')
          .select('*')
          .eq('config_id', dbConfig.id);

        if (returnsError) throw returnsError;

        // Carica gli override PAC giornalieri
        const { data: dailyPACOverrides, error: pacOverridesError } = await supabase
          .from('daily_pac_overrides')
          .select('*')
          .eq('config_id', dbConfig.id);

        if (pacOverridesError) throw pacOverridesError;

        // Converte i dati del database in formato applicazione
        const config: InvestmentConfig = {
          initialCapital: dbConfig.initial_capital,
          timeHorizon: dbConfig.time_horizon,
          dailyReturnRate: dbConfig.daily_return_rate,
          currency: (dbConfig.currency as Currency) || 'EUR',
          pacConfig: {
            amount: dbConfig.pac_amount,
            frequency: dbConfig.pac_frequency as 'daily' | 'weekly' | 'monthly' | 'custom',
            customDays: dbConfig.pac_custom_days,
            startDate: new Date(dbConfig.pac_start_date)
          }
        };

        // Converte gli array in mappe per accesso rapido
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
          updated_at: dbConfig.updated_at,
          is_insured: dbConfig.is_insured || false
        });
      }
      
      return savedConfigurations;
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile caricare le configurazioni salvate",
        variant: "destructive",
      });
      return [];
    }
  };

  return { loadConfigurations };
};
