import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LandingNavbar from '@/components/landing/LandingNavbar';
import '@/styles/landing.css';
import LandingHero from '@/components/landing/LandingHero';
import ComparisonTable from '@/components/landing/ComparisonTable';
import HowItWorks from '@/components/landing/HowItWorks';
import DailyRoutine from '@/components/landing/DailyRoutine';
import TrainingProgram from '@/components/landing/TrainingProgram';
import CompoundInterestCalculator from '@/components/landing/CompoundInterestCalculator';
import RecommendedBrokers from '@/components/landing/RecommendedBrokers';
import PricingPlans from '@/components/landing/PricingPlans';
import FAQSection from '@/components/landing/FAQSection';
import Testimonials from '@/components/landing/Testimonials';
import FinalCTA from '@/components/landing/FinalCTA';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect logged users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main>
        <LandingHero />
        <ComparisonTable />
        <HowItWorks />
        <DailyRoutine />
        <TrainingProgram />
        <CompoundInterestCalculator />
        <RecommendedBrokers />
        <PricingPlans />
        <Testimonials />
        <FAQSection />
        <FinalCTA />
      </main>
    </div>
  );
};

export default Landing;
