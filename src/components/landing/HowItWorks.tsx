import { BookOpen, GraduationCap, Signal, TrendingUp, Target } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      icon: BookOpen,
      title: 'Iscrizione e Setup Broker',
      description: 'Accesso immediato ai broker raccomandati con setup guidato passo-passo',
      duration: '1 giorno'
    },
    {
      number: 2,
      icon: GraduationCap,
      title: 'Corso Opzioni Bitcoin',
      description: 'Formazione completa dalla teoria alle strategie avanzate',
      duration: '2-3 settimane'
    },
    {
      number: 3,
      icon: Signal,
      title: 'Primi Segnali Prova',
      description: '3 segnali settimanali guidati per iniziare con supporto',
      duration: 'Prime settimane'
    },
    {
      number: 4,
      icon: TrendingUp,
      title: 'Trading Autonomo',
      description: 'Esecuzione indipendente quotidiana dei segnali AI',
      duration: 'Continuo'
    },
    {
      number: 5,
      icon: Target,
      title: 'Ottimizzazione Continua',
      description: 'Miglioramento skills con webinar e contenuti avanzati',
      duration: 'Sempre'
    }
  ];

  return (
    <section id="come-funziona" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Come Funziona
          </h2>
          <p className="text-lg text-muted-foreground">
            Il percorso completo da principiante a trader autonomo in 5 step
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Progress line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

            {/* Steps */}
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="relative flex gap-6 items-start">
                  {/* Number circle */}
                  <div className="shrink-0 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-lg z-10">
                    {step.number}
                  </div>

                  {/* Content card */}
                  <div className="flex-1 bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <step.icon className="h-6 w-6 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-semibold">{step.title}</h3>
                          <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground whitespace-nowrap">
                            {step.duration}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
