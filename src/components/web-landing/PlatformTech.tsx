import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Shield } from 'lucide-react';

const PlatformTech = () => {
  return (
    <section id="piattaforma" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-4">
            🏗️ Non Solo Segnali.{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Una Piattaforma FinTech Completa
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground px-4">
            Quello che gli altri non ti danno: la tecnologia per gestire tutto autonomamente
          </p>
        </div>

        {/* 3 Column Features - Stack su mobile */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {/* Column 1 - Dashboard */}
          <div className="group relative bg-card border rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            {/* Icon */}
            <div className="mb-4 sm:mb-6 p-2 sm:p-3 rounded-xl bg-primary/10 w-fit">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>

            {/* Screenshot Mockup - Ridotto su mobile */}
            <div className="mb-4 sm:mb-6 rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 p-3 sm:p-4 h-36 sm:h-48 overflow-hidden">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Crescita Capitale</span>
                  <span className="text-xs font-bold text-green-500">+42%</span>
                </div>
                <div className="h-24 flex items-end gap-1">
                  {[35, 42, 38, 55, 48, 62, 58, 70].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-t"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="text-2xl font-bold">€15,847</div>
              </div>
            </div>

            {/* Content */}
            <h3 className="text-lg sm:text-xl font-bold mb-2">Portfolio Manager Avanzato</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              Calcoli automatici PAC + interesse composto + tracking performance reale vs teorica
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary">
              ✨ Configurazioni multiple salvabili
            </div>
          </div>

          {/* Column 2 - Analytics */}
          <div className="group relative bg-card border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            {/* Icon */}
            <div className="mb-6 p-3 rounded-xl bg-secondary/10 w-fit">
              <TrendingUp className="h-8 w-8 text-secondary" />
            </div>

            {/* Screenshot Mockup */}
            <div className="mb-6 rounded-lg border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-primary/5 p-4 h-48 overflow-hidden">
              <div className="space-y-2">
                <div className="text-xs font-bold mb-2">Opzioni Attive</div>
                {[
                  { strike: '€42,500', premio: '0.22%', stato: 'Attivo' },
                  { strike: '€41,800', premio: '0.18%', stato: 'Scaduto' },
                  { strike: '€43,000', premio: '0.25%', stato: 'In corso' },
                ].map((opt, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-background/50 rounded p-2">
                    <span className="font-mono">{opt.strike}</span>
                    <span className="text-green-500 font-bold">{opt.premio}</span>
                    <span className="text-muted-foreground">{opt.stato}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold mb-2">Bitcoin Options Tracker</h3>
            <p className="text-muted-foreground mb-4">
              Gestione completa wheel strategy con strike prices ottimizzati e stati opzioni automatici
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-xs font-medium text-secondary">
              🔗 Integrazione broker API
            </div>
          </div>

          {/* Column 3 - Risk Management */}
          <div className="group relative bg-card border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            {/* Icon */}
            <div className="mb-6 p-3 rounded-xl bg-green-500/10 w-fit">
              <Shield className="h-8 w-8 text-green-500" />
            </div>

            {/* Screenshot Mockup */}
            <div className="mb-6 rounded-lg border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-primary/5 p-4 h-48 overflow-hidden">
              <div className="space-y-3">
                <div className="text-xs font-bold mb-2">Protezione Attiva</div>
                <div className="bg-background/50 rounded p-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Rendimento Minimo</span>
                    <span className="font-bold text-green-500">0.15%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Pool Assicurativo</span>
                    <span className="font-bold">Attivo</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Copertura</span>
                    <span className="font-bold">100%</span>
                  </div>
                </div>
                <div className="text-center pt-2">
                  <div className="inline-flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs text-muted-foreground">Protezione Attiva</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold mb-2">Protezione Intelligente</h3>
            <p className="text-muted-foreground mb-4">
              Pool assicurativo automatico per garantire 0.15% anche nei giorni di bassa volatilità
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-xs font-medium text-green-500">
              🛡️ Hedging con perpetual futures
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button
            size="lg"
            className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            asChild
          >
            <a href="#demo">🎮 PROVA LA DEMO INTERATTIVA</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PlatformTech;
