import { SectionWrapper } from '../shared/SectionWrapper';
import { Rocket, Users, Code, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const BAAsk = () => {
  const useOfFunds = [
    {
      icon: Code,
      percentage: 50,
      area: 'Product Development',
      description: 'AI signals V2, mobile app, UX improvements'
    },
    {
      icon: Users,
      percentage: 30,
      area: 'Marketing & Content',
      description: 'YouTube, TikTok, influencer partnerships'
    },
    {
      icon: Scale,
      percentage: 20,
      area: 'Operations & Legal',
      description: 'Compliance, accounting, legal structure'
    }
  ];

  const benefits = [
    'Board observer seat',
    'Monthly personal updates',
    'Network effects (introduce altri investitori)',
    'Lifetime FREE account',
    'Co-creation: ascolto feedback investitori',
    'Early access to new features'
  ];

  return (
    <SectionWrapper id="ask" className="bg-gradient-to-b from-background to-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm mb-6">
            <Rocket className="h-4 w-4 text-primary" />
            <span className="text-primary font-medium">Seed Investment Round</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Join Us in Building the Future
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stiamo cercando business angels che credono nella nostra visione e vogliono essere parte del journey.
          </p>
        </div>

        {/* The Ask */}
        <div className="bg-card border-2 border-primary rounded-lg p-12 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-8">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Seeking</div>
              <div className="text-4xl font-bold text-primary">€50k - €150k</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Equity Offered</div>
              <div className="text-4xl font-bold text-primary">10-15%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Valuation</div>
              <div className="text-4xl font-bold text-primary">€1M</div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              Minimum ticket: €10k | Target close: Q1 2025
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="#contact">Let's Have a Coffee</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/docs/investor/business-angel-onepager.pdf" download>
                  Download One-Pager
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Use of Funds */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-8 text-center">Use of Funds</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {useOfFunds.map((item, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary">{item.percentage}%</div>
                </div>
                <h4 className="text-lg font-semibold mb-2">{item.area}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-primary/5 rounded-lg p-8 border border-primary/20">
          <h3 className="text-2xl font-bold mb-6 text-center">What You Get as an Angel Investor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                <span className="text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-lg">
            Non è solo un investimento. È un <strong className="text-foreground">partnership</strong> per cambiare il futuro delle pensioni.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
};
