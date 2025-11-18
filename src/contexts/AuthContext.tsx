import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRoles } from '@/hooks/useUserRoles';

interface UserProfile {
  id: string;
  email: string | null;
  role: 'admin' | 'user';
  admin_role?: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  google_id: string | null;
  last_login: string | null;
  login_count: number | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  subscriptionStatus: {
    subscribed: boolean;
    subscription_end: string | null;
  } | null;
  checkSubscriptionStatus: () => Promise<void>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string, phone?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithFacebook: () => Promise<{ error: any }>;
  signInWithTwitter: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    subscribed: boolean;
    subscription_end: string | null;
  } | null>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [lastSubscriptionCheck, setLastSubscriptionCheck] = useState<number>(0);
  const { toast } = useToast();
  
  // Use the new user_roles system for admin checks
  const { isAdmin: isAdminFromRoles, loading: rolesLoading } = useUserRoles(user?.id);

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
              email: user?.email || null
            })
            .select()
            .single();
          
          if (createError) {
            console.error('❌ Error creating profile:', createError);
            return;
          }

          // Create default user role
          if (newProfile) {
            await supabase
              .from('user_roles')
              .insert({
                user_id: newProfile.id,
                role: 'user'
              });
          }
          
          if (newProfile) {
            console.log('✅ New profile created:', newProfile);
            setUserProfile({
              id: newProfile.id,
              email: newProfile.email,
              role: 'user',
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

  const checkSubscriptionStatus = useCallback(async () => {
    if (!session?.access_token || isCheckingSubscription) return;
    
    // Throttle: evita chiamate più frequenti di 3 minuti
    const now = Date.now();
    const timeSinceLastCheck = now - lastSubscriptionCheck;
    const THROTTLE_TIME = 3 * 60 * 1000; // 3 minuti
    
    if (timeSinceLastCheck < THROTTLE_TIME) {
      console.log('⏱️ Subscription check throttled. Last check:', timeSinceLastCheck / 1000, 'seconds ago');
      return;
    }
    
    setIsCheckingSubscription(true);
    setLastSubscriptionCheck(now);
    
    try {
      console.log('🔍 Checking subscription status...');
      
      // Refresh session to ensure we have a valid token
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.getSession();
      
      if (refreshError || !refreshedSession) {
        console.log('ℹ️ No valid session, skipping subscription check');
        setSubscriptionStatus({ subscribed: false, subscription_end: null });
        setIsCheckingSubscription(false);
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('check-subscription-status', {
        headers: {
          Authorization: `Bearer ${refreshedSession.access_token}`
        }
      });
      
      if (error) {
        // Silently handle 401 errors (user not authenticated or token expired)
        if (error.message?.includes('401') || error.message?.includes('JWT')) {
          console.log('ℹ️ Subscription check skipped (not authenticated)');
          return;
        }
        console.error('❌ Error checking subscription:', error);
        return;
      }
      
      if (data) {
        console.log('✅ Subscription status:', data);
        setSubscriptionStatus(data);
      }
    } catch (error: any) {
      // Silently handle authentication errors
      if (error?.message?.includes('401') || error?.message?.includes('JWT')) {
        console.log('ℹ️ Subscription check skipped (not authenticated)');
        return;
      }
      console.error('💥 Unexpected error checking subscription:', error);
    } finally {
      setIsCheckingSubscription(false);
    }
  }, [session?.access_token, isCheckingSubscription, lastSubscriptionCheck]);

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
    console.log('🚀 Initializing AuthProvider...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, 'User ID:', session?.user?.id);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 User authenticated, fetching profile...');
          setTimeout(async () => {
            if (mounted) {
              await fetchUserProfile(session.user.id);
              if (event === 'SIGNED_IN') {
                await updateUserLogin(session.user.id);
                // Chiama checkSubscriptionStatus SOLO al login
                await checkSubscriptionStatus();
              }
            }
          }, 0);
        } else {
          console.log('🚪 User signed out, clearing profile');
          setUserProfile(null);
          setSubscriptionStatus(null);
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
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
            // Don't check subscription on init - only on SIGNED_IN event
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

  // Auto-refresh subscription status every 15 minutes
  useEffect(() => {
    if (!session?.access_token) return;
    
    // Crea una funzione locale per evitare dipendenze circolari
    const refreshSubscription = async () => {
      if (!session?.access_token || isCheckingSubscription) return;
      
      const now = Date.now();
      const timeSinceLastCheck = now - lastSubscriptionCheck;
      const THROTTLE_TIME = 3 * 60 * 1000;
      
      if (timeSinceLastCheck < THROTTLE_TIME) {
        console.log('⏱️ Auto-refresh throttled');
        return;
      }
      
      setIsCheckingSubscription(true);
      setLastSubscriptionCheck(now);
      
      try {
        console.log('🔄 Auto-refreshing subscription status...');
        
        // Get fresh session to ensure valid token
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!currentSession) {
          console.log('ℹ️ No session, skipping auto-refresh');
          setIsCheckingSubscription(false);
          return;
        }
        
        const { data, error } = await supabase.functions.invoke('check-subscription-status', {
          headers: {
            Authorization: `Bearer ${currentSession.access_token}`
          }
        });
        
        if (!error && data) {
          console.log('✅ Subscription auto-refreshed:', data);
          setSubscriptionStatus(data);
        }
      } catch (error) {
        console.error('💥 Error auto-refreshing subscription:', error);
      } finally {
        setIsCheckingSubscription(false);
      }
    };
    
    const interval = setInterval(refreshSubscription, 15 * 60 * 1000); // 15 minuti

    return () => clearInterval(interval);
  }, [session?.access_token, isCheckingSubscription, lastSubscriptionCheck]);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string, phone?: string) => {
    try {
      console.log('🚀 Starting registration with email verification for:', email);
      
      const userData: any = {
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      };

      if (firstName || lastName || phone) {
        userData.options.data = {
          first_name: firstName,
          last_name: lastName,
          phone: phone
        };
      }

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
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
        return { error };
      }

      if (data.session) {
        toast({
          title: "Registrazione completata",
          description: "Benvenuto! Il tuo account è stato creato con successo.",
        });
      } else {
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

  // Use the new role system from user_roles table
  // Also check legacy admin_role for backward compatibility
  const isAdmin = isAdminFromRoles || userProfile?.role === 'admin' || userProfile?.admin_role !== null;

  const value: AuthContextType = {
    user,
    session,
    userProfile,
    loading: loading || rolesLoading,
    isAdmin,
    subscriptionStatus,
    checkSubscriptionStatus,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    resetPassword,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};