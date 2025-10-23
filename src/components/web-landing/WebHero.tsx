import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Rocket, Shield, TrendingUp, Clock } from 'lucide-react';

const WebHero = () => {
  return (
    <section className="relative pt-24 pb-20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 animate-gradient-x"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Left Content - 60% */}
          <div className="lg:col-span-3 space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Rocket className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                🚀 6 MESI GRATIS - Offerta Limitata
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              La Prima Piattaforma AI che Ti Rende{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Autonomo nel Trading
              </span>{' '}
              Opzioni Bitcoin
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
              Non gestiamo i tuoi soldi. Ti insegniamo la Wheel Strategy + Ti diamo la tecnologia
              per crescere il capitale con PAC automatico e interesse composto
            </p>

            {/* Key Features */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1 rounded-full bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Piattaforma Software Completa</p>
                  <p className="text-sm text-muted-foreground">Dashboard + Analytics avanzati</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1 rounded-full bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Segnali AI Quotidiani + Formazione Professionale</p>
                  <p className="text-sm text-muted-foreground">
                    Algoritmi ottimizzati per strike prices
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1 rounded-full bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Protezione Assicurativa 0.15%</p>
                  <p className="text-sm text-muted-foreground">
                    Nei giorni di bassa volatilità
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  ACCEDI GRATIS ALLA PIATTAFORMA
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-lg px-8 py-6"
                asChild
              >
                <a href="#demo">Guarda Demo Live</a>
              </Button>
            </div>
          </div>

          {/* Right Visual - 40% */}
          <div className="lg:col-span-2">
            <div className="relative">
              {/* Dashboard Mockup */}
              <div className="relative rounded-2xl border-2 border-primary/20 bg-card shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium">Portfolio Overview</div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs text-muted-foreground">Live</span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-4">
                    <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4">
                      <div className="text-sm text-muted-foreground mb-1">Capitale Totale</div>
                      <div className="text-2xl font-bold">€15,847.32</div>
                      <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3" />
                        +42.3% (6 mesi)
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">Rendimento Oggi</div>
                        <div className="text-lg font-bold">+0.18%</div>
                      </div>
                      <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">PAC Attivo</div>
                        <div className="text-lg font-bold">€500/m</div>
                      </div>
                    </div>

                    {/* Chart Placeholder */}
                    <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 h-32 flex items-end justify-between gap-1">
                      {[40, 55, 48, 65, 52, 70, 58, 75, 68, 82, 78, 88].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-t animate-pulse"
                          style={{
                            height: `${height}%`,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badges */}
              <div className="absolute -top-4 -right-4 bg-card border-2 border-primary/20 rounded-xl p-3 shadow-lg animate-float">
                <div className="text-xs text-muted-foreground mb-1">Success Rate</div>
                <div className="text-xl font-bold text-green-500">94.2%</div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-card border-2 border-secondary/20 rounded-xl p-3 shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                <div className="text-xs text-muted-foreground mb-1">Active Traders</div>
                <div className="text-xl font-bold text-primary">2,847+</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WebHero;
