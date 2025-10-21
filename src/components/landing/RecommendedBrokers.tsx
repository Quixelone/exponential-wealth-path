import { CheckCircle2, Shield, DollarSign, Smartphone, Bitcoin, Headphones } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const RecommendedBrokers = () => {
  const features = [
    {
      icon: Shield,
      title: 'Regolamentazione UE',
      description: 'Broker autorizzati e supervisionati'
    },
    {
      icon: DollarSign,
      title: 'Commissioni Competitive',
      description: 'Costi trasparenti e contenuti'
    },
    {
      icon: Smartphone,
      title: 'Piattaforme User-Friendly',
      description: 'Interface intuitive per principianti'
    },
    {
      icon: Bitcoin,
      title: 'Supporto Opzioni Bitcoin',
      description: 'Tutti i prodotti necessari disponibili'
    },
    {
      icon: Headphones,
      title: 'Assistenza Clienti',
      description: 'Supporto in italiano 24/7'
    },
    {
      icon: CheckCircle2,
      title: 'Setup Guidato Incluso',
      description: 'Ti aiutiamo step-by-step'
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Broker Raccomandati
          </h2>
          <p className="text-lg text-muted-foreground">
            Partner selezionati per sicurezza, affidabilità e facilità d'uso
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Features grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* CTA Card */}
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">
                Setup Guidato Broker Incluso
              </h3>
              <p className="text-muted-foreground mb-6">
                Ti aiutiamo a scegliere e configurare il broker più adatto alle tue esigenze. 
                Guida passo-passo dalla registrazione alla prima operazione.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="px-8">
                  Scopri i Broker
                </Button>
                <Button size="lg" variant="outline" className="px-8">
                  Contatta Supporto
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-6">
                I tuoi fondi rimangono sempre sotto il tuo controllo. Finanza Creativa non ha accesso ai tuoi conti broker.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default RecommendedBrokers;
