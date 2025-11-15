import { SectionWrapper } from '../shared/SectionWrapper';
import { Target, Rocket, Globe, Award } from 'lucide-react';

export const VisionSection = () => {
  const milestones = [
    {
      icon: Target,
      year: '2025 Q1-Q2',
      title: 'Product-Market Fit',
      goals: ['100 paying users', 'Refine onboarding flow', 'Launch referral program', 'Content marketing (YouTube, TikTok)']
    },
    {
      icon: Rocket,
      year: '2025 Q3-Q4',
      title: 'Growth Acceleration',
      goals: ['500 users milestone', 'Partnerships (Binance, Coinbase affiliates)', 'Expand to Spain & Germany', 'Team: 2 devs, 1 marketer']
    },
    {
      icon: Globe,
      year: '2026',
      title: 'European Scale',
      goals: ['2,000 users across 3 countries', 'Paid advertising campaigns', 'Influencer partnerships', 'Team expansion: 10 people']
    },
    {
      icon: Award,
      year: '2027+',
      title: 'Market Leadership',
      goals: ['10,000+ users', 'B2B API for exchanges', 'White-label licensing', 'Series A fundraising']
    }
  ];

  return (
    <SectionWrapper id="vision" className="bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            La Visione: Dove Vogliamo Arrivare
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Non vogliamo solo creare una piattaforma. Vogliamo essere <strong>il riferimento europeo</strong> per il pension planning su Bitcoin.
          </p>
        </div>

        <div className="space-y-8">
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className="bg-background border border-border rounded-lg p-8 hover:border-primary transition-colors"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                    <milestone.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm font-semibold text-primary px-3 py-1 bg-primary/10 rounded-full">
                      {milestone.year}
                    </span>
                    <h3 className="text-2xl font-bold">{milestone.title}</h3>
                  </div>
                  
                  <ul className="space-y-2">
                    {milestone.goals.map((goal, goalIndex) => (
                      <li key={goalIndex} className="flex items-center gap-3 text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-primary/20">
          <h3 className="text-2xl font-bold mb-4 text-center">Il Nostro "Perché"</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">€100B+</div>
              <div className="text-sm text-muted-foreground">Addressable market in EU</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">First Mover</div>
              <div className="text-sm text-muted-foreground">Nessun competitor diretto in EU</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10x</div>
              <div className="text-sm text-muted-foreground">Potential growth nei prossimi 5 anni</div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};
