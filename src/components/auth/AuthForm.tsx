import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Mail, User, Phone, Eye, EyeOff, ArrowLeft, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/brand/Logo';
import Claim from '@/components/brand/Claim';

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');

  const {
    signIn,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    resetPassword,
    user,
    session
  } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && session) {
      navigate('/', { replace: true });
    }
  }, [user, session, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Errore",
        description: "Inserisci email e password",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      toast({
        title: "Errore di connessione",
        description: "Problema di rete. Riprova tra qualche momento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate form data
    const errors: string[] = [];
    if (!email || !email.includes('@')) {
      errors.push('Email non valida');
    }
    if (!password || password.length < 6) {
      errors.push('Password deve essere di almeno 6 caratteri');
    }
    if (password !== confirmPassword) {
      errors.push('Le password non coincidono');
    }
    if (!firstName?.trim()) {
      errors.push('Nome obbligatorio');
    }
    if (!lastName?.trim()) {
      errors.push('Cognome obbligatorio');
    }
    
    if (errors.length > 0) {
      toast({
        title: "Errore di validazione",
        description: errors.join(', '),
        variant: "destructive"
      });
      setLoading(false);
      return;
    }
    
    try {
      const result = await signUp(email, password, firstName, lastName, phone);
      
      if (!result.error) {
        setRegistrationEmail(email);
        setEmailConfirmationSent(true);
        
        toast({
          title: "Registrazione avviata",
          description: "Controlla la tua email per confermare l'account",
        });
        
        // Clear form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
        setPhone('');
      } else {
        toast({
          title: "Errore nella registrazione",
          description: result.error.message || "Si è verificato un errore durante la registrazione",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Errore imprevisto",
        description: "Si è verificato un errore. Riprova tra qualche momento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      toast({
        title: "Errore login Google",
        description: "Problema di connessione con Google. Riprova tra qualche momento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleFacebookSignIn = async () => {
    setLoading(true);
    try {
      await signInWithFacebook!();
    } catch (error) {
      toast({
        title: "Errore login Facebook",
        description: "Problema di connessione con Facebook. Riprova tra qualche momento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleTwitterSignIn = async () => {
    setLoading(true);
    try {
      await signInWithTwitter!();
    } catch (error) {
      toast({
        title: "Errore login Twitter",
        description: "Problema di connessione con Twitter. Riprova tra qualche momento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(resetEmail);
      toast({
        title: "Email inviata",
        description: "Controlla la tua email per reimpostare la password"
      });
      setResetMode(false);
      setResetEmail('');
    } finally {
      setLoading(false);
    }
  };

  // Don't render if user is authenticated
  if (user && session) {
    return null;
  }

  if (resetMode) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 lg:p-8">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <KeyRound className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Recupera Password
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Inserisci la tua email per ricevere il link di reimpostazione
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="reset-email" 
                    type="email" 
                    placeholder="tua@email.com" 
                    value={resetEmail} 
                    onChange={e => setResetEmail(e.target.value)} 
                    className="pl-10 h-12 border-2 focus:border-primary transition-colors" 
                    required 
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300" 
                disabled={loading}
              >
                {loading ? 'Invio in corso...' : 'Invia Link di Reset'}
              </Button>
            </form>
            <Button 
              variant="ghost" 
              onClick={() => setResetMode(false)} 
              className="w-full flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna al login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 lg:p-8">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white">
        <CardHeader className="text-center space-y-6 pb-8">
          <Logo variant="vertical" size="lg" className="mx-auto" />
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-foreground">Comincia oggi, domani è già tardi 🚀</CardTitle>
            <Claim variant="main" className="text-center" />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1 h-12">
              <TabsTrigger value="signin" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300 h-10">
                Accedi
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300 h-10">
                Registrati
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="signin-email" 
                      type="email" 
                      placeholder="tua@email.com" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      className="pl-10 h-12 border-2 focus:border-primary transition-colors" 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="signin-password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="La tua password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      className="pl-10 pr-10 h-12 border-2 focus:border-primary transition-colors" 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <Button 
                    type="button" 
                    variant="link" 
                    onClick={() => setResetMode(true)} 
                    className="p-0 h-auto text-primary hover:text-primary/80 text-sm"
                  >
                    Password dimenticata?
                  </Button>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 shadow-lg" 
                  disabled={loading}
                >
                  {loading ? 'Accesso in corso...' : 'Accedi'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">o continua con</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleGoogleSignIn} 
                  className="h-12 border-2 hover:bg-muted/50 transition-colors" 
                  disabled={loading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleFacebookSignIn} 
                  className="h-12 border-2 hover:bg-muted/50 transition-colors" 
                  disabled={loading}
                >
                  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleTwitterSignIn} 
                  className="h-12 border-2 hover:bg-muted/50 transition-colors" 
                  disabled={loading}
                >
                  <svg className="w-5 h-5" fill="#1DA1F2" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-6">
              {emailConfirmationSent ? (
                <div className="text-center space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">Email di conferma inviata!</h3>
                    <p className="text-green-700 text-sm">
                      Abbiamo inviato un link di conferma a <strong>{registrationEmail}</strong>
                    </p>
                    <p className="text-green-600 text-xs mt-2">
                      Clicca sul link nell'email per attivare il tuo account
                    </p>
                  </div>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEmailConfirmationSent(false);
                      setRegistrationEmail('');
                    }}
                    className="w-full"
                  >
                    Registra un altro account
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstname" className="text-sm font-medium">Nome</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="signup-firstname" 
                          type="text" 
                          placeholder="Mario" 
                          value={firstName} 
                          onChange={e => setFirstName(e.target.value)} 
                          className="pl-10 h-12 border-2 focus:border-primary transition-colors" 
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-lastname" className="text-sm font-medium">Cognome</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="signup-lastname" 
                          type="text" 
                          placeholder="Rossi" 
                          value={lastName} 
                          onChange={e => setLastName(e.target.value)} 
                          className="pl-10 h-12 border-2 focus:border-primary transition-colors" 
                          required 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="mario.rossi@email.com" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className="pl-10 h-12 border-2 focus:border-primary transition-colors" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone" className="text-sm font-medium">Telefono (opzionale)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-phone" 
                        type="tel" 
                        placeholder="+39 123 456 7890" 
                        value={phone} 
                        onChange={e => setPhone(e.target.value)} 
                        className="pl-10 h-12 border-2 focus:border-primary transition-colors" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Crea una password sicura" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className="pl-10 pr-10 h-12 border-2 focus:border-primary transition-colors" 
                        required 
                        minLength={6}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password" className="text-sm font-medium">Conferma Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="signup-confirm-password" 
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="Ripeti la password" 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                        className="pl-10 pr-10 h-12 border-2 focus:border-primary transition-colors" 
                        required 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 shadow-lg" 
                    disabled={loading}
                  >
                    {loading ? 'Registrazione in corso...' : 'Registrati'}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;