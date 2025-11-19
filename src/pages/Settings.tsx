
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Settings as SettingsIcon, CreditCard, Shield, ExternalLink, CheckCircle2, TrendingUp, AlertTriangle, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotificationTester from '@/components/NotificationTester';
import SettingsHeader from '@/components/settings/SettingsHeader';
import { BackupManager } from '@/components/configuration/BackupManager';
import { BrokerAPIManager } from '@/components/settings/BrokerAPIManager';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Settings = () => {
  const { user, userProfile, loading: authLoading, subscriptionStatus, checkSubscriptionStatus } = useAuth();
  const navigate = useNavigate();
  const [insuranceStatus, setInsuranceStatus] = React.useState<{
    hasInsuredStrategy: boolean;
    hasPaidThisMonth: boolean;
    nextPaymentDate: string | null;
    currentCapital: number | null;
    tierName: string | null;
    tierPrice: number | null;
  }>({ 
    hasInsuredStrategy: false, 
    hasPaidThisMonth: false, 
    nextPaymentDate: null,
    currentCapital: null,
    tierName: null,
    tierPrice: null
  });
  const [checkingPayment, setCheckingPayment] = React.useState(false);
  const [openingPortal, setOpeningPortal] = React.useState(false);

  const determineInsuranceTier = (capitalEur: number) => {
    if (capitalEur < 2500) return { name: 'Starter', price: 9.90 };
    if (capitalEur < 5000) return { name: 'Growth', price: 19.90 };
    if (capitalEur < 10000) return { name: 'Advanced', price: 39.90 };
    if (capitalEur < 25000) return { name: 'Premium', price: 79.90 };
    return { name: 'Elite', price: 159.90 };
  };

  const calculateCurrentCapital = React.useCallback(async () => {
    if (!user) return null;

    try {
      // Get user's active config
      const { data: config } = await supabase
        .from('investment_configs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_insured', true)
        .single();

      if (!config) return null;

      // Get daily returns and PAC overrides
      const { data: dailyReturns } = await supabase
        .from('daily_returns')
        .select('day, return_rate')
        .eq('config_id', config.id);

      const { data: dailyPACOverrides } = await supabase
        .from('daily_pac_overrides')
        .select('day, pac_amount')
        .eq('config_id', config.id);

      // Calculate days passed
      const startDate = new Date(config.pac_start_date);
      const today = new Date();
      const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysPassed < 0) return config.initial_capital;

      let capital = config.initial_capital;
      const returnMap = new Map((dailyReturns || []).map((r: any) => [r.day, r.return_rate]));
      const pacOverrideMap = new Map((dailyPACOverrides || []).map((p: any) => [p.day, p.pac_amount]));

      for (let day = 1; day <= Math.min(daysPassed, config.time_horizon); day++) {
        const dailyReturn = returnMap.get(day) ?? config.daily_return_rate;
        capital = capital * (1 + dailyReturn / 100);

        const isPACDay = (d: number) => {
          if (config.pac_frequency === 'daily') return true;
          if (config.pac_frequency === 'weekly') return d % 7 === 0;
          if (config.pac_frequency === 'monthly') return d % 30 === 0;
          if (config.pac_frequency === 'custom' && config.pac_custom_days) return d % config.pac_custom_days === 0;
          return false;
        };

        if (isPACDay(day)) {
          const pacAmount = pacOverrideMap.get(day) ?? config.pac_amount;
          capital += pacAmount;
        }
      }

      // Convert to EUR if needed
      let capitalEur = capital;
      if (config.currency === 'USD' || config.currency === 'USDT') {
        capitalEur = capital * 0.92;
      }

      return capitalEur;
    } catch (error) {
      console.error('Error calculating capital:', error);
      return null;
    }
  }, [user]);

  const checkInsuranceStatus = React.useCallback(async () => {
    if (!user) return;

    try {
      // Check if user has an insured strategy
      const { data: insuredConfig } = await supabase
        .from('investment_configs')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_insured', true)
        .single();

      const hasInsuredStrategy = !!insuredConfig;

      // Calculate current capital
      const currentCapital = await calculateCurrentCapital();
      let tierName = null;
      let tierPrice = null;

      if (currentCapital !== null) {
        const tier = determineInsuranceTier(currentCapital);
        tierName = tier.name;
        tierPrice = tier.price;
      }

      // Check payment for current month
      const now = new Date();
      const paymentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const { data: payment } = await supabase
        .from('insurance_payments')
        .select('is_paid, payment_due_date')
        .eq('user_id', user.id)
        .eq('payment_month', paymentMonth.toISOString().split('T')[0])
        .single();

      const hasPaidThisMonth = payment?.is_paid || false;
      const nextPaymentDate = payment?.payment_due_date || null;

      setInsuranceStatus({ 
        hasInsuredStrategy, 
        hasPaidThisMonth, 
        nextPaymentDate,
        currentCapital,
        tierName,
        tierPrice
      });
    } catch (error) {
      console.error('Error checking insurance status:', error);
    }
  }, [user, calculateCurrentCapital]);

  React.useEffect(() => {
    checkInsuranceStatus();
  }, [checkInsuranceStatus]);

  // Auto-refresh subscription status when returning from Stripe
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      checkSubscriptionStatus();
      toast.success('Pagamento completato con successo!');
      // Clean up URL
      window.history.replaceState({}, '', '/settings');
    }
  }, [checkSubscriptionStatus]);

  const handleStripeCheckout = async () => {
    setCheckingPayment(true);
    try {
      // First check if user has any configs at all
      const { data: allConfigs } = await supabase
        .from('investment_configs')
        .select('id, name, is_insured')
        .eq('user_id', user!.id);

      if (!allConfigs || allConfigs.length === 0) {
        toast.error('Devi prima creare una strategia nella sezione Strategie');
        return;
      }

      // Try to get insured config, or use first available
      let configId = allConfigs.find(c => c.is_insured)?.id || allConfigs[0].id;

      const { data, error } = await supabase.functions.invoke('create-insurance-checkout', {
        body: { configId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Errore durante la creazione del checkout');
    } finally {
      setCheckingPayment(false);
    }
  };

  const handleCustomerPortal = async () => {
    setOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Errore durante l\'apertura del portale clienti');
    } finally {
      setOpeningPortal(false);
    }
  };

  // Redirect to auth if not logged in
  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento impostazioni...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <SettingsHeader />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Impostazioni Sistema</h1>
          <p className="text-muted-foreground">
            Configura e testa le notifiche, gestisci le preferenze del sistema
          </p>
        </div>

        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 mb-6">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Test Notifiche WhatsApp
          </TabsTrigger>
          <TabsTrigger value="api-brokers" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            🔌 API Broker
          </TabsTrigger>
          <TabsTrigger value="insurance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Assicurazione
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Backup Strategie
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Preferenze
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <NotificationTester />
        </TabsContent>

        <TabsContent value="api-brokers">
          <BrokerAPIManager />
        </TabsContent>

          <TabsContent value="insurance" className="space-y-6">
            {/* DEMO: Sistema Finanza Points™ */}
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">✨</span>
                      Finanza Points™
                      <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">DEMO</span>
                    </CardTitle>
                    <CardDescription>
                      Sistema di incentivi per il tuo percorso formativo
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Punti Disponibili</p>
                    <p className="text-4xl font-bold text-primary">2,450</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Livello Formativo</span>
                    <span className="font-semibold text-primary">Studente Avanzato (Livello 5)</span>
                  </div>
                  <div className="w-full h-3 bg-secondary/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                      style={{ width: '65%' }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    850 punti al prossimo livello (Livello 6: Trader Junior)
                  </p>
                </div>

                <Separator />

                {/* Come Guadagnare Punti */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Come Guadagnare Punti
                  </h4>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Completa Simulazione Giornaliera</p>
                          <p className="text-xs text-muted-foreground">Esegui una strategia simulata</p>
                        </div>
                      </div>
                      <span className="font-bold text-green-500">+50 pts</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Supera Quiz Formativo</p>
                          <p className="text-xs text-muted-foreground">Voto minimo 80%</p>
                        </div>
                      </div>
                      <span className="font-bold text-blue-500">+100 pts</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Partecipa a Webinar Live</p>
                          <p className="text-xs text-muted-foreground">Presenza confermata</p>
                        </div>
                      </div>
                      <span className="font-bold text-purple-500">+200 pts</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Streak di 7 Giorni Consecutivi</p>
                          <p className="text-xs text-muted-foreground">Accesso giornaliero alla piattaforma</p>
                        </div>
                      </div>
                      <span className="font-bold text-orange-500">+500 pts</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Cosa Puoi Sbloccare */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Cosa Puoi Sbloccare con i Punti
                  </h4>
                  <div className="grid gap-3">
                    <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border-2 border-primary/30">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm mb-1">📚 Modulo Avanzato: Greeks & Volatility</p>
                          <p className="text-xs text-muted-foreground">Corso completo su Delta, Gamma, Theta, Vega</p>
                        </div>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full whitespace-nowrap">
                          1,000 pts
                        </span>
                      </div>
                      <Button size="sm" className="w-full mt-2">
                        Sblocca Ora
                      </Button>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-lg border-2 border-secondary/30">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm mb-1">🤖 Accesso AI Analytics Avanzato</p>
                          <p className="text-xs text-muted-foreground">Analisi predittive con algoritmi ML</p>
                        </div>
                        <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded-full whitespace-nowrap">
                          1,500 pts
                        </span>
                      </div>
                      <Button size="sm" variant="secondary" className="w-full mt-2">
                        Sblocca Ora
                      </Button>
                    </div>
                    
                    <div className="p-4 bg-muted/50 rounded-lg border-2 border-muted opacity-60">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm mb-1">👨‍🏫 Sessione 1:1 con Formatore Senior</p>
                          <p className="text-xs text-muted-foreground">30 minuti di coaching personalizzato</p>
                        </div>
                        <span className="text-xs bg-muted px-2 py-1 rounded-full whitespace-nowrap">
                          3,000 pts
                        </span>
                      </div>
                      <Button size="sm" variant="outline" disabled className="w-full mt-2">
                        Punti Insufficienti
                      </Button>
                    </div>
                  </div>
                </div>

                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <AlertTitle className="text-yellow-700 dark:text-yellow-400">
                    ℹ️ Sistema di Gamification Educativa
                  </AlertTitle>
                  <AlertDescription className="text-yellow-600 dark:text-yellow-300 text-xs">
                    I Finanza Points™ sono un sistema di incentivi formativi. Non rappresentano valore monetario, 
                    garanzie di rendimento o protezione assicurativa. Servono solo a motivare l'apprendimento 
                    e sbloccare contenuti educativi avanzati.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Statistiche Formative */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Le Tue Statistiche Formative</CardTitle>
                <CardDescription>Progressi nel percorso di apprendimento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-primary/5 rounded-lg border text-center">
                    <p className="text-3xl font-bold text-primary">23</p>
                    <p className="text-xs text-muted-foreground mt-1">Simulazioni Completate</p>
                  </div>
                  <div className="p-4 bg-secondary/5 rounded-lg border text-center">
                    <p className="text-3xl font-bold text-secondary-foreground">12</p>
                    <p className="text-xs text-muted-foreground mt-1">Quiz Superati</p>
                  </div>
                  <div className="p-4 bg-accent/5 rounded-lg border text-center">
                    <p className="text-3xl font-bold">8</p>
                    <p className="text-xs text-muted-foreground mt-1">Moduli Completati</p>
                  </div>
                  <div className="p-4 bg-green-500/5 rounded-lg border text-center">
                    <p className="text-3xl font-bold text-green-500">14</p>
                    <p className="text-xs text-muted-foreground mt-1">Giorni di Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Come Funziona */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Come Funziona Finanza Points™</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Sistema di Incentivi Educativi</h4>
                    <p className="text-sm text-muted-foreground">
                      Completa simulazioni, quiz e obiettivi didattici per accumulare punti. 
                      Più ti impegni nella formazione, più contenuti avanzati sblocchi.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Progressione Formativa</h4>
                    <p className="text-sm text-muted-foreground">
                      Avanza attraverso i livelli formativi (da Studente a Professionista) 
                      completando obiettivi didattici. Ogni livello sblocca nuove funzionalità.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Solo Gamification, Non Assicurazione</h4>
                    <p className="text-sm text-muted-foreground">
                      I Finanza Points™ non sono una protezione assicurativa, non garantiscono rendimenti 
                      e non hanno valore monetario. È solo un sistema per rendere l'apprendimento più coinvolgente.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup">
            <BackupManager />
          </TabsContent>

          <TabsContent value="preferences">
            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Preferenze Notifiche</h3>
              <p className="text-muted-foreground">
                Le preferenze delle notifiche verranno implementate in futuro.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
