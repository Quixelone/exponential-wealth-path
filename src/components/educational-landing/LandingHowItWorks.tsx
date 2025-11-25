import { Card } from '@/components/ui/card';
import { motion } from 'motion/react';
import { BookOpen, Gamepad2, Trophy } from 'lucide-react';

export const LandingHowItWorks = () => {
  const steps = [
    {
      icon: BookOpen,
      step: '01',
      title: 'Impara la Teoria',
      description: 'Video lezioni, quiz interattivi e materiali scaricabili per costruire le basi solide.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Gamepad2,
      step: '02',
      title: 'Pratica in Sicurezza',
      description: 'Usa il simulatore paper trading per fare esperienza con dati reali senza rischi.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Trophy,
      step: '03',
      title: 'Ottieni la Certificazione',
      description: 'Completa le sfide, guadagna badge e ricevi il certificato ufficiale di trader professionista.',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Come Funziona?{' '}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Semplice in 3 Step
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Il nostro metodo provato per trasformarti da principiante a trader professionista
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection Lines (desktop only) */}
          <div className="hidden md:block absolute top-1/4 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500" />

          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative"
            >
              <Card className="p-8 h-full hover:shadow-xl transition-all duration-300">
                {/* Step Number Badge */}
                <div className={`absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold shadow-lg`}>
                  {step.step}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-6`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
