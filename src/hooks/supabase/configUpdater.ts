
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
      console.log('🔄 Inizio aggiornamento configurazione:', { configId, name, dailyPACOverrides });
      
      const user = await validateUser();
      if (!user) {
        console.error('❌ Utente non validato per aggiornamento');
        return false;
      }
      
      console.log('✅ Utente validato per aggiornamento:', user.id);
      
      // Update main configuration
      const { error: configError } = await supabase
        .from('investment_configs')
        .update({
          name,
          initial_capital: config.initialCapital,
          time_horizon: config.timeHorizon,
          daily_return_rate: config.dailyReturnRate,
          currency: config.currency,
          pac_amount: config.pacConfig.amount,
          pac_frequency: config.pacConfig.frequency,
          pac_custom_days: config.pacConfig.customDays,
          pac_start_date: config.pacConfig.startDate.toISOString().split('T')[0]
        })
        .eq('id', configId)
        .eq('user_id', user.id);

      if (configError) {
        console.error('❌ Errore aggiornando la configurazione:', configError);
        throw configError;
      }
      console.log('✅ Configurazione principale aggiornata');

      // Remove old daily returns
      console.log('🗑️ Rimozione vecchi daily returns...');
      const { error: deleteReturnsError } = await supabase
        .from('daily_returns')
        .delete()
        .eq('config_id', configId);

      if (deleteReturnsError) {
        console.error('❌ Errore eliminando i vecchi rendimenti:', deleteReturnsError);
        throw deleteReturnsError;
      }
      console.log('✅ Vecchi daily returns rimossi');

      // Remove old PAC overrides
      console.log('🗑️ Rimozione vecchi PAC overrides...');
      const { error: deletePACError } = await supabase
        .from('daily_pac_overrides')
        .delete()
        .eq('config_id', configId);

      if (deletePACError) {
        console.error('❌ Errore eliminando le vecchie modifiche PAC:', deletePACError);
        throw deletePACError;
      }
      console.log('✅ Vecchi PAC overrides rimossi');

      // Insert new daily returns
      if (Object.keys(dailyReturns).length > 0) {
        console.log('💾 Inserimento nuovi daily returns:', Object.keys(dailyReturns).length, 'elementi');
        const dailyReturnsData = Object.entries(dailyReturns).map(([day, returnRate]) => ({
          config_id: configId,
          day: parseInt(day),
          return_rate: returnRate
        }));

        const { error: returnsError } = await supabase
          .from('daily_returns')
          .insert(dailyReturnsData);

        if (returnsError) {
          console.error('❌ Errore inserendo i nuovi rendimenti:', returnsError);
          throw returnsError;
        }
        console.log('✅ Nuovi daily returns inseriti');
      }

      // Insert new PAC overrides - LOGGING DETTAGLIATO
      if (Object.keys(dailyPACOverrides).length > 0) {
        console.log('💾 Inserimento nuovi PAC overrides:', Object.keys(dailyPACOverrides).length, 'elementi');
        console.log('📊 Dati PAC da aggiornare:', dailyPACOverrides);
        
        const dailyPACOverridesData = Object.entries(dailyPACOverrides).map(([day, pacAmount]) => ({
          config_id: configId,
          day: parseInt(day),
          pac_amount: pacAmount
        }));

        console.log('📝 Dati preparati per aggiornamento:', dailyPACOverridesData);

        const { data: insertedData, error: pacOverridesError } = await supabase
          .from('daily_pac_overrides')
          .insert(dailyPACOverridesData)
          .select();

        if (pacOverridesError) {
          console.error('❌ Errore inserendo le nuove modifiche PAC:', pacOverridesError);
          console.error('❌ Dettagli errore PAC:', JSON.stringify(pacOverridesError, null, 2));
          throw pacOverridesError;
        }
        
        console.log('✅ Nuovi PAC overrides inseriti con successo:', insertedData);
      } else {
        console.log('ℹ️ Nessun nuovo PAC override da inserire');
      }

      toast({
        title: "Configurazione aggiornata",
        description: `"${name}" è stata aggiornata con successo`,
      });

      console.log('🎉 Aggiornamento completato con successo per config ID:', configId);
      return true;
    } catch (error: any) {
      console.error('💥 Errore generale nell\'aggiornare la configurazione:', error);
      console.error('💥 Stack trace:', error.stack);
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
