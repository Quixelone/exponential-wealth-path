import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string | null;
  role: 'admin' | 'user';
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  google_id: string | null;
  last_login: string | null;
  login_count: number | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('🔍 Fetching user profile for:', userId);
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('❌ Error fetching profile:', error);
        if (error.code === 'PGRST116') {
          console.log('📝 Profile not found, creating default profile');
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
            console.error('❌ Error creating profile:', createError);
            return;
          }
          
          if (newProfile) {
            console.log('✅ New profile created:', newProfile);
            setUserProfile({
              id: newProfile.id,
              email: newProfile.email,
              role: newProfile.role as 'admin' | 'user',
              first_name: newProfile.first_name,
              last_name: newProfile.last_name,
              phone: newProfile.phone,
              avatar_url: newProfile.avatar_url,
              google_id: newProfile.google_id,
              last_login: newProfile.last_login,
              login_count: newProfile.login_count
            });
          }
        }
        return;
      }
      
      if (profile) {
        console.log('✅ Profile loaded successfully:', profile);
        console.log('👤 User role:', profile.role);
        setUserProfile({
          id: profile.id,
          email: profile.email,
          role: profile.role as 'admin' | 'user',
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
          google_id: profile.google_id,
          last_login: profile.last_login,
          login_count: profile.login_count
        });
      }
    } catch (error: any) {
      console.error('💥 Unexpected error fetching profile:', error);
    }
  }, [user?.email]);

  const updateUserLogin = useCallback(async (userId: string) => {
    try {
      const { error } = await supabase.rpc('update_user_login', {
        user_uuid: userId
      });
      
      if (error) {
        console.error('❌ Error updating user login:', error);
      } else {
        console.log('✅ User login updated successfully');
      }
    } catch (error) {
      console.error('💥 Unexpected error updating login:', error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    console.log('🚀 Initializing auth...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, 'User ID:', session?.user?.id);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 User authenticated, fetching profile...');
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(async () => {
            if (mounted) {
              await fetchUserProfile(session.user.id);
              if (event === 'SIGNED_IN') {
                await updateUserLogin(session.user.id);
              }
            }
          }, 0);
        } else {
          console.log('🚪 User signed out, clearing profile');
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    const initializeAuth = async () => {
      try {
        console.log('🔄 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          return;
        }

        if (mounted) {
          console.log('📋 Initial session:', session?.user?.id ? 'Found' : 'Not found');
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('💥 Error initializing auth:', error);
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
  }, [fetchUserProfile, updateUserLogin]);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string, phone?: string) => {
    try {
      console.log('🚀 Starting registration process for:', email);
      
      const userData: any = {
        email,
        password,
       options: {}
      };

      if (firstName || lastName || phone) {
        userData.options.data = {
          first_name: firstName,
          last_name: lastName,
          phone: phone
        };
        console.log('👤 User metadata:', userData.options.data);
      }

      console.log('📤 Sending signup request to Supabase...');
      const { data, error } = await supabase.auth.signUp(userData);

      if (error) {
        console.error('❌ Signup error:', error);
        
        let errorMessage = error.message;
        let errorTitle = "Errore nella registrazione";
        
        if (error.message.includes('User already registered')) {
          errorTitle = "Utente già registrato";
          errorMessage = "Questo email è già registrato. Prova ad effettuare il login invece.";
        } else if (error.message.includes('Invalid email')) {
          errorTitle = "Email non valida";
          errorMessage = "Inserisci un indirizzo email valido.";
        } else if (error.message.includes('Password')) {
          errorTitle = "Password non valida";
          errorMessage = "La password deve essere di almeno 6 caratteri.";
        } else if (error.message.includes('signup is disabled')) {
          errorTitle = "Registrazione disabilitata";
          errorMessage = "La registrazione è temporaneamente disabilitata. Riprova più tardi.";
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
        return { error };
      }

      console.log('✅ Signup successful:', data);
      
     if (data.session) {
        console.log('🔐 User automatically signed in');
        toast({
          title: "Registrazione completata",
          description: "Benvenuto! Il tuo account è stato creato con successo.",
        });
     } else {
       console.log('👤 User created but not signed in');
       toast({
         title: "Registrazione completata",
         description: "Account creato. Puoi effettuare il login.",
       });
      }

      return { error: null };
    } catch (error: any) {
      console.error('💥 Unexpected signup error:', error);
      toast({
        title: "Errore di rete",
        description: "Problema di connessione. Riprova tra qualche momento.",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting to sign in with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        toast({
          title: "Errore nel login",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      console.log('✅ Sign in successful:', data.user?.id);
      
      toast({
        title: "Login effettuato",
        description: "Benvenuto!",
      });

      return { error: null };
    } catch (error: any) {
      console.error('💥 Unexpected sign in error:', error);
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) {
        toast({
          title: "Errore login Google",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

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

  const signInWithFacebook = async () => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) {
        toast({
          title: "Errore login Facebook",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

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

  const signInWithTwitter = async () => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) {
        toast({
          title: "Errore login Twitter",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

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

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) {
        toast({
          title: "Errore reset password",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

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

  // Calcola isAdmin in modo più semplice e diretto
  const isAdmin = userProfile?.role === 'admin';
  
  console.log('🔍 Current auth state:', {
    userExists: !!user,
    userProfileExists: !!userProfile,
    userRole: userProfile?.role,
    isAdmin,
    loading
  });

  return {
    user,
    session,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    resetPassword,
    signOut,
    isAdmin
  };
};
