
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Settings as SettingsIcon, CreditCard, Shield, ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotificationTester from '@/components/NotificationTester';
import SettingsHeader from '@/components/settings/SettingsHeader';
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
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-6">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Test Notifiche WhatsApp
            </TabsTrigger>
            <TabsTrigger value="insurance" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Assicurazione
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Preferenze
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications">
            <NotificationTester />
          </TabsContent>

          <TabsContent value="insurance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Copertura Assicurativa
                </CardTitle>
                <CardDescription>
                  Gestisci la tua copertura assicurativa mensile
                  {insuranceStatus.tierName && insuranceStatus.tierPrice && (
                    <span className="font-semibold text-primary ml-1">
                      - Tier {insuranceStatus.tierName}: €{insuranceStatus.tierPrice}/mese
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insuranceStatus.currentCapital !== null && insuranceStatus.tierName && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Capitale Attuale</p>
                        <p className="text-xl font-bold">€{insuranceStatus.currentCapital.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tier Attuale</p>
                        <p className="text-xl font-bold text-primary">{insuranceStatus.tierName}</p>
                      </div>
                    </div>
                  </div>
                )}

                {insuranceStatus.hasPaidThisMonth ? (
                  <>
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                      <AlertDescription className="text-green-800 dark:text-green-200">
                        ✅ Copertura attiva fino al {insuranceStatus.nextPaymentDate ? new Date(insuranceStatus.nextPaymentDate).toLocaleDateString('it-IT') : 'N/A'}
                      </AlertDescription>
                    </Alert>
                    {subscriptionStatus?.subscribed && (
                      <Button 
                        onClick={handleCustomerPortal}
                        disabled={openingPortal}
                        variant="outline"
                        className="w-full"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {openingPortal ? 'Caricamento...' : 'Gestisci Abbonamento'}
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                          <Shield className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {insuranceStatus.tierPrice ? `€${insuranceStatus.tierPrice}` : '€9.90-€159.90'}/mese
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {insuranceStatus.tierName ? `Tier ${insuranceStatus.tierName}` : 'Basato sul tuo capitale'}
                          </p>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleStripeCheckout} 
                        disabled={checkingPayment}
                        className="w-full"
                        size="lg"
                      >
                        <CreditCard className="mr-2 h-5 w-5" />
                        {checkingPayment ? 'Caricamento...' : 'Attiva Assicurazione'}
                      </Button>
                      
                      {!insuranceStatus.hasInsuredStrategy && (
                        <p className="text-xs text-muted-foreground mt-3 text-center">
                          Dopo l'attivazione, potrai gestire quale strategia assicurare dalla sezione Strategie
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
                  <p><strong>Come funziona:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Canone mensile basato sul capitale raggiunto (€9.90-€159.90)</li>
                    <li>Protezione attiva fino al 3 del mese successivo</li>
                    <li>Copertura automatica in caso di mancato fill delle opzioni</li>
                    <li>Accumulo premi virtuali durante il periodo senza fill</li>
                    <li>Passaggio automatico di tier quando il capitale cresce</li>
                  </ul>
                  {subscriptionStatus?.subscribed && subscriptionStatus.subscription_end && (
                    <p className="pt-2 font-medium">
                      Rinnovo abbonamento: {new Date(subscriptionStatus.subscription_end).toLocaleDateString('it-IT')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
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
