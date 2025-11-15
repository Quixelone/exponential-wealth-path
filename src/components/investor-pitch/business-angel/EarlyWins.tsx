import { SectionWrapper } from '../shared/SectionWrapper';
import { Star, TrendingUp, Users } from 'lucide-react';
import { AnimatedCounter } from '../shared/AnimatedCounter';

export const EarlyWins = () => {
  const testimonials = [
    {
      name: 'Marco R.',
      capital: '€5,000',
      quote: 'Ho iniziato con €1.000 e dopo 6 mesi sono a €1.800. La piattaforma è incredibilmente facile da usare e i segnali AI sono precisi.',
      performance: '+18% MTD',
      avatar: '/placeholder.svg'
    },
    {
      name: 'Giulia C.',
      capital: '€500',
      quote: 'Finalmente un modo sicuro per investire in Bitcoin senza stress. Dedico solo 15 minuti al giorno e i risultati parlano da soli.',
      performance: '+12% MTD',
      avatar: '/placeholder.svg'
    },
    {
      name: 'Michele P.',
      capital: '€10,000',
      quote: 'La formazione professionale sulla Wheel Strategy vale da sola il prezzo dell\'abbonamento. Sono passato da completo neofita a trader autonomo.',
      performance: '+22% MTD',
      avatar: '/placeholder.svg'
    }
  ];

  return (
    <SectionWrapper className="bg-gradient-to-b from-background to-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Early Wins: I Nostri 12 Alpha Users
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Non sono numeri. Sono persone reali che hanno creduto in noi quando eravamo solo un'idea. Ecco cosa stanno ottenendo.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="text-5xl font-bold mb-2">
              <AnimatedCounter end={12} />
            </div>
            <div className="text-muted-foreground">Alpha Users Attivi</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
            <div className="text-5xl font-bold mb-2">
              <AnimatedCounter end={85} suffix="+" />
            </div>
            <div className="text-muted-foreground">NPS Score</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-primary" />
            </div>
            <div className="text-5xl font-bold mb-2">
              <AnimatedCounter end={250} suffix="+" />
            </div>
            <div className="text-muted-foreground">Waitlist</div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">Capitale: {testimonial.capital}</div>
                </div>
              </div>
              
              <p className="text-muted-foreground italic mb-4 leading-relaxed">
                "{testimonial.quote}"
              </p>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 rounded-full">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span className="text-accent font-semibold text-sm">{testimonial.performance}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg text-muted-foreground">
            Questi risultati sono reali e verificabili. Vogliamo portare questa stessa esperienza a migliaia di persone.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
};
