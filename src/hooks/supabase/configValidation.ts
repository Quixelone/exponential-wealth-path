
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuthValidation = () => {
  const { toast } = useToast();

  const validateUser = async () => {
    console.log('🔍 [AuthValidation] Inizio validazione utente...');
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      console.log('📋 [AuthValidation] Risposta auth.getUser():', { 
        user: user ? { id: user.id, email: user.email } : null, 
        error: error ? error.message : null 
      });
      
      if (error) {
        console.error('❌ [AuthValidation] Errore nell\'ottenere l\'utente:', error);
        toast({
          title: "Errore di autenticazione",
          description: `Errore nell'ottenere i dati utente: ${error.message}`,
          variant: "destructive",
        });
        return null;
      }
      
      if (!user) {
        console.error('❌ [AuthValidation] Nessun utente trovato - non autenticato');
        toast({
          title: "Errore",
          description: "Devi essere autenticato per questa operazione",
          variant: "destructive",
        });
        return null;
      }
      
      // Verifica che l'utente abbia un profilo
      console.log('🔍 [AuthValidation] Verifico profilo per utente:', user.id);
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, email, role')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error('❌ [AuthValidation] Errore nel recuperare il profilo:', profileError);
        toast({
          title: "Errore",
          description: "Errore nel recuperare il profilo utente",
          variant: "destructive",
        });
        return null;
      }
      
      if (!profile) {
        console.error('❌ [AuthValidation] Profilo utente non trovato per ID:', user.id);
        toast({
          title: "Errore",
          description: "Profilo utente non trovato. Contatta il supporto.",
          variant: "destructive",
        });
        return null;
      }
      
      console.log('✅ [AuthValidation] Utente validato con successo:', { 
        id: user.id, 
        email: user.email,
        profile: { role: profile.role }
      });
      
      return user;
    } catch (error: any) {
      console.error('💥 [AuthValidation] Errore generale nella validazione:', error);
      toast({
        title: "Errore",
        description: "Errore generale nell'autenticazione",
        variant: "destructive",
      });
      return null;
    }
  };

  return { validateUser };
};
