
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthValidation } from './configValidation';

export const useConfigDeleter = () => {
  const { toast } = useToast();
  const { validateUser } = useAuthValidation();

  const deleteConfiguration = async (configId: string): Promise<void> => {
    try {
      const user = await validateUser();
      if (!user) return;
      
      const { error } = await supabase
        .from('investment_configs')
        .delete()
        .eq('id', configId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Errore eliminando la configurazione:', error);
        throw error;
      }
      
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
    }
  };

  return { deleteConfiguration };
};
