import { SectionWrapper } from '../shared/SectionWrapper';
import { AlertTriangle, TrendingDown, Lock } from 'lucide-react';

export const ProblemLived = () => {
  const problems = [
    {
      icon: TrendingDown,
      title: 'Fondi Pensione Tradizionali Perdono Valore',
      description: 'Rendimenti negativi in termini reali (-2% annuo dopo inflazione). Le nuove generazioni non possono permettersi di perdere altri 40 anni con questi strumenti.',
      stat: '-€1,800',
      statLabel: 'Persi in 5 anni sul mio fondo'
    },
    {
      icon: AlertTriangle,
      title: 'Bitcoin Troppo Volatile per Investire Direttamente',
      description: 'Swing del 30-50% in un mese. Impossibile dormire sereni con tutto il capitale esposto. Il rischio di liquidazione è troppo alto per un investitore retail.',
      stat: '50%',
      statLabel: 'Volatilità mensile media BTC'
    },
    {
      icon: Lock,
      title: 'Gestori Patrimoniali: Fee Alte, Zero Controllo',
      description: 'Commission del 2-3% annuo + performance fee 20%. E tu non hai voce in capitolo sulle decisioni. I tuoi soldi, le loro scelte.',
      stat: '2-3%',
      statLabel: 'Fee annuali gestori tradizionali'
    }
  ];

  return (
    <SectionWrapper id="problem">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Il Problema che Ho Vissuto in Prima Persona
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Non è teoria. Sono pain points che ho sperimentato direttamente cercando di costruire il mio fondo pensione.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-8 hover:border-primary transition-colors"
            >
              <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mb-6">
                <problem.icon className="h-8 w-8 text-destructive" />
              </div>
              
              <h3 className="text-xl font-semibold mb-4">{problem.title}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">{problem.description}</p>
              
              <div className="pt-6 border-t border-border">
                <div className="text-3xl font-bold text-destructive">{problem.stat}</div>
                <div className="text-sm text-muted-foreground">{problem.statLabel}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-primary/5 rounded-lg border border-primary/20">
          <h3 className="text-2xl font-bold mb-4 text-center">La Domanda che Mi Sono Fatto</h3>
          <p className="text-lg text-center text-muted-foreground">
            "Esiste un modo per avere <strong className="text-foreground">esposizione a Bitcoin</strong>, generare <strong className="text-foreground">reddito costante</strong>, e mantenere <strong className="text-foreground">controllo totale</strong> del rischio?"
          </p>
          <p className="text-center mt-4 text-primary font-semibold text-xl">
            La risposta è la Wheel Strategy. E ora voglio condividerla con tutti.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
};
