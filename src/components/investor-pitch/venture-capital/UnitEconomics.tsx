import { SectionWrapper } from '../shared/SectionWrapper';
import { DollarSign, TrendingUp, Clock } from 'lucide-react';
import { AnimatedCounter } from '../shared/AnimatedCounter';

export const UnitEconomics = () => {
  return (
    <SectionWrapper id="economics">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Best-in-Class Unit Economics
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            SaaS model with subscription + variable fees delivers exceptional margins and rapid payback.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-5xl font-bold mb-2">
              <AnimatedCounter end={45} prefix="€" />
            </div>
            <div className="text-lg font-semibold mb-2">CAC</div>
            <div className="text-sm text-muted-foreground">Customer Acquisition Cost</div>
            <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
              <div>Organic: €20</div>
              <div>Paid: €70</div>
              <div>Blended: €45</div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
            <div className="text-5xl font-bold mb-2">
              <AnimatedCounter end={1200} prefix="€" />
            </div>
            <div className="text-lg font-semibold mb-2">LTV</div>
            <div className="text-sm text-muted-foreground">Lifetime Value</div>
            <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
              <div>Avg subscription: €30/mo</div>
              <div>Retention: 40 months</div>
              <div>LTV: €1,200</div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <div className="text-5xl font-bold mb-2">
              <AnimatedCounter end={1.5} decimals={1} />
            </div>
            <div className="text-lg font-semibold mb-2">Payback</div>
            <div className="text-sm text-muted-foreground">Months to Break-Even</div>
            <div className="mt-4 pt-4 border-t border-border text-xs text-accent font-semibold">
              Industry best: &lt; 2 months ✓
            </div>
          </div>
        </div>

        {/* LTV:CAC Ratio */}
        <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg p-8 border border-accent/20 text-center mb-12">
          <h3 className="text-3xl font-bold mb-2">
            <AnimatedCounter end={26.6} decimals={1} suffix=":1" />
          </h3>
          <p className="text-xl font-semibold mb-2">LTV:CAC Ratio</p>
          <p className="text-muted-foreground">
            Industry benchmark: 3:1 good, 5:1 excellent. We're at <strong className="text-foreground">26.6:1</strong>
          </p>
        </div>

        {/* Detailed Breakdown */}
        <div className="bg-card border border-border rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-6">Revenue Model Breakdown</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Base Subscription</div>
                <div className="text-sm text-muted-foreground">€9.90/month (all tiers)</div>
              </div>
              <div className="text-2xl font-bold">40%</div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Hedge Coverage Fee</div>
                <div className="text-sm text-muted-foreground">15-8% of capital (decreasing scale)</div>
              </div>
              <div className="text-2xl font-bold">45%</div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Insurance Premium</div>
                <div className="text-sm text-muted-foreground">0.15% on low volatility days</div>
              </div>
              <div className="text-2xl font-bold">10%</div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Premium Features</div>
                <div className="text-sm text-muted-foreground">AI signals, coaching, white-label</div>
              </div>
              <div className="text-2xl font-bold">5%</div>
            </div>
          </div>
        </div>

        {/* Unit Margin */}
        <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Unit Margin</div>
              <div className="text-sm text-muted-foreground">COGS: €4.5/user/mo (cloud infra) | Revenue: €30/mo</div>
            </div>
            <div className="text-4xl font-bold text-accent">
              <AnimatedCounter end={85} suffix="%" />
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
