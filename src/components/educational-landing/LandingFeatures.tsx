import { Card } from '@/components/ui/card';
import { motion } from 'motion/react';
import { Brain, LineChart, Shield, Gamepad2, Award, Rocket } from 'lucide-react';

export const LandingFeatures = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI Tutor Personalizzato',
      description: 'Prof Satoshi ti segue 24/7 con feedback personalizzati e suggerimenti real-time.',
      gradient: 'from-purple-500 to-violet-500',
    },
    {
      icon: LineChart,
      title: 'Simulatore Trading',
      description: 'Fai pratica con dati di mercato reali senza rischiare capitale. Impara facendo.',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Shield,
      title: 'Risk Management Pro',
      description: 'Impara le strategie di gestione del rischio usate dai trader professionisti.',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: Gamepad2,
      title: 'Gamification Totale',
      description: 'Guadagna XP, sblocca badge e scala la classifica mentre impari.',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      icon: Award,
      title: 'Certificazione Ufficiale',
      description: 'Ottieni certificati riconosciuti per ogni corso completato con successo.',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: Rocket,
      title: 'Community Attiva',
      description: 'Unisciti a 1600+ trader che condividono strategie e risultati ogni giorno.',
      gradient: 'from-indigo-500 to-purple-500',
    },
  ];

  return (
    <section id="features" className="py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Tutto Ciò che Ti Serve per{' '}
            <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              Padroneggiare la Wheel Strategy
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto"
          >
            Una piattaforma completa che combina teoria, pratica e community per trasformarti in un trader professionista
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="p-6 h-full bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
