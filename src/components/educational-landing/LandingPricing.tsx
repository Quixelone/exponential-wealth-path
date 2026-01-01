import { motion } from "motion/react";
import { Check, Zap, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
      price: "€0",
      period: "",
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
      price: "€9.99",
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
      name: "Custom",
      price: "Custom",
      period: "",
      description: "Per aziende",
      features: [
        "Tutto di Pro +",
        "Consulenza 1-on-1",
        "Formazione team",
        "Dashboard custom",
        "Supporto dedicato 24/7"
      ],
      icon: MessageCircle,
      highlighted: false,
      priceId: null,
      productId: null,
      isCustom: true
    }
  ];

  const isCurrentPlan = (productId: string | null) => {
    if (!productId) return !subscriptionProductId;
    return subscriptionProductId === productId;
  };

  return (
    <section id="pricing" className="py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Scegli il Piano{' '}
            <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              Perfetto per Te
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Inizia gratis e sblocca funzionalità premium quando sei pronto
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-6 h-full relative bg-slate-800/50 backdrop-blur-sm border-slate-700/50 ${
                plan.highlighted ? 'border-2 border-purple-500 shadow-xl shadow-purple-500/20' : ''
              } ${
                isCurrentPlan(plan.productId) ? 'ring-2 ring-purple-400' : ''
              }`}>
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-violet-500 border-0">
                    Più Popolare
                  </Badge>
                )}
                {isCurrentPlan(plan.productId) && (
                  <Badge className="absolute -top-3 right-4 bg-slate-700 border-slate-600 text-slate-200">
                    Piano Attuale
                  </Badge>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    plan.highlighted 
                      ? 'bg-gradient-to-r from-purple-500 to-violet-500' 
                      : 'bg-slate-700'
                  }`}>
                    <plan.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-sm text-slate-400">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.period && (
                      <span className="text-slate-400">{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan(plan.productId) ? (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-slate-600 text-slate-400"
                    disabled
                  >
                    Piano Attuale ✓
                  </Button>
                ) : (plan as any).isCustom ? (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                    onClick={() => window.open('mailto:support@finanzacreativa.live', '_blank')}
                  >
                    Contattaci
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className={`w-full ${
                      plan.highlighted 
                        ? 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white' 
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
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
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12 text-slate-400"
        >
          <p>
            <strong className="text-slate-300">Garanzia 30 giorni soddisfatti o rimborsati</strong> · 
            Cancella in qualsiasi momento · Nessuna commissione nascosta
          </p>
        </motion.div>
      </div>
    </section>
  );
};
