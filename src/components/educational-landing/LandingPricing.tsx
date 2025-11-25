import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import { Check, Zap, Crown, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const LandingPricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const plans = [
    {
      name: 'Free',
      icon: Zap,
      price: '0',
      period: 'per sempre',
      description: 'Perfetto per iniziare e testare la piattaforma',
      features: [
        'Accesso a 3 corsi base',
        'Paper trading limitato',
        'Prof Satoshi (10 domande/giorno)',
        'Community access',
        'Certificato base',
      ],
      cta: 'Inizia Gratis',
      popular: false,
      gradient: 'from-gray-500 to-gray-700',
    },
    {
      name: 'Pro',
      icon: Crown,
      price: '29',
      period: 'al mese',
      description: 'Per chi vuole diventare trader professionista',
      features: [
        'Accesso a TUTTI i corsi',
        'Paper trading illimitato',
        'Prof Satoshi illimitato',
        'Analisi mercato real-time',
        'Certificazioni avanzate',
        'Supporto prioritario',
        'Webinar esclusivi',
      ],
      cta: 'Diventa Pro',
      popular: true,
      gradient: 'from-primary to-purple-600',
    },
    {
      name: 'Enterprise',
      icon: Building2,
      price: 'Custom',
      period: 'contattaci',
      description: 'Per aziende e team di trading',
      features: [
        'Tutto del piano Pro',
        'Licenze multiple',
        'Dashboard amministratore',
        'Formazione personalizzata',
        'API access',
        'Supporto dedicato',
        'SLA garantito',
      ],
      cta: 'Contattaci',
      popular: false,
      gradient: 'from-orange-500 to-red-600',
    },
  ];

  const handlePlanClick = (planName: string) => {
    if (user) {
      navigate('/education');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Scegli il Piano{' '}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Perfetto per Te
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Inizia gratis e aggiorna quando sei pronto. Nessun vincolo, cancella quando vuoi.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-purple-600 border-0">
                  Più Popolare
                </Badge>
              )}
              
              <Card className={`p-8 h-full hover:shadow-2xl transition-all duration-300 ${
                plan.popular ? 'border-primary shadow-lg scale-105' : ''
              }`}>
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center mb-4`}>
                  <plan.icon className="w-7 h-7 text-white" />
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">
                      {plan.price === 'Custom' ? '' : '€'}{plan.price}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  size="lg"
                  onClick={() => handlePlanClick(plan.name)}
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary to-purple-600 hover:opacity-90'
                      : 'bg-background hover:bg-muted border-2 border-primary text-primary'
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Garanzia 30 giorni soddisfatti o rimborsati</span> · 
            Cancella in qualsiasi momento · Nessuna commissione nascosta
          </p>
        </motion.div>
      </div>
    </section>
  );
};
