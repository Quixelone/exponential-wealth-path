import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { Sparkles, Play, Flame, Trophy, Target, TrendingUp } from 'lucide-react';
import { FloatingOrb } from './FloatingOrb';
import profSatoshiExcited from '@/assets/educational-landing/prof-satoshi-excited.png';

export const LandingHero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { scrollY } = useScroll();
  
  const orb1Y = useTransform(scrollY, [0, 1000], [0, -150]);
  const orb2Y = useTransform(scrollY, [0, 1000], [0, -100]);
  const orb3Y = useTransform(scrollY, [0, 1000], [0, -80]);
  
  const dashboardY = useTransform(scrollY, [0, 500], [0, 30]);

  const handleGetStarted = () => {
    if (user) {
      navigate('/education');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Parallax Background Orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div style={{ y: orb1Y }} className="absolute top-20 left-[10%]">
          <FloatingOrb size={400} color="rgba(139, 92, 246, 0.15)" delay={0} />
        </motion.div>
        <motion.div style={{ y: orb2Y }} className="absolute bottom-20 right-[10%]">
          <FloatingOrb size={350} color="rgba(99, 102, 241, 0.12)" delay={2} />
        </motion.div>
        <motion.div style={{ y: orb3Y }} className="absolute top-1/3 right-1/4">
          <FloatingOrb size={280} color="rgba(168, 85, 247, 0.1)" delay={4} />
        </motion.div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-8 text-center lg:text-left"
          >
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Il Corso #1 per Bitcoin Options Trading
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-white">
              Impara la{' '}
              <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Bitcoin Wheel Strategy
              </span>{' '}
              con il Metodo Più Efficace
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Il corso gamificato con AI tutor che ti trasforma da principiante a trader professionista. 
              Teoria, pratica e certificazione ufficiale.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-purple-500/25"
              >
                Accedi Gratuitamente
                <Sparkles className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-slate-600 text-slate-200 hover:bg-slate-800 text-lg px-8 py-6 rounded-xl"
              >
                <Play className="mr-2 w-5 h-5" />
                Guarda la Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-8 pt-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">1,665+</div>
                <div className="text-sm text-slate-400">Studenti Attivi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">4.9/5</div>
                <div className="text-sm text-slate-400">Rating Medio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">€2.4M</div>
                <div className="text-sm text-slate-400">Volume Trading</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ y: dashboardY }}
            className="relative"
          >
            <Card className="p-6 bg-slate-800/60 backdrop-blur-xl border-slate-700/50 rounded-2xl shadow-2xl">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Livello 17</div>
                    <div className="text-xs text-slate-400">Master Trader</div>
                  </div>
                </div>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                  <Flame className="w-3 h-3 mr-1" />
                  10x Streak
                </Badge>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">15%</div>
                  <div className="text-xs text-slate-400">APY Medio</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-400">0/5</div>
                  <div className="text-xs text-slate-400">Missioni</div>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-400">83K+</div>
                  <div className="text-xs text-slate-400">XP Totale</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Prossimo livello</span>
                  <span className="text-purple-400">2,450 / 3,000 XP</span>
                </div>
                <div className="h-3 bg-slate-900/50 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '82%' }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                </div>
              </div>

              {/* Prof Satoshi Chat */}
              <div className="flex gap-4 bg-slate-900/50 rounded-xl p-4">
                <motion.img 
                  src={profSatoshiExcited} 
                  alt="Prof Satoshi" 
                  className="w-16 h-16 object-contain"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="flex-1">
                  <div className="text-sm text-slate-300 bg-slate-800/80 rounded-xl p-3 relative">
                    <div className="absolute -left-2 top-3 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-slate-800/80 border-b-8 border-b-transparent" />
                    "Ottimo lavoro! Hai completato il modulo sulla Wheel Strategy. Pronto per la simulazione?"
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-300">AI Powered</Badge>
                    <Badge variant="outline" className="text-xs border-emerald-500/50 text-emerald-300">24/7 Disponibile</Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Floating Badges */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4"
            >
              <Card className="px-4 py-2 bg-amber-500/90 border-0 shadow-lg shadow-amber-500/30">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  10x Master Trader
                </div>
              </Card>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
              className="absolute -bottom-4 -left-4"
            >
              <Card className="px-4 py-2 bg-purple-500/90 border-0 shadow-lg shadow-purple-500/30">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Target className="w-4 h-4" />
                  Level 17
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
