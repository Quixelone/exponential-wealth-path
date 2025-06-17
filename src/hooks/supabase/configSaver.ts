
import { supabase } from '@/integrations/supabase/client';
import { InvestmentConfig } from '@/types/investment';
import { useToast } from '@/hooks/use-toast';
import { useAuthValidation } from './configValidation';

export const useConfigSaver = () => {
  const { toast } = useToast();
  const { validateUser } = useAuthValidation();

  const saveConfiguration = async (
    name: string,
    config: InvestmentConfig,
    dailyReturns: { [day: number]: number },
    dailyPACOverrides: { [day: number]: number } = {}
  ): Promise<string | null> => {
    try {
      const user = await validateUser();
      if (!user) return null;
      
      // Save main configuration
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

      // Save daily returns
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

      // Save daily PAC overrides
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
    }
  };

  return { saveConfiguration };
};
