/**
 * Configuration Saver Hook
 * 
 * Gestisce il salvataggio delle configurazioni di investimento nel database Supabase.
 * Include il salvataggio di:
 * - Configurazione principale (capitale iniziale, orizzonte temporale, tasso di rendimento)
 * - Rendimenti giornalieri personalizzati
 * - Override PAC giornalieri
 * 
 * @module hooks/supabase/configSaver
 */

import { supabase } from '@/integrations/supabase/client';
import { InvestmentConfig } from '@/types/investment';
import { useToast } from '@/hooks/use-toast';
import { useAuthValidation } from './configValidation';

export const useConfigSaver = () => {
  const { toast } = useToast();
  const { validateUser } = useAuthValidation();

  /**
   * Salva una nuova configurazione di investimento nel database
   * 
   * @param name - Nome della configurazione
   * @param config - Oggetto configurazione investimento
   * @param dailyReturns - Mappa dei rendimenti giornalieri personalizzati
   * @param dailyPACOverrides - Mappa degli override PAC giornalieri
   * @returns ID della configurazione salvata o null in caso di errore
   */
  const saveConfiguration = async (
    name: string,
    config: InvestmentConfig,
    dailyReturns: { [day: number]: number },
    dailyPACOverrides: { [day: number]: number } = {}
  ): Promise<string | null> => {
    try {
      const user = await validateUser();
      if (!user) return null;
      
      // Prepara la data di inizio PAC nel formato corretto
      const pacStartDate = (() => {
        if (typeof config.pacConfig.startDate === 'string') {
          return config.pacConfig.startDate;
        }
        if (config.pacConfig.startDate instanceof Date) {
          return config.pacConfig.startDate.toISOString().split('T')[0];
        }
        return new Date().toISOString().split('T')[0];
      })();
      
      // Salva la configurazione principale
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
          pac_start_date: pacStartDate,
          currency: config.currency || 'EUR'
        })
        .select()
        .single();

      if (configError) throw configError;

      const configId = configData.id;

      // Salva i rendimenti giornalieri personalizzati
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

      // Salva gli override PAC giornalieri
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
        title: "Configurazione salvata",
        description: `"${name}" è stata salvata con successo`,
      });

      return configId;
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile salvare la configurazione",
        variant: "destructive",
      });
      return null;
    }
  };

  return { saveConfiguration };
};
