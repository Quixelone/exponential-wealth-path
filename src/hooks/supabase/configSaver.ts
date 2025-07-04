
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
      console.log('🔄 Inizio salvataggio configurazione:', name);
      
      const user = await validateUser();
      if (!user) {
        console.error('❌ Utente non validato');
        return null;
      }
      
      console.log('✅ Utente validato:', user.id);
      
      // Save main configuration
      const { data: configData, error: configError } = await supabase
        .from('investment_configs')
        .insert({
          name,
          user_id: user.id,
          initial_capital: config.initialCapital,
          time_horizon: config.timeHorizon,
          daily_return_rate: config.dailyReturnRate,
          currency: config.currency || 'EUR',
          pac_amount: config.pacConfig.amount,
          pac_frequency: config.pacConfig.frequency,
          pac_custom_days: config.pacConfig.customDays,
          pac_start_date: (config.pacConfig.startDate instanceof Date 
            ? config.pacConfig.startDate 
            : new Date(config.pacConfig.startDate)).toISOString().split('T')[0]
        })
        .select()
        .single();

      if (configError) {
        console.error('❌ Errore salvando la configurazione:', configError);
        throw configError;
      }

      const configId = configData.id;
      console.log('✅ Configurazione salvata con ID:', configId);

      // Save daily returns
      if (Object.keys(dailyReturns).length > 0) {
        console.log('💾 Salvataggio daily returns:', Object.keys(dailyReturns).length, 'elementi');
        const dailyReturnsData = Object.entries(dailyReturns).map(([day, returnRate]) => ({
          config_id: configId,
          day: parseInt(day),
          return_rate: returnRate
        }));

        const { error: returnsError } = await supabase
          .from('daily_returns')
          .insert(dailyReturnsData);

        if (returnsError) {
          console.error('❌ Errore salvando i rendimenti:', returnsError);
          throw returnsError;
        }
        console.log('✅ Daily returns salvati con successo');
      }

      // Save daily PAC overrides - LOGGING DETTAGLIATO
      if (Object.keys(dailyPACOverrides).length > 0) {
        console.log('💾 Salvataggio daily PAC overrides:', Object.keys(dailyPACOverrides).length, 'elementi');
        console.log('📊 Dati PAC da salvare:', dailyPACOverrides);
        
        const dailyPACOverridesData = Object.entries(dailyPACOverrides).map(([day, pacAmount]) => ({
          config_id: configId,
          day: parseInt(day),
          pac_amount: pacAmount
        }));

        console.log('📝 Dati preparati per inserimento:', dailyPACOverridesData);

        const { data: insertedData, error: pacOverridesError } = await supabase
          .from('daily_pac_overrides')
          .insert(dailyPACOverridesData)
          .select();

        if (pacOverridesError) {
          console.error('❌ Errore salvando le modifiche PAC:', pacOverridesError);
          console.error('❌ Dettagli errore:', JSON.stringify(pacOverridesError, null, 2));
          throw pacOverridesError;
        }
        
        console.log('✅ Daily PAC overrides salvati con successo:', insertedData);
      } else {
        console.log('ℹ️ Nessun PAC override da salvare');
      }

      toast({
        title: "Configurazione salvata",
        description: `"${name}" è stata salvata con successo`,
      });

      console.log('🎉 Salvataggio completato con successo per config ID:', configId);
      return configId;
    } catch (error: any) {
      console.error('💥 Errore generale nel salvare la configurazione:', error);
      console.error('💥 Stack trace:', error.stack);
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
