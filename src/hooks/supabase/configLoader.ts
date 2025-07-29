
import { supabase } from '@/integrations/supabase/client';
import { InvestmentConfig } from '@/types/investment';
import { SavedConfiguration } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useAuthValidation } from './configValidation';
import { Currency } from '@/lib/utils';

export const useConfigLoader = () => {
  const { toast } = useToast();
  const { validateUser } = useAuthValidation();

  const loadConfigurations = async (): Promise<SavedConfiguration[]> => {
    try {
      const user = await validateUser();
      if (!user) {
        return [];
      }
      
      const { data: configs, error: configError } = await supabase
        .from('investment_configs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (configError) {
        console.error('Errore caricando le configurazioni:', configError);
        throw configError;
      }

      const savedConfigurations: SavedConfiguration[] = [];

      for (const dbConfig of configs || []) {
        // Load daily returns
        const { data: dailyReturns, error: returnsError } = await supabase
          .from('daily_returns')
          .select('*')
          .eq('config_id', dbConfig.id);

        if (returnsError) {
          console.error('Errore caricando i rendimenti per config:', dbConfig.id, returnsError);
          throw returnsError;
        }

        // Load daily PAC overrides
        const { data: dailyPACOverrides, error: pacOverridesError } = await supabase
          .from('daily_pac_overrides')
          .select('*')
          .eq('config_id', dbConfig.id);

        if (pacOverridesError) {
          console.error('Errore caricando le modifiche PAC per config:', dbConfig.id, pacOverridesError);
          throw pacOverridesError;
        }

        // Convert database data to application format
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
      
      return savedConfigurations;
    } catch (error: any) {
      console.error('Errore nel caricare le configurazioni:', error);
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
