import { SectionWrapper } from '../shared/SectionWrapper';
import { Globe, Target, Zap } from 'lucide-react';
import { AnimatedCounter } from '../shared/AnimatedCounter';

export const MarketOpportunity = () => {
  return (
    <SectionWrapper id="market" className="bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            €100B+ Market Opportunity
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The convergence of pension crisis and crypto adoption creates a massive addressable market in EU.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* TAM */}
          <div className="bg-background border border-border rounded-lg p-8 hover:border-primary transition-colors">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <div className="text-4xl font-bold mb-2">
              <AnimatedCounter end={645} suffix="B" prefix="€" />
            </div>
            <h3 className="text-xl font-semibold mb-3">TAM</h3>
            <p className="text-muted-foreground mb-4">Total Addressable Market</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• EU pension market: €4.3T</li>
              <li>• Crypto adoption: 15% by 2030</li>
              <li>• Cross-section: €645B</li>
            </ul>
          </div>

          {/* SAM */}
          <div className="bg-background border border-border rounded-lg p-8 hover:border-primary transition-colors">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-6">
              <Target className="h-8 w-8 text-accent" />
            </div>
            <div className="text-4xl font-bold mb-2">
              <AnimatedCounter end={20} suffix="B" prefix="€" />
            </div>
            <h3 className="text-xl font-semibold mb-3">SAM</h3>
            <p className="text-muted-foreground mb-4">Serviceable Addressable Market</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Italy, Spain, Germany</li>
              <li>• Age 25-45 segment</li>
              <li>• Crypto-curious: €20B</li>
            </ul>
          </div>

          {/* SOM */}
          <div className="bg-background border border-border rounded-lg p-8 hover:border-primary transition-colors">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <div className="text-4xl font-bold mb-2">
              <AnimatedCounter end={1} suffix="B" prefix="€" />
            </div>
            <h3 className="text-xl font-semibold mb-3">SOM</h3>
            <p className="text-muted-foreground mb-4">Serviceable Obtainable Market</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 5% market share in 5 years</li>
              <li>• First-mover advantage</li>
              <li>• Conservative estimate</li>
            </ul>
          </div>
        </div>

        {/* Market Drivers */}
        <div className="bg-primary/5 rounded-lg p-8 border border-primary/20">
          <h3 className="text-2xl font-bold mb-6 text-center">Market Drivers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Pension Crisis</h4>
              <p className="text-sm text-muted-foreground">
                Traditional pension funds delivering -2% real returns. Gen Z/Millennials seeking alternatives.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Crypto Adoption</h4>
              <p className="text-sm text-muted-foreground">
                15% EU population owns crypto. Bitcoin becoming mainstream asset class.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Regulatory Clarity</h4>
              <p className="text-sm text-muted-foreground">
                MiCA regulation provides legal framework for crypto services in EU.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
