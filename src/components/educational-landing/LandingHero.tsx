import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';
import { FloatingOrb } from './FloatingOrb';
import profSatoshiExcited from '@/assets/educational-landing/prof-satoshi-excited.png';
import { useParallax } from '@/hooks/useParallax';

export const LandingHero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Parallax setup
  const { scrollY } = useScroll();
  
  // Multi-layer parallax with different speeds
  const orb1Y = useTransform(scrollY, [0, 1000], [0, -150]);
  const orb1Scale = useTransform(scrollY, [0, 500], [1, 1.3]);
  
  const orb2Y = useTransform(scrollY, [0, 1000], [0, -100]);
  const orb2X = useTransform(scrollY, [0, 1000], [0, 50]);
  
  const orb3Y = useTransform(scrollY, [0, 1000], [0, -80]);
  const orb3Rotate = useTransform(scrollY, [0, 1000], [0, 15]);
  
  // Mascot parallax (inverse - floats up)
  const mascotY = useTransform(scrollY, [0, 500], [0, -40]);
  const mascotRotate = useTransform(scrollY, [0, 500], [0, -3]);
  
  // Feature cards parallax
  const card1Y = useTransform(scrollY, [0, 500], [0, 60]);
  const card1Rotate = useTransform(scrollY, [0, 500], [0, -2]);
  
  const card2Y = useTransform(scrollY, [0, 500], [0, 50]);
  const card2Rotate = useTransform(scrollY, [0, 500], [0, 3]);

  const handleGetStarted = () => {
    if (user) {
      navigate('/education');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Parallax Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div style={{ y: orb1Y, scale: orb1Scale }} className="absolute top-20 left-10">
          <FloatingOrb size={400} color="hsl(var(--primary))" delay={0} />
        </motion.div>
        <motion.div style={{ y: orb2Y, x: orb2X }} className="absolute bottom-20 right-10">
          <FloatingOrb size={300} color="hsl(var(--purple-600))" delay={2} />
        </motion.div>
        <motion.div style={{ y: orb3Y, rotate: orb3Rotate }} className="absolute top-1/2 left-1/2">
          <FloatingOrb size={350} color="hsl(var(--orange-500))" delay={4} />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Formazione Professionale Bitcoin
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Diventa un{' '}
              <span className="bg-gradient-to-r from-primary via-purple-600 to-orange-500 bg-clip-text text-transparent">
                Esperto Bitcoin
              </span>{' '}
              in 90 Giorni
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed">
              Impara a fare trading professionale di opzioni Bitcoin con la nostra piattaforma gamificata. 
              Teoria, pratica e simulazioni reali con Prof Satoshi, il tuo tutor AI.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-lg px-8 py-6"
              >
                Inizia Gratis
                <Zap className="ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-lg px-8 py-6"
              >
                Scopri Come Funziona
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold">1,247</div>
                <div className="text-sm text-muted-foreground">Studenti Attivi</div>
              </div>
              <div>
                <div className="text-3xl font-bold">4.9/5</div>
                <div className="text-sm text-muted-foreground">Rating Medio</div>
              </div>
              <div>
                <div className="text-3xl font-bold">€2.4M</div>
                <div className="text-sm text-muted-foreground">Volume Trading</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Mascot & Feature Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Mascot with parallax */}
            <motion.div 
              style={{ y: mascotY, rotate: mascotRotate }}
              className="relative mx-auto w-full max-w-md"
            >
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-purple-600/5 border-primary/20 overflow-hidden">
                <div className="text-center space-y-4">
                  <motion.img 
                    src={profSatoshiExcited} 
                    alt="Prof Satoshi - Your AI Bitcoin Trading Tutor" 
                    className="w-64 h-64 mx-auto object-contain"
                    animate={{ 
                      y: [0, -15, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <h3 className="text-2xl font-bold">Prof Satoshi</h3>
                  <p className="text-muted-foreground">Il tuo tutor AI personale ti guida passo dopo passo</p>
                </div>
              </Card>

              {/* Floating Feature Cards with parallax */}
              <motion.div
                style={{ y: card1Y, rotate: card1Rotate }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4"
              >
                <Card className="p-4 bg-background shadow-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-green-500" size={20} />
                    <span className="font-semibold text-sm">+127% ROI</span>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                style={{ y: card2Y, rotate: card2Rotate }}
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4"
              >
                <Card className="p-4 bg-background shadow-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="text-primary" size={20} />
                    <span className="font-semibold text-sm">100% Sicuro</span>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
