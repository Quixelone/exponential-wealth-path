import { Helmet } from 'react-helmet-async';
import { InvestorNavbar } from '@/components/investor-pitch/shared/InvestorNavbar';
import { InvestorFooter } from '@/components/investor-pitch/shared/InvestorFooter';
import { BAHero } from '@/components/investor-pitch/business-angel/BAHero';
import { FounderStory } from '@/components/investor-pitch/business-angel/FounderStory';
import { ProblemLived } from '@/components/investor-pitch/business-angel/ProblemLived';
import { TeamJourney } from '@/components/investor-pitch/business-angel/TeamJourney';
import { EarlyWins } from '@/components/investor-pitch/business-angel/EarlyWins';
import { VisionSection } from '@/components/investor-pitch/business-angel/VisionSection';
import { BAAsk } from '@/components/investor-pitch/business-angel/BAAsk';
import { ContactForm } from '@/components/investor-pitch/shared/ContactForm';
import { SectionWrapper } from '@/components/investor-pitch/shared/SectionWrapper';

const BusinessAngelPitch = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Business Angel Investment Opportunity - Finanzacreativa</title>
        <meta 
          name="description" 
          content="Join us as an angel investor. €50k-€150k seed round. First Bitcoin pension platform in Italy. 12 passionate early users, 85+ NPS score." 
        />
        <meta name="keywords" content="angel investment, seed round, bitcoin startup, fintech italy, pension innovation" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Invest in the Future of Pensions - Finanzacreativa" />
        <meta property="og:description" content="Be part of the revolution. €50k-€150k for 10-15%. First mover advantage in €100B+ market." />
        <meta property="og:image" content="https://finanzacreativa.live/og-investor-ba.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Finanzacreativa - Angel Investment Opportunity" />
        <meta name="twitter:description" content="€50k-€150k seed round for Bitcoin pension platform. Join us." />
      </Helmet>
      
      <InvestorNavbar variant="business-angel" />
      
      <main>
        <BAHero />
        <FounderStory />
        <ProblemLived />
        <TeamJourney />
        <EarlyWins />
        <VisionSection />
        <BAAsk />
        
        <SectionWrapper id="contact" className="bg-card">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Let's Have a Coffee
            </h2>
            <p className="text-xl text-muted-foreground">
              Non è una call formale. È una conversazione tra persone che credono nel futuro delle pensioni Bitcoin.
            </p>
          </div>
          <ContactForm investorType="business-angel" />
        </SectionWrapper>
      </main>
      
      <InvestorFooter />
    </div>
  );
};

export default BusinessAngelPitch;
