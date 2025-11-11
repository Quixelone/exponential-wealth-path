/**
 * Configuration Updater Hook
 * 
 * Gestisce l'aggiornamento delle configurazioni di investimento esistenti.
 * Utilizza una strategia di delete-insert per i dati dipendenti:
 * 1. Aggiorna la configurazione principale
 * 2. Elimina vecchi rendimenti e PAC override
 * 3. Inserisce i nuovi dati
 * 
 * @module hooks/supabase/configUpdater
 */

import { supabase } from '@/integrations/supabase/client';
import { InvestmentConfig } from '@/types/investment';
import { useToast } from '@/hooks/use-toast';
import { useAuthValidation } from './configValidation';

export const useConfigUpdater = () => {
  const { toast } = useToast();
  const { validateUser } = useAuthValidation();

  /**
   * Aggiorna una configurazione esistente
   * 
   * @param configId - ID della configurazione da aggiornare
   * @param name - Nuovo nome della configurazione
   * @param config - Nuova configurazione investimento
   * @param dailyReturns - Nuovi rendimenti giornalieri
   * @param dailyPACOverrides - Nuovi override PAC giornalieri
   * @returns true se l'aggiornamento ha successo, false altrimenti
   */
  const updateConfiguration = async (
    configId: string,
    name: string,
    config: InvestmentConfig,
    dailyReturns: { [day: number]: number },
    dailyPACOverrides: { [day: number]: number } = {}
  ): Promise<boolean> => {
    try {
      const user = await validateUser();
      if (!user) return false;
      
      // Aggiorna la configurazione principale
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
        .eq('user_id', user.id);

      if (configError) throw configError;

      // Rimuovi vecchi rendimenti giornalieri
      const { error: deleteReturnsError } = await supabase
        .from('daily_returns')
        .delete()
        .eq('config_id', configId);

      if (deleteReturnsError) throw deleteReturnsError;

      // Rimuovi vecchi override PAC
      const { error: deletePACError } = await supabase
        .from('daily_pac_overrides')
        .delete()
        .eq('config_id', configId);

      if (deletePACError) throw deletePACError;

      // Inserisci nuovi rendimenti giornalieri
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

      // Inserisci nuovi override PAC
      if (Object.keys(dailyPACOverrides).length > 0) {
        const dailyPACOverridesData = Object.entries(dailyPACOverrides).map(([day, pacAmount]) => ({
          config_id: configId,
          day: parseInt(day),
          pac_amount: pacAmount
        }));

        const { error: pacOverridesError } = await supabase
          .from('daily_pac_overrides')
          .insert(dailyPACOverridesData);

        if (pacOverridesError) throw pacOverridesError;
      }

      toast({
        title: "Configurazione aggiornata",
        description: `"${name}" è stata aggiornata con successo`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile aggiornare la configurazione",
        variant: "destructive",
      });
      return false;
    }
  };

  return { updateConfiguration };
};
