
import { supabase } from '@/integrations/supabase/client';
import { InvestmentConfig } from '@/types/investment';
import { useToast } from '@/hooks/use-toast';
import { useAuthValidation } from './configValidation';

export const useConfigUpdater = () => {
  const { toast } = useToast();
  const { validateUser } = useAuthValidation();

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
      
      // Update main configuration
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

      if (configError) {
        console.error('Errore aggiornando la configurazione:', configError);
        throw configError;
      }

      // Remove old daily returns
      const { error: deleteReturnsError } = await supabase
        .from('daily_returns')
        .delete()
        .eq('config_id', configId);

      if (deleteReturnsError) {
        console.error('Errore eliminando i vecchi rendimenti:', deleteReturnsError);
        throw deleteReturnsError;
      }

      // Remove old PAC overrides
      const { error: deletePACError } = await supabase
        .from('daily_pac_overrides')
        .delete()
        .eq('config_id', configId);

      if (deletePACError) {
        console.error('Errore eliminando le vecchie modifiche PAC:', deletePACError);
        throw deletePACError;
      }

      // Insert new daily returns
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

      // Insert new PAC overrides
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
    }
  };

  return { updateConfiguration };
};
