import { Button } from '@/components/ui/button';
import { TrendingUp, Users, DollarSign } from 'lucide-react';
import { SectionWrapper } from '../shared/SectionWrapper';
import { AnimatedCounter } from '../shared/AnimatedCounter';

export const VCHero = () => {
  return (
    <SectionWrapper className="pt-32 pb-16 bg-gradient-to-b from-background to-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm mb-6">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-primary font-medium">Series A Investment Opportunity</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            €100B+ TAM in{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Crypto Pension Market
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            First-mover advantage in EU Bitcoin pension platform. 10x revenue growth YoY. Scalable SaaS model with 85% margin.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="#ask">View Investment Terms</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#contact">Request Data Room</a>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div className="text-3xl font-bold mb-1">
              <AnimatedCounter end={2500} prefix="€" />
            </div>
            <div className="text-sm text-muted-foreground">MRR</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div className="text-3xl font-bold mb-1">
              <AnimatedCounter end={35} suffix="%" />
            </div>
            <div className="text-sm text-muted-foreground">MoM Growth</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="text-3xl font-bold mb-1">
              <AnimatedCounter end={26} decimals={1} />
            </div>
            <div className="text-sm text-muted-foreground">LTV:CAC Ratio</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="h-6 w-6 text-accent" />
            </div>
            <div className="text-3xl font-bold mb-1">
              <AnimatedCounter end={85} suffix="%" />
            </div>
            <div className="text-sm text-muted-foreground">Unit Margin</div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
