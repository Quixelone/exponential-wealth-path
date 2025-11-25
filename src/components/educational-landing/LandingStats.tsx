import { Card } from '@/components/ui/card';
import { motion } from 'motion/react';
import { AnimatedCounter } from './AnimatedCounter';
import { Users, Trophy, Target, Zap } from 'lucide-react';

export const LandingStats = () => {
  const stats = [
    {
      icon: Users,
      value: 1247,
      label: 'Studenti Attivi',
      color: 'text-blue-500',
      suffix: '+',
    },
    {
      icon: Trophy,
      value: 892,
      label: 'Trader Certificati',
      color: 'text-yellow-500',
      suffix: '',
    },
    {
      icon: Target,
      value: 95,
      label: 'Tasso di Successo',
      color: 'text-green-500',
      suffix: '%',
    },
    {
      icon: Zap,
      value: 240,
      label: 'Ore di Contenuti',
      color: 'text-purple-500',
      suffix: 'h',
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
