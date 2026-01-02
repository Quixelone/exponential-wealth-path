import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import WebNavbar from '@/components/web-landing/WebNavbar';
import WebHero from '@/components/web-landing/WebHero';
import PlatformTech from '@/components/web-landing/PlatformTech';
import WheelStrategy from '@/components/web-landing/WheelStrategy';
import DailyRoutine from '@/components/web-landing/DailyRoutine';
import PricingTiers from '@/components/web-landing/PricingTiers';
import Comparison from '@/components/web-landing/Comparison';
import DemoTestimonials from '@/components/web-landing/DemoTestimonials';
import WebFAQ from '@/components/web-landing/WebFAQ';
import FinalCTA from '@/components/web-landing/FinalCTA';

const WebLanding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  return (
    <>
      <Helmet>
        <title>Finanza Creativa - Piattaforma AI Trading Opzioni Bitcoin</title>
        <meta name="description" content="La prima piattaforma che ti rende autonomo nel trading opzioni Bitcoin. Tecnologia AI + formazione Wheel Strategy. 6 mesi gratis. Non gestiamo i tuoi soldi." />
        <meta name="keywords" content="trading bitcoin, opzioni bitcoin, wheel strategy, trading autonomo, piattaforma trading, AI trading, formazione trading" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="theme-color" content="#4F46E5" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Open Graph per Facebook/Meta Ads */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Finanza Creativa - Piattaforma AI Trading Bitcoin" />
        <meta property="og:description" content="La prima piattaforma che ti rende autonomo nel trading. Tecnologia + segnali AI + formazione professionale Wheel Strategy." />
        <meta property="og:url" content="https://web.finanzacreativa.live/web" />
        <meta property="og:site_name" content="Finanza Creativa" />
        
        {/* Twitter/X Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Finanza Creativa - Piattaforma AI Trading Bitcoin" />
        <meta name="twitter:description" content="Tecnologia + formazione per trading opzioni Bitcoin autonomo. 6 mesi gratis." />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://web.finanzacreativa.live/web" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <WebNavbar />
        <main>
          <WebHero />
          <PlatformTech />
          <WheelStrategy />
          <DailyRoutine />
          <PricingTiers />
          <Comparison />
          <DemoTestimonials />
          <WebFAQ />
          <FinalCTA />
        </main>
      </div>
    </>
  );
};

export default WebLanding;
