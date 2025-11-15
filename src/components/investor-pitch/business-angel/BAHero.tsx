import { Button } from '@/components/ui/button';
import { Play, TrendingUp } from 'lucide-react';
import { SectionWrapper } from '../shared/SectionWrapper';
import { PDFDownloadButton } from '../shared/PDFDownloadButton';

export const BAHero = () => {
  return (
    <SectionWrapper className="pt-32 pb-16 bg-gradient-to-b from-background to-card">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-primary font-medium">Seed Investment Opportunity</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Il Tuo Fondo Pensione{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Bitcoin
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground">
            Da €500 al mese a €600M in 10 anni. Join us in revolutionizing retirement investing with the Wheel Strategy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <a href="#ask">View Investment Terms</a>
            </Button>
            <PDFDownloadButton
              url="/docs/investor/business-angel-onepager.pdf"
              label="Download One-Pager"
              variant="outline"
            />
          </div>

          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
            <div>
              <div className="text-3xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground">Alpha Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">250+</div>
              <div className="text-sm text-muted-foreground">Waitlist</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">85+</div>
              <div className="text-sm text-muted-foreground">NPS Score</div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-video bg-card rounded-lg border border-border flex items-center justify-center group cursor-pointer hover:border-primary transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Play className="h-10 w-10 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Watch Founder Story</p>
              <p className="text-xs text-muted-foreground">(Coming soon)</p>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
