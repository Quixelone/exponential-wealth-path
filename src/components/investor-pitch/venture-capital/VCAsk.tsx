import { SectionWrapper } from '../shared/SectionWrapper';
import { Rocket, Code, Users, Scale, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const VCAsk = () => {
  const useOfFunds = [
    {
      icon: Code,
      percentage: 40,
      area: 'Engineering',
      description: 'Scale platform, mobile app, API development'
    },
    {
      icon: Users,
      percentage: 30,
      area: 'Sales & Marketing',
      description: 'Paid ads, partnerships, content marketing'
    },
    {
      icon: Scale,
      percentage: 15,
      area: 'Operations',
      description: 'Legal, compliance, accounting, HR'
    },
    {
      icon: TrendingUp,
      percentage: 15,
      area: 'Customer Success & Reserve',
      description: 'Onboarding, support, emergency fund'
    }
  ];

  const milestones = [
    '2,000 paying users',
    '€50k MRR',
    'Break-even cash flow',
    'Launch in 3 EU countries',
    'Team scale to 12 people',
    'Mobile app launch'
  ];

  const investorBenefits = [
    'Board seat (lead investor)',
    'Monthly financial reports',
    'Quarterly business reviews',
    'Pro-rata rights (follow-on rounds)',
    'Information rights',
    'Veto rights on material changes'
  ];

  return (
    <SectionWrapper id="ask" className="bg-gradient-to-b from-background to-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm mb-6">
            <Rocket className="h-4 w-4 text-primary" />
            <span className="text-primary font-medium">Series A Investment Round</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Join Us in Scaling the Platform
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're seeking strategic partners to accelerate our growth and capture the European crypto pension market.
          </p>
        </div>

        {/* The Ask */}
        <div className="bg-card border-2 border-primary rounded-lg p-12 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-8">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Seeking</div>
              <div className="text-5xl font-bold text-primary">€500k-€2M</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Equity Offered</div>
              <div className="text-5xl font-bold text-primary">15-25%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Pre-Money Valuation</div>
              <div className="text-5xl font-bold text-primary">€2-8M</div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              Target close: Q2 2025 | Board structure: 2 founders, 2 investors, 1 independent
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="#contact">Schedule Due Diligence Call</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/docs/investor/venture-capital-executive-summary.pdf" download>
                  Download Executive Summary
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Use of Funds */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-8 text-center">Use of Funds (12 Months)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Key Milestones */}
        <div className="bg-card border border-border rounded-lg p-8 mb-12">
          <h3 className="text-2xl font-bold mb-6">Key Milestones (12 Months Post-Funding)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                <span className="text-muted-foreground">{milestone}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Investor Benefits */}
        <div className="bg-primary/5 rounded-lg p-8 border border-primary/20">
          <h3 className="text-2xl font-bold mb-6 text-center">Investor Benefits & Rights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {investorBenefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                <span className="text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 bg-background rounded-lg border border-border">
            <h4 className="font-semibold mb-2">Expected Return Potential</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-accent">50x</div>
                <div className="text-sm text-muted-foreground">Return in 5 years</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">115%</div>
                <div className="text-sm text-muted-foreground">IRR</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">€50M</div>
                <div className="text-sm text-muted-foreground">Conservative exit valuation</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
