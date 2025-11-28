import { motion } from "motion/react";
import { Check, Zap, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useParallax } from "@/hooks/useParallax";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PRICE_IDS } from "@/hooks/useSubscriptionGate";
import { useState } from "react";

export const LandingPricing = () => {
  const navigate = useNavigate();
  const { user, subscriptionProductId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, planName: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(planName);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Errore",
          description: "Devi essere autenticato",
          variant: "destructive"
        });
        return;
      }

      const response = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (response.error) throw response.error;
      if (response.data?.url) {
        window.open(response.data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Errore",
        description: "Impossibile avviare il checkout",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      name: "Free",
      price: "0€",
      description: "Per iniziare",
      features: [
        "Accesso ai corsi base",
        "3 simulazioni al giorno",
        "Community Discord",
        "Newsletter settimanale"
      ],
      icon: Zap,
      highlighted: false,
      priceId: null,
      productId: null
    },
    {
      name: "Pro",
      price: "29€",
      period: "/mese",
      description: "Il più scelto",
      features: [
        "Tutti i corsi sbloccati",
        "Simulazioni illimitate",
        "AI Coach FinGenius",
        "Analisi avanzate",
        "Supporto prioritario"
      ],
      icon: Sparkles,
      highlighted: true,
      priceId: PRICE_IDS.pro,
      productId: 'prod_TVWGTAfnyka83R'
    },
    {
      name: "Enterprise",
      price: "99€",
      period: "/mese",
      description: "Massima potenza",
      features: [
        "Tutto di Pro +",
        "Consulenza 1-on-1",
        "API personalizzate",
        "Dashboard custom",
        "Supporto dedicato 24/7"
      ],
      icon: Crown,
      highlighted: false,
      priceId: PRICE_IDS.enterprise,
      productId: 'prod_TVWkIBXmcKVgqn'
    }
  ];

  const isCurrentPlan = (productId: string | null) => {
    if (!productId) return !subscriptionProductId;
    return subscriptionProductId === productId;
  };

  return (
    <section id="pricing" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Scegli il Tuo Piano
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Inizia gratis e sblocca funzionalità premium quando sei pronto
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { ref, y } = useParallax();
            
            return (
            <motion.div
              key={plan.name}
              ref={ref}
              style={{ y }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-6 h-full relative ${
                plan.highlighted ? 'border-2 border-primary shadow-xl' : ''
              } ${
                isCurrentPlan(plan.productId) ? 'ring-2 ring-primary' : ''
              }`}>
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Più Popolare
                  </Badge>
                )}
                {isCurrentPlan(plan.productId) && (
                  <Badge className="absolute -top-3 right-4" variant="secondary">
                    Piano Attuale
                  </Badge>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    plan.highlighted ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <plan.icon className={`w-6 h-6 ${
                      plan.highlighted ? 'text-primary' : 'text-foreground'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground">{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan(plan.productId) ? (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    disabled
                  >
                    Piano Attuale ✓
                  </Button>
                ) : (
                  <Button
                    variant={plan.highlighted ? "default" : "outline"}
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      if (plan.priceId) {
                        handleCheckout(plan.priceId, plan.name);
                      } else if (!user) {
                        navigate('/auth');
                      } else {
                        navigate('/education');
                      }
                    }}
                    disabled={loading === plan.name}
                  >
                    {loading === plan.name 
                      ? "Caricamento..." 
                      : plan.name === "Free" 
                        ? "Inizia Gratis" 
                        : `Passa a ${plan.name}`
                    }
                  </Button>
                )}
              </Card>
            </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12 text-muted-foreground"
        >
          <p>
            <strong>Garanzia 30 giorni soddisfatti o rimborsati</strong> · 
            Cancella in qualsiasi momento · Nessuna commissione nascosta
          </p>
        </motion.div>
      </div>
    </section>
  );
};
