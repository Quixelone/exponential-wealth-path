import { ArrowDown, ArrowUp, DollarSign, Shield } from 'lucide-react';

const WheelStrategy = () => {
  return (
    <section id="strategia" className="py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left - Animation/Infographic - Più compatto su mobile */}
          <div className="relative lg:order-1">
            <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-background border-2 border-primary/20 rounded-2xl p-4 sm:p-6 lg:p-8">
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center">Ciclo Wheel Strategy</h3>

              {/* Step 1 */}
              <div className="mb-6 animate-fade-in">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Vendita Put Option</h4>
                    <p className="text-sm text-muted-foreground">
                      Vendi opzione put sotto prezzo BTC attuale
                    </p>
                    <div className="mt-2 p-2 bg-background rounded-lg text-xs">
                      <span className="text-muted-foreground">Strike:</span>{' '}
                      <span className="font-mono font-bold">€42,500</span>
                      <span className="text-muted-foreground ml-2">BTC:</span>{' '}
                      <span className="font-mono">€43,000</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <ArrowDown className="h-8 w-8 text-primary animate-bounce" />
              </div>

              {/* Step 2 */}
              <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Raccolta Premio</h4>
                    <p className="text-sm text-muted-foreground">
                      Incassi il premio giornaliero in USDT/BTC
                    </p>
                    <div className="mt-2 p-2 bg-green-500/10 rounded-lg flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-bold text-green-500">+0.20% giornaliero</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <div className="flex gap-4">
                  <div className="text-center">
                    <ArrowDown className="h-6 w-6 text-red-500 mx-auto" />
                    <span className="text-xs text-muted-foreground">BTC scende</span>
                  </div>
                  <div className="text-center">
                    <ArrowUp className="h-6 w-6 text-green-500 mx-auto" />
                    <span className="text-xs text-muted-foreground">BTC sale</span>
                  </div>
                </div>
              </div>

              {/* Step 3 - Scenarios */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <div className="text-xs font-bold text-red-500 mb-1">Se BTC Scende</div>
                  <p className="text-xs text-muted-foreground">
                    Acquisto BTC scontato + mantieni premio
                  </p>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg animate-fade-in" style={{ animationDelay: '0.6s' }}>
                  <div className="text-xs font-bold text-green-500 mb-1">Se BTC Sale</div>
                  <p className="text-xs text-muted-foreground">
                    Mantieni premio + nuovo ciclo
                  </p>
                </div>
              </div>

              {/* Step 4 - Protection */}
              <div className="mt-6 p-4 bg-primary/10 border-2 border-primary/20 rounded-lg animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-bold">Protezione Assicurativa</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Se premi {'<'} 0.10%, pool assicurativo garantisce 0.15%
                </p>
              </div>
            </div>
          </div>

          {/* Right - Content - Mobile First su piccoli schermi */}
          <div className="space-y-4 sm:space-y-6 lg:order-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              🎯 La Wheel Strategy che Genera{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                0.20% al Giorno
              </span>
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Strategia conservativa di vendita opzioni put che genera reddito costante
              indipendentemente dalla direzione di Bitcoin
            </p>

            {/* Key Benefits */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold">Premi Costanti in USDT o BTC</h4>
                  <p className="text-sm text-muted-foreground">
                    Guadagno giornaliero indipendente dalla direzione del mercato
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold">Protezione da Perdite Temporanee</h4>
                  <p className="text-sm text-muted-foreground">
                    Sistema assicurativo automatico nei giorni di bassa volatilità
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold">Gestione Automatica del Rischio</h4>
                  <p className="text-sm text-muted-foreground">
                    La piattaforma calcola automaticamente posizioni e dimensionamento
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold">AI Ottimizza Strike Prices Quotidianamente</h4>
                  <p className="text-sm text-muted-foreground">
                    Algoritmo analizza volatilità e momentum per massimizzare premi
                  </p>
                </div>
              </div>
            </div>

            {/* Practical Example */}
            <div className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-xl">
              <h4 className="font-bold text-lg mb-4">💡 Esempio Pratico</h4>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Con €10.000 di capitale:</span>
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-background/50 rounded-lg">
                    <div className="text-muted-foreground mb-1">Premio Giornaliero</div>
                    <div className="text-lg font-bold text-green-500">€20 (0.20%)</div>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg">
                    <div className="text-muted-foreground mb-1">Premio Mensile</div>
                    <div className="text-lg font-bold text-green-500">€600</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  • Se BTC scende: acquisti BTC scontato<br />
                  • Protezione assicurativa: 0.15% garantito
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WheelStrategy;
