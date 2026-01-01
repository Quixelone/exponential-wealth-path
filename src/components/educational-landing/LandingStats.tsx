import { Card } from '@/components/ui/card';
import { motion } from 'motion/react';
import { AnimatedCounter } from './AnimatedCounter';
import { Users, TrendingUp, Target, Zap } from 'lucide-react';

export const LandingStats = () => {
  const stats = [
    {
      icon: Users,
      value: 1665,
      label: 'Studenti Attivi',
      suffix: '+',
      gradient: 'from-purple-500 to-violet-500',
    },
    {
      icon: TrendingUp,
      value: 15,
      label: 'APY Medio',
      suffix: '%',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Target,
      value: 5,
      label: 'Missioni Giornaliere',
      prefix: '0/',
      suffix: '',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: Zap,
      value: 83275,
      label: 'XP Generati',
      suffix: '+',
      gradient: 'from-indigo-500 to-purple-500',
    },
  ];

  return (
    <section className="py-16 bg-slate-900/50 border-y border-slate-800/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-5 md:p-6 text-center bg-slate-800/40 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/60 transition-all duration-300">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">
                  {stat.prefix}
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
