
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string | null;
  role: 'admin' | 'user';
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      setProfileLoading(true);
      console.log('Fetching user profile for:', userId);
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        // Se il profilo non esiste, creane uno di default
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating default profile');
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: userId,
              email: user?.email || null,
              role: 'user'
            })
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating profile:', createError);
            return;
          }
          
          if (newProfile) {
            setUserProfile({
              id: newProfile.id,
              email: newProfile.email,
              role: newProfile.role as 'admin' | 'user'
            });
          }
        }
        return;
      }
      
      if (profile) {
        console.log('Profile loaded:', profile);
        setUserProfile({
          id: profile.id,
          email: profile.email,
          role: profile.role as 'admin' | 'user'
        });
      }
    } catch (error: any) {
      console.error('Unexpected error fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          await fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: "Utente già registrato",
            description: "Prova ad effettuare il login invece",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Errore nella registrazione",
            description: error.message,
            variant: "destructive",
          });
        }
        return { error };
      }

      toast({
        title: "Registrazione completata",
        description: "Controlla la tua email per confermare l'account",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: "Errore nel login",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      console.log('Sign in successful:', data.user?.id);
      
      toast({
        title: "Login effettuato",
        description: "Benvenuto!",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Unexpected sign in error:', error);
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Errore nel logout",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logout effettuato",
        description: "Arrivederci!",
      });
    }
  };

  return {
    user,
    session,
    userProfile,
    loading: loading || profileLoading,
    signUp,
    signIn,
    signOut,
    isAdmin: userProfile?.role === 'admin'
  };
};
