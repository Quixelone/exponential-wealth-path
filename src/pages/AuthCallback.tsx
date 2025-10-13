import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle } from 'lucide-react';
import Logo from '@/components/brand/Logo';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();

  useEffect(() => {
    // Check for auth session after email confirmation
    const checkAuthStatus = () => {
      if (user && session) {
        console.log('✅ Email confirmed, user authenticated, redirecting...');
        navigate('/', { replace: true });
      }
    };

    // Initial check
    checkAuthStatus();

    // Set up a timer to redirect after a few seconds if user is authenticated
    const timer = setTimeout(() => {
      if (user && session) {
        navigate('/', { replace: true });
      } else {
        // If no user after timeout, redirect to auth page
        navigate('/auth', { replace: true });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, session, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white">
        <CardHeader className="text-center space-y-6 pb-8">
          <Logo variant="vertical" size="lg" className="mx-auto" />
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-foreground">
              {user ? 'Email Confermata!' : 'Verifica Email...'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {user ? (
            <div className="space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <p className="text-muted-foreground">
                La tua email è stata confermata con successo. Reindirizzamento in corso...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">
                Conferma della tua email in corso...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
