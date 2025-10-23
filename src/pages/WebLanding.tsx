import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  );
};

export default WebLanding;
