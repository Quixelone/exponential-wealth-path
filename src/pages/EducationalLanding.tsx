import { Helmet } from 'react-helmet-async';
import { LandingNavbar } from '@/components/educational-landing/LandingNavbar';
import { LandingHero } from '@/components/educational-landing/LandingHero';
import { LandingStats } from '@/components/educational-landing/LandingStats';
import { LandingFeatures } from '@/components/educational-landing/LandingFeatures';
import { LandingProfSatoshi } from '@/components/educational-landing/LandingProfSatoshi';
import { LandingHowItWorks } from '@/components/educational-landing/LandingHowItWorks';
import { LandingTestimonials } from '@/components/educational-landing/LandingTestimonials';
import { LandingPricing } from '@/components/educational-landing/LandingPricing';
import { LandingFinalCTA } from '@/components/educational-landing/LandingFinalCTA';
import { LandingFooter } from '@/components/educational-landing/LandingFooter';
import { useEffect } from 'react';

const EducationalLanding = () => {
  // Capture UTM parameters for marketing attribution
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const utmSource = searchParams.get('utm_source');
    const utmCampaign = searchParams.get('utm_campaign');
    const utmMedium = searchParams.get('utm_medium');

    if (utmSource) {
      // Save UTM data to localStorage for post-signup attribution
      localStorage.setItem('utm_data', JSON.stringify({
        source: utmSource,
        campaign: utmCampaign,
        medium: utmMedium,
        timestamp: Date.now(),
      }));

      // Track in Google Analytics if configured
      if (typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'landing_visit', {
          campaign_source: utmSource,
          campaign_name: utmCampaign,
          campaign_medium: utmMedium,
        });
      }
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Bitcoin Academy - Diventa un Esperto Bitcoin in 90 Giorni</title>
        <meta 
          name="description" 
          content="Impara il trading professionale di opzioni Bitcoin con la piattaforma gamificata n°1 in Italia. Teoria, pratica, simulazioni reali e certificazione ufficiale." 
        />
        <meta name="keywords" content="bitcoin, trading, opzioni, corso, formazione, cryptocurrency, blockchain" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Bitcoin Academy - Corso Trading Bitcoin" />
        <meta property="og:description" content="Diventa un trader professionista in 90 giorni con Prof Satoshi, il tuo tutor AI personale" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://finanzacreativa.live/educational" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bitcoin Academy - Corso Trading Bitcoin" />
        <meta name="twitter:description" content="Diventa un trader professionista in 90 giorni" />
      </Helmet>

      <div className="min-h-screen bg-slate-900">
        <LandingNavbar />
        <main>
          <LandingHero />
          <LandingStats />
          <LandingFeatures />
          <LandingProfSatoshi />
          <LandingHowItWorks />
          <LandingTestimonials />
          <LandingPricing />
          <LandingFinalCTA />
        </main>
        <LandingFooter />
      </div>
    </>
  );
};

export default EducationalLanding;
