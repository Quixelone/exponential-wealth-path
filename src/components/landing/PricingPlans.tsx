import { Link } from 'react-router-dom';
import { Check, Star, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PricingPlans = () => {
  const freePlan = [
    'Corso fondamenti opzioni Bitcoin',
    '3 segnali settimanali di prova',
    'Setup broker guidato',
    'Community Telegram base',
    'Guide PDF essenziali',
    'Supporto via email'
  ];

  const premiumPlan = [
    'Tutto del piano gratuito',
    'Corso completo avanzato',
    'Segnali AI quotidiani (7/7)',
    'Protezione assicurativa segnali',
    'Webinar esclusivi settimanali',
    'Supporto 1:1 personalizzato',
    'Accesso anticipato nuove features',
    'Community VIP con analisi live'
  ];

  return (
    <section id="prezzi" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Piani e Prezzi Trasparenti
          </h2>
          <p className="text-lg text-muted-foreground">
            Inizia gratis per 6 mesi, poi scegli se continuare con il Premium
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <Card className="p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Piano Gratuito</h3>
                <p className="text-sm text-muted-foreground">Ideale per iniziare</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">0€</span>
                <span className="text-muted-foreground">/per 6 mesi</span>
              </div>
              <p className="text-sm text-green-600 font-semibold mt-2">
                Nessuna carta richiesta
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {freePlan.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Link to="/auth">
              <Button size="lg" variant="outline" className="w-full">
                INIZIA GRATIS
              </Button>
            </Link>
          </Card>

          {/* Premium Plan */}
          <Card className="p-8 relative border-2 border-primary shadow-2xl hover:shadow-3xl transition-shadow">
            {/* Popular badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
              PIÙ POPOLARE
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Piano Premium</h3>
                <p className="text-sm text-muted-foreground">Per trader seri</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">9,90€</span>
                <span className="text-muted-foreground">/mese</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                per capitale da 1.000€ a 2.500€
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {premiumPlan.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <Link to="/auth">
              <Button size="lg" className="w-full">
                INIZIA GRATIS POI UPGRADE
              </Button>
            </Link>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Puoi passare a Premium in qualsiasi momento
            </p>
          </Card>
        </div>

        {/* Bottom note */}
        <div className="max-w-3xl mx-auto mt-12 text-center">
          <Card className="p-6 bg-primary/5 border-primary/20">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Garanzia Trasparenza Totale:</strong> Nessun costo nascosto, 
              nessuna commissione sui profitti. Tutti i tuoi guadagni rimangono tuoi al 100%. 
              Il canone copre esclusivamente formazione e segnali AI.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;
