import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrendingUp, Brain, Shield, Clock, ArrowRight, Zap, Award, Users } from 'lucide-react';
import '@/styles/landing.css';

const LandingHero = () => {
  return (
    <section className="landing-page relative min-h-screen flex items-center overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 landing-gradient-bg" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 text-white">
            {/* Badge */}
            <div className="landing-fade-in">
              <div className="landing-badge landing-badge-gold inline-flex items-center gap-2 animate-pulse">
                <Zap className="h-4 w-4" fill="currentColor" />
                <span>6 MESI GRATIS - Offerta Limitata</span>
              </div>
            </div>
            
            {/* Hero Title */}
            <h1 className="landing-hero-title landing-fade-in text-white">
              Genera{' '}
              <span className="landing-gradient-text-gold font-black">
                0.20% Giornaliero
              </span>{' '}
              con le Opzioni Bitcoin
            </h1>
            
            {/* Subtitle */}
            <p className="landing-hero-subtitle landing-fade-in text-white/90 max-w-xl">
              <span className="font-bold text-white">Formazione Professionale</span> + 
              <span className="font-bold text-white"> Segnali AI</span> + 
              <span className="font-bold text-white"> Broker Raccomandati</span>.
              <br />
              <span className="text-xl font-semibold mt-2 inline-block border-b-2 border-yellow-400 pb-1">
                I tuoi soldi rimangono sempre nel tuo controllo.
              </span>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 landing-fade-in">
              <Link to="/auth" className="group">
                <button className="landing-cta-primary landing-cta-pulse flex items-center justify-center gap-2 w-full sm:w-auto min-h-[60px]">
                  <span>INIZIA GRATIS ORA</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <button 
                className="landing-cta-secondary flex items-center justify-center gap-2 min-h-[60px]"
                onClick={() => document.getElementById('come-funziona')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span>Scopri Come Funziona</span>
              </button>
            </div>

            {/* Key Features Pills */}
            <div className="flex flex-wrap gap-4 pt-4 landing-fade-in">
              <div className="landing-glass px-4 py-3 rounded-full flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-400" />
                <span className="text-sm font-semibold">Sicurezza Totale</span>
              </div>
              <div className="landing-glass px-4 py-3 rounded-full flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-semibold">Segnali AI Quotidiani</span>
              </div>
              <div className="landing-glass px-4 py-3 rounded-full flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-400" />
                <span className="text-sm font-semibold">Solo 15 Min/Giorno</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative landing-mockup-container landing-fade-in">
            {/* Main Dashboard Mockup */}
            <div className="landing-mockup landing-float">
              <div className="landing-glass-dark rounded-3xl p-6 shadow-2xl landing-shadow-colored">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                    <span className="font-bold text-white">Finanza Creativa</span>
                  </div>
                  <div className="landing-badge landing-badge-gold">
                    <Award className="h-3 w-3" />
                    <span className="text-xs">Premium</span>
                  </div>
                </div>

                {/* Performance Card */}
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 mb-4 border border-green-500/30">
                  <div className="text-sm text-green-300 mb-2">Rendimento Giornaliero</div>
                  <div className="text-5xl font-black text-white mb-1 landing-number">0.20%</div>
                  <div className="text-xs text-green-300">Target Medio</div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                    <div className="text-xs text-white/60 mb-1">1 Mese</div>
                    <div className="text-2xl font-bold text-green-400">+6%</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                    <div className="text-xs text-white/60 mb-1">6 Mesi</div>
                    <div className="text-2xl font-bold text-green-400">+40%</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                    <div className="text-xs text-white/60 mb-1">1 Anno</div>
                    <div className="text-2xl font-bold text-green-400">+100%</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                    <div className="text-xs text-white/60 mb-1">Segnali Oggi</div>
                    <div className="text-2xl font-bold text-blue-400">3</div>
                  </div>
                </div>

                {/* Chart Visualization */}
                <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-white/60">Andamento Capitale</span>
                    <span className="text-xs text-green-400 font-semibold">↗ +45.2%</span>
                  </div>
                  {/* Simple SVG Chart */}
                  <svg className="w-full h-20" viewBox="0 0 300 80" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 60 Q 30 55, 60 50 T 120 35 T 180 25 T 240 15 L 300 10 L 300 80 L 0 80 Z"
                      fill="url(#chartGradient)"
                    />
                    <path
                      d="M 0 60 Q 30 55, 60 50 T 120 35 T 180 25 T 240 15 L 300 10"
                      fill="none"
                      stroke="rgb(34, 197, 94)"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Floating Stats Badges */}
            <div className="absolute -left-6 top-1/4 landing-glass px-4 py-3 rounded-xl shadow-lg hidden lg:block">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <div>
                  <div className="text-xs text-white/60">Successo</div>
                  <div className="text-lg font-bold text-white">92%</div>
                </div>
              </div>
            </div>

            <div className="absolute -right-6 top-1/3 landing-glass px-4 py-3 rounded-xl shadow-lg hidden lg:block">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="text-xs text-white/60">Trader Attivi</div>
                  <div className="text-lg font-bold text-white">500+</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof Bar */}
        <div className="mt-16 lg:mt-24 pt-12 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="landing-fade-in">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2 landing-number">15.000+</div>
              <div className="text-sm text-white/70">Segnali Inviati</div>
            </div>
            <div className="landing-fade-in">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2 landing-number">500+</div>
              <div className="text-sm text-white/70">Trader Attivi</div>
            </div>
            <div className="landing-fade-in">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2 landing-number">92%</div>
              <div className="text-sm text-white/70">Tasso di Successo</div>
            </div>
            <div className="landing-fade-in">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2 landing-number">4.8★</div>
              <div className="text-sm text-white/70">Rating Medio</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
