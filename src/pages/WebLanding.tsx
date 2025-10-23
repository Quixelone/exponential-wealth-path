import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="theme-color" content="#4F46E5" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
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
