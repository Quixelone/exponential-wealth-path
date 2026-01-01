import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Sparkles, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const LandingFinalCTA = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/education');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            Pronto a Diventare un{' '}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Master Trader
            </span>
            ?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-purple-100/80 mb-10 leading-relaxed"
          >
            Unisciti a oltre 1,600 studenti che stanno già padroneggiando 
            la Bitcoin Wheel Strategy con Prof Satoshi.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-white text-purple-900 hover:bg-purple-50 text-lg px-10 py-7 rounded-xl font-semibold shadow-lg shadow-white/20"
            >
              <Sparkles className="mr-2 w-5 h-5" />
              Inizia Ora Gratis
            </Button>
            
            {!user && (
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/auth')}
                className="border-white/30 text-white hover:bg-white/10 text-lg px-10 py-7 rounded-xl"
              >
                <LogIn className="mr-2 w-5 h-5" />
                Hai già un account? Accedi
              </Button>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-sm text-purple-200/60"
          >
            Nessuna carta di credito richiesta • Inizia subito gratis
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};
