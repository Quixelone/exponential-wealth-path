import { Card } from '@/components/ui/card';
import { motion } from 'motion/react';
import { BookOpen, Gamepad2, Trophy } from 'lucide-react';

export const LandingHowItWorks = () => {
  const steps = [
    {
      icon: BookOpen,
      step: '01',
      title: 'Onboarding AI',
      description: 'Prof Satoshi valuta il tuo livello e crea un percorso personalizzato.',
      color: 'from-purple-500 to-violet-500',
    },
    {
      icon: Gamepad2,
      step: '02',
      title: 'Impara & Pratica',
      description: 'Video lezioni, quiz e simulatore paper trading con dati reali.',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Trophy,
      step: '03',
      title: 'Diventa Master',
      description: 'Completa le sfide, guadagna badge e ottieni la certificazione.',
      color: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-800/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Da Zero a Master in{' '}
            <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              3 Semplici Step
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto"
          >
            Il nostro metodo provato per trasformarti da principiante a trader professionista
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connection Lines (desktop only) */}
          <div className="hidden md:block absolute top-1/4 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-amber-500 opacity-30" />

          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative"
            >
              <Card className="p-8 h-full bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                {/* Step Number Badge */}
                <div className={`absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold shadow-lg`}>
                  {step.step}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-6`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed">{step.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
