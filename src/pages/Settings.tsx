
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Settings as SettingsIcon, CreditCard, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotificationTester from '@/components/NotificationTester';
import SettingsHeader from '@/components/settings/SettingsHeader';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Settings = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [insuranceStatus, setInsuranceStatus] = React.useState<{
    hasInsuredStrategy: boolean;
    hasPaidThisMonth: boolean;
    nextPaymentDate: string | null;
  }>({ hasInsuredStrategy: false, hasPaidThisMonth: false, nextPaymentDate: null });
  const [checkingPayment, setCheckingPayment] = React.useState(false);

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

      setInsuranceStatus({ hasInsuredStrategy, hasPaidThisMonth, nextPaymentDate });
    } catch (error) {
      console.error('Error checking insurance status:', error);
    }
  }, [user]);

  React.useEffect(() => {
    checkInsuranceStatus();
  }, [checkInsuranceStatus]);

  const handleStripeCheckout = async () => {
    if (!insuranceStatus.hasInsuredStrategy) {
      toast.error('Devi prima selezionare una strategia da assicurare');
      return;
    }

    setCheckingPayment(true);
    try {
      // Get insured config
      const { data: insuredConfig } = await supabase
        .from('investment_configs')
        .select('id')
        .eq('user_id', user!.id)
        .eq('is_insured', true)
        .single();

      if (!insuredConfig) {
        toast.error('Strategia assicurata non trovata');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-insurance-checkout', {
        body: { configId: insuredConfig.id },
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
                  Gestisci la tua copertura assicurativa mensile (€49/mese)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!insuranceStatus.hasInsuredStrategy ? (
                  <Alert>
                    <AlertDescription>
                      Vai nella sezione Strategie e seleziona la strategia che vuoi assicurare attivando il toggle "Assicura questa strategia".
                    </AlertDescription>
                  </Alert>
                ) : !insuranceStatus.hasPaidThisMonth ? (
                  <>
                    <Alert variant="destructive">
                      <AlertDescription>
                        Pagamento mensile in sospeso: €49/mese
                      </AlertDescription>
                    </Alert>
                    <Button 
                      onClick={handleStripeCheckout} 
                      disabled={checkingPayment}
                      className="w-full"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      {checkingPayment ? 'Caricamento...' : 'Paga con Carta (Stripe)'}
                    </Button>
                  </>
                ) : (
                  <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      ✅ Copertura attiva fino al {insuranceStatus.nextPaymentDate ? new Date(insuranceStatus.nextPaymentDate).toLocaleDateString('it-IT') : 'N/A'}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
                  <p><strong>Come funziona:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Pagamento mensile di €49</li>
                    <li>Protezione attiva fino al 3 del mese successivo</li>
                    <li>Copertura automatica in caso di mancato fill delle opzioni</li>
                    <li>Accumulo premi virtuali durante il periodo senza fill</li>
                  </ul>
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
