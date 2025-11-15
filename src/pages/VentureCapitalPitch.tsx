import { Helmet } from 'react-helmet-async';
import { InvestorNavbar } from '@/components/investor-pitch/shared/InvestorNavbar';
import { InvestorFooter } from '@/components/investor-pitch/shared/InvestorFooter';
import { VCHero } from '@/components/investor-pitch/venture-capital/VCHero';
import { MarketOpportunity } from '@/components/investor-pitch/venture-capital/MarketOpportunity';
import { UnitEconomics } from '@/components/investor-pitch/venture-capital/UnitEconomics';
import { VCAsk } from '@/components/investor-pitch/venture-capital/VCAsk';
import { ContactForm } from '@/components/investor-pitch/shared/ContactForm';
import { SectionWrapper } from '@/components/investor-pitch/shared/SectionWrapper';

const VentureCapitalPitch = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Series A Investment - Finanzacreativa | €100B+ TAM Crypto Pension</title>
        <meta 
          name="description" 
          content="€500k-€2M Series A. 10x revenue growth YoY. €100B+ TAM. First EU crypto pension platform. 26:1 LTV:CAC ratio." 
        />
        <meta name="keywords" content="series a funding, venture capital, fintech investment, crypto pension, saas startup" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Finanzacreativa Series A - €100B+ Market Opportunity" />
        <meta property="og:description" content="Scale the first EU crypto pension platform. €500k-€2M for 15-25%. Data room available." />
        <meta property="og:image" content="https://finanzacreativa.live/og-investor-vc.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Finanzacreativa Series A Investment" />
        <meta name="twitter:description" content="€500k-€2M to scale €100B+ TAM crypto pension platform." />
      </Helmet>
      
      <InvestorNavbar variant="venture-capital" />
      
      <main>
        <VCHero />
        <MarketOpportunity />
        <UnitEconomics />
        <VCAsk />
        
        <SectionWrapper id="contact" className="bg-card">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Request Data Room Access
            </h2>
            <p className="text-xl text-muted-foreground">
              Full financial model, legal documents, and market analysis available under NDA.
            </p>
          </div>
          <ContactForm investorType="venture-capital" />
        </SectionWrapper>
      </main>
      
      <InvestorFooter />
    </div>
  );
};

export default VentureCapitalPitch;
