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
  const [profileLoading, setProfileLoading] = useState(false);
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async (userId: string) => {
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
        console.log('Profile loaded:', profile);
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
      console.error('Unexpected error fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  }, [user?.email]);

  const updateUserLogin = useCallback(async (userId: string) => {
    try {
      const { error } = await supabase.rpc('update_user_login', {
        user_uuid: userId
      });
      
      if (error) {
        console.error('Error updating user login:', error);
      } else {
        console.log('User login updated successfully');
      }
    } catch (error) {
      console.error('Unexpected error updating login:', error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let profileFetched = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        // Only fetch profile once per session to avoid multiple calls
        if (session?.user && !profileFetched) {
          profileFetched = true;
          setTimeout(async () => {
            if (mounted) {
              await fetchUserProfile(session.user.id);
              if (event === 'SIGNED_IN') {
                await updateUserLogin(session.user.id);
              }
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          profileFetched = false;
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

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
          
          if (session?.user && !profileFetched) {
            profileFetched = true;
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
  }, [fetchUserProfile, updateUserLogin]);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string, phone?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const userData: any = {
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      };

      if (firstName || lastName || phone) {
        userData.options.data = {
          first_name: firstName,
          last_name: lastName,
          phone: phone
        };
      }

      const { error } = await supabase.auth.signUp(userData);

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

  return {
    user,
    session,
    userProfile,
    loading: loading || profileLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    resetPassword,
    signOut,
    isAdmin: userProfile?.role === 'admin'
  };
};
