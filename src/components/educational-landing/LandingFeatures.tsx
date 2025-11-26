import { Card } from '@/components/ui/card';
import { motion } from 'motion/react';
import { Brain, LineChart, Shield, Gamepad2, Award, Rocket } from 'lucide-react';
import { useParallax } from '@/hooks/useParallax';

export const LandingFeatures = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI Tutor Personale',
      description: 'Prof Satoshi ti segue 24/7 con feedback personalizzati e suggerimenti real-time.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: LineChart,
      title: 'Paper Trading Reale',
      description: 'Fai pratica con dati di mercato reali senza rischiare capitale. Impara facendo.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Shield,
      title: 'Risk Management Pro',
      description: 'Impara le strategie di gestione del rischio usate dai trader professionisti.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Gamepad2,
      title: 'Gamification Totale',
      description: 'Guadagna XP, sblocca badge e scala la classifica mentre impari.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Award,
      title: 'Certificazione Ufficiale',
      description: 'Ottieni certificati riconosciuti per ogni corso completato con successo.',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Rocket,
      title: 'Comunità Attiva',
      description: 'Unisciti a 1000+ trader che condividono strategie e risultati ogni giorno.',
      gradient: 'from-indigo-500 to-purple-500',
    },
  ];

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Tutto Quello che Ti Serve per{' '}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Avere Successo
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Una piattaforma completa che combina teoria, pratica e community per trasformarti in un trader professionista
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const direction = index % 2 === 0 ? 'right' : 'left';
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { ref, x, y } = useParallax({ speed: 0.15, direction, scale: true });
            
            return (
              <motion.div
                ref={ref}
                key={feature.title}
                style={{ x, y }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
              <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 border-border/50">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
