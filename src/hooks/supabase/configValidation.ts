
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuthValidation = () => {
  const { toast } = useToast();

  const validateUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato per questa operazione",
        variant: "destructive",
      });
      return null;
    }
    return user;
  };

  return { validateUser };
};
