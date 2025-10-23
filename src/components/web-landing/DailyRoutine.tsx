import { Clock, Bell, Search, TrendingUp, CheckCircle } from 'lucide-react';

const DailyRoutine = () => {
  const steps = [
    {
      time: '10:00',
      icon: Bell,
      title: 'Ricezione Segnale AI',
      description: 'Notifica Telegram con strike price ottimale',
      duration: '1 min',
      color: 'primary',
    },
    {
      time: '10:05',
      icon: Search,
      title: 'Analisi e Validazione',
      description: 'Controllo segnale su piattaforma + market conditions',
      duration: '3 min',
      color: 'secondary',
    },
    {
      time: '10:10',
      icon: TrendingUp,
      title: 'Esecuzione su Broker',
      description: 'Trade opzione put tramite broker raccomandato',
      duration: '2 min',
      color: 'primary',
    },
    {
      time: '10:15',
      icon: CheckCircle,
      title: 'Conferma e Tracking',
      description: 'Inserimento dati in piattaforma + aggiornamento portfolio',
      duration: '2 min',
      color: 'green',
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 sm:mb-6">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <span className="text-xs sm:text-sm font-semibold text-primary">Routine Ottimizzata</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            ⏰ Solo{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              15 Minuti al Giorno
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground px-4">
            Finestra 10:00-11:00 - Routine semplice e ottimizzata per massimizzare efficienza
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-primary hidden md:block"></div>

            {/* Steps */}
            <div className="space-y-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === steps.length - 1;

                return (
                  <div
                    key={index}
                    className="relative flex items-start gap-6 animate-fade-in"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    {/* Time Badge - Desktop */}
                    <div className="hidden md:flex flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary items-center justify-center text-white font-bold shadow-lg relative z-10">
                      <span className="text-sm">{step.time}</span>
                    </div>

                    {/* Content Card - Ottimizzato per touch */}
                    <div className="flex-1 bg-card border-2 border-primary/20 rounded-xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 active:scale-98">
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Icon - Mobile */}
                        <div className="md:hidden flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>

                        {/* Icon - Desktop */}
                        <div className="hidden md:flex flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="text-base sm:text-lg lg:text-xl font-bold">{step.title}</h3>
                            <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-secondary/10 text-xs font-medium text-secondary whitespace-nowrap">
                              <Clock className="h-3 w-3" />
                              {step.duration}
                            </span>
                          </div>
                          <p className="text-sm sm:text-base text-muted-foreground">{step.description}</p>

                          {/* Mobile Time */}
                          <div className="md:hidden mt-2 sm:mt-3">
                            <span className="text-sm font-bold text-primary">{step.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Callout */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-2 border-primary/20 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold mb-2">
              🎯 MASSIMO 15 MINUTI/GIORNO
            </div>
            <p className="text-muted-foreground">
              Sempre nella stessa finestra temporale per comodità
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DailyRoutine;
