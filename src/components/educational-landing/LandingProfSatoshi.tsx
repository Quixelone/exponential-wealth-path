import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { MessageSquare, Lightbulb, TrendingUp, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import profSatoshiHappy from '@/assets/educational-landing/prof-satoshi-happy.png';
import { useParallax } from '@/hooks/useParallax';

export const LandingProfSatoshi = () => {
  const navigate = useNavigate();
  const { ref: mascotRef, y: mascotY } = useParallax({ speed: 0.3, direction: 'up' });

  const aiFeatures = [
    {
      icon: MessageSquare,
      title: 'Risposte Istantanee',
      description: 'Fai domande in qualsiasi momento e ricevi spiegazioni dettagliate',
    },
    {
      icon: Lightbulb,
      title: 'Suggerimenti Personalizzati',
      description: 'Consigli basati sul tuo stile di trading e livello di esperienza',
    },
    {
      icon: TrendingUp,
      title: 'Analisi di Mercato',
      description: 'Comprendi i movimenti del mercato con spiegazioni semplici',
    },
    {
      icon: CheckCircle,
      title: 'Feedback Continuo',
      description: 'Correggi gli errori e migliora con ogni operazione',
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Mascot with parallax */}
          <motion.div
            ref={mascotRef}
            style={{ y: mascotY }}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <Card className="p-12 bg-gradient-to-br from-primary/10 to-purple-600/10 border-primary/20 overflow-hidden">
              <div className="text-center">
                <motion.img 
                  src={profSatoshiHappy} 
                  alt="Prof Satoshi - AI Bitcoin Trading Assistant" 
                  className="w-80 h-80 mx-auto object-contain mb-6"
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <h3 className="text-3xl font-bold mb-4">Prof Satoshi</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Ciao! Sono il tuo assistente AI personale. Sono qui per guidarti nel mondo del trading Bitcoin 
                  con spiegazioni chiare e consigli pratici.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">AI Powered</span>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-600 text-sm">Sempre Disponibile</span>
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-600 text-sm">Personalizzato</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Right - Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Incontra{' '}
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Prof Satoshi
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Il primo tutor AI specializzato in trading Bitcoin. Disponibile 24/7 per rispondere alle tue domande 
                e accelerare il tuo apprendimento.
              </p>
            </div>

            <div className="space-y-4">
              {aiFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
            >
              Inizia a Parlare con Prof Satoshi
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
