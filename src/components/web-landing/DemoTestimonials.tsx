import { Button } from '@/components/ui/button';
import { Star, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const DemoTestimonials = () => {
  const testimonials = [
    {
      name: 'Marco R.',
      role: 'Imprenditore',
      image: '👨‍💼',
      rating: 5,
      text: 'In 2 settimane ho imparato più di anni di tentativi. La piattaforma è incredibile.',
      result: '+42% in 6 mesi',
      verified: true,
    },
    {
      name: 'Giulia S.',
      role: 'Libera Professionista',
      image: '👩‍💻',
      rating: 5,
      text: '15 minuti al giorno, controllo totale. Finalmente un servizio trasparente.',
      result: '+38% in 5 mesi',
      verified: true,
    },
    {
      name: 'Andrea M.',
      role: 'Consulente Finanziario',
      image: '👨‍💼',
      rating: 5,
      text: 'Come consulente apprezzo il modello educativo. I clienti imparano davvero.',
      result: '+51% in 8 mesi',
      verified: true,
    },
  ];

  return (
    <section id="demo" className="py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Demo Section */}
        <div className="max-w-5xl mx-auto mb-12 sm:mb-16 lg:mb-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              🎮{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Prova la Piattaforma
              </span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground px-4">
              Esplora la demo interattiva o prenota una presentazione personalizzata 1:1
            </p>
          </div>

          {/* Demo Mockup - Ottimizzato per mobile */}
          <div className="relative bg-gradient-to-br from-primary/10 via-secondary/10 to-background border-2 border-primary/20 rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="aspect-video bg-card rounded-xl border-2 border-primary/20 overflow-hidden shadow-2xl flex items-center justify-center">
              <div className="text-center p-4 sm:p-6 lg:p-8">
                <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">🎯</div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">Dashboard Interattiva</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-4">
                  Esplora tutte le funzionalità della piattaforma in modalità demo
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link to="/app" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    >
                      Accedi alla Demo
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Prenota 1:1
                  </Button>
                </div>
              </div>
            </div>

            {/* Feature Pills - Compatti su mobile */}
            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3 justify-center">
              <span className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-background border text-xs sm:text-sm font-medium whitespace-nowrap">
                ✨ Nessuna carta
              </span>
              <span className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-background border text-xs sm:text-sm font-medium whitespace-nowrap">
                ⚡ Accesso immediato
              </span>
              <span className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-background border text-xs sm:text-sm font-medium whitespace-nowrap">
                🔒 Dati sicuri
              </span>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              💬 Cosa Dicono i Nostri Utenti
            </h2>
            <p className="text-lg text-muted-foreground">
              Storie di successo reali da trader che hanno trasformato il loro approccio
            </p>
          </div>

          {/* Testimonial Cards - Stack su mobile */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-card border-2 border-primary/20 rounded-xl p-5 sm:p-6 hover:shadow-xl transition-all duration-300 active:scale-98"
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl">{testimonial.image}</div>
                  <div className="flex-1">
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{testimonial.role}</p>
                    <div className="flex gap-0.5">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-500 text-yellow-500"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quote */}
                <p className="text-muted-foreground mb-4 italic">
                  "{testimonial.text}"
                </p>

                {/* Result */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="font-bold text-green-500">{testimonial.result}</span>
                  {testimonial.verified && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Utente Verificato</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-muted/50 border rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">
                ⚠️ I risultati possono variare. Il trading comporta rischi. Le performance
                passate non garantiscono risultati futuri. Investire responsabilmente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoTestimonials;
