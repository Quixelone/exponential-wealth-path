import { Star, Quote } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Marco R.',
      role: 'Imprenditore',
      avatar: 'MR',
      rating: 5,
      text: 'Ho imparato in 2 settimane quello che non sapevo in anni. La formazione è chiara, i segnali precisi, e soprattutto mantengo il controllo totale dei miei fondi.',
      result: '+42% in 6 mesi'
    },
    {
      name: 'Giulia S.',
      role: 'Libera Professionista',
      avatar: 'GS',
      rating: 5,
      text: '15 minuti al giorno, controllo totale, risultati costanti. Finalmente un servizio che ti insegna davvero a pescare invece di darti il pesce.',
      result: '+38% in 5 mesi'
    },
    {
      name: 'Andrea M.',
      role: 'Consulente Finanziario',
      avatar: 'AM',
      rating: 5,
      text: 'La trasparenza è totale, zero sorprese nascoste. Come consulente apprezzo il modello educativo: i clienti imparano e diventano autonomi.',
      result: '+51% in 8 mesi'
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Cosa Dicono i Nostri Studenti
          </h2>
          <p className="text-lg text-muted-foreground">
            Storie di successo reali da chi ha già iniziato il percorso
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 hover:shadow-xl transition-shadow relative">
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />

              {/* Avatar and info */}
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {testimonial.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Testimonial text */}
              <p className="text-sm text-muted-foreground mb-4 italic">
                "{testimonial.text}"
              </p>

              {/* Result badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-semibold">
                <span>{testimonial.result}</span>
              </div>

              {/* Verified badge */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="text-green-600">✓</span> Utente Verificato
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-center text-muted-foreground max-w-2xl mx-auto mt-12">
          * I risultati possono variare. Le performance passate non garantiscono risultati futuri. 
          Il trading comporta rischi di perdita del capitale investito.
        </p>
      </div>
    </section>
  );
};

export default Testimonials;
