import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrendingUp, Brain, Shield, Clock } from 'lucide-react';

const LandingHero = () => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Strategia Bitcoin Wheel
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Impara a Generare{' '}
              <span className="text-primary">0.20% Giornaliero</span>{' '}
              con le Opzioni Bitcoin
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              Formazione Completa + Segnali AI + Broker Raccomandati.{' '}
              <span className="font-semibold text-foreground">
                I tuoi soldi rimangono sempre tuoi.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8 h-14 w-full sm:w-auto">
                  INIZIA GRATIS PER 6 MESI
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 h-14"
                onClick={() => document.getElementById('come-funziona')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Scopri Come
              </Button>
            </div>

            {/* Key features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Sicurezza Totale</h3>
                  <p className="text-sm text-muted-foreground">Non tocchiamo i tuoi fondi</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Brain className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Segnali AI</h3>
                  <p className="text-sm text-muted-foreground">Trading guidato ogni giorno</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">15 Min/Giorno</h3>
                  <p className="text-sm text-muted-foreground">Tempo minimo richiesto</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Visual */}
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-8 backdrop-blur">
              <div className="h-full rounded-xl bg-card border shadow-2xl p-6 flex flex-col justify-center items-center gap-6">
                <TrendingUp className="h-24 w-24 text-primary" />
                <div className="text-center space-y-2">
                  <div className="text-5xl font-bold text-primary">0.20%</div>
                  <div className="text-muted-foreground">Rendimento Giornaliero Target</div>
                </div>
                <div className="w-full space-y-2 text-sm">
                  <div className="flex justify-between p-3 rounded bg-muted">
                    <span>1 Mese</span>
                    <span className="font-semibold text-green-600">+6%</span>
                  </div>
                  <div className="flex justify-between p-3 rounded bg-muted">
                    <span>6 Mesi</span>
                    <span className="font-semibold text-green-600">+40%</span>
                  </div>
                  <div className="flex justify-between p-3 rounded bg-muted">
                    <span>1 Anno</span>
                    <span className="font-semibold text-green-600">+100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
