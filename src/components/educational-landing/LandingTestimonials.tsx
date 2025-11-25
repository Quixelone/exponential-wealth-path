import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

export const LandingTestimonials = () => {
  const testimonials = [
    {
      name: 'Marco Rossi',
      role: 'Trader Professionista',
      avatar: 'MR',
      rating: 5,
      text: 'In 3 mesi sono passato da zero conoscenze a fare trading costante con profitto. Prof Satoshi è stato fondamentale per capire i concetti complessi.',
      profit: '+127% ROI',
    },
    {
      name: 'Laura Bianchi',
      role: 'Studente Part-Time',
      avatar: 'LB',
      rating: 5,
      text: 'Studio la sera dopo il lavoro. La gamification mi tiene motivata e il paper trading mi ha fatto capire come funziona davvero il mercato.',
      profit: '+89% ROI',
    },
    {
      name: 'Giuseppe Verdi',
      role: 'Ex-Trader Azionario',
      avatar: 'GV',
      rating: 5,
      text: 'Venivo dal trading azionario tradizionale. Questo corso mi ha aperto gli occhi sulle opportunità delle opzioni Bitcoin. Risultati incredibili.',
      profit: '+156% ROI',
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Cosa Dicono i Nostri{' '}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Studenti
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Storie reali di persone che hanno trasformato la loro vita finanziaria
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 h-full hover:shadow-xl transition-shadow relative">
                <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-muted-foreground mb-6 italic">"{testimonial.text}"</p>

                {/* Profit Badge */}
                <div className="inline-block px-3 py-1 rounded-full bg-green-500/20 text-green-600 text-sm font-semibold mb-4">
                  {testimonial.profit}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
