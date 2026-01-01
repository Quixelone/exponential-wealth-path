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
    <section id="testimonials" className="py-20 bg-slate-800/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Cosa Dicono i Nostri{' '}
            <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              Studenti
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto"
          >
            Storie reali di persone che hanno trasformato la loro vita finanziaria
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 h-full bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all relative">
                <Quote className="absolute top-4 right-4 w-8 h-8 text-purple-500/20" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-slate-300 mb-6 italic leading-relaxed">"{testimonial.text}"</p>

                {/* Profit Badge */}
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-semibold mb-4">
                  {testimonial.profit}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-violet-500 text-white">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-400">{testimonial.role}</div>
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
