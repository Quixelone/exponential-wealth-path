import { SectionWrapper } from '../shared/SectionWrapper';
import { Linkedin } from 'lucide-react';

export const TeamJourney = () => {
  const team = [
    {
      name: 'Luigi Coccimiglio',
      role: 'CEO & Founder',
      bio: '15+ anni in finanza e crypto. Ex analista senior in leading investment bank. Ha testato la Wheel Strategy sui suoi fondi personali per 3 anni prima di lanciare Finanzacreativa.',
      image: '/placeholder.svg',
      linkedin: '#'
    },
    {
      name: 'Francesco Coccimiglio',
      role: 'CTO',
      bio: 'Full-stack developer con expertise in blockchain e algoritmi AI. Ha costruito la piattaforma da zero con focus su scalabilità e sicurezza.',
      image: '/placeholder.svg',
      linkedin: '#'
    },
    {
      name: 'Michele Petrillo',
      role: 'Head of Trading',
      bio: 'Options trader con 10+ anni di esperienza. Expert della Wheel Strategy. Gestisce i segnali AI e la formazione degli utenti.',
      image: '/placeholder.svg',
      linkedin: '#'
    },
    {
      name: 'Maria Rossi',
      role: 'Financial Advisor',
      bio: '20+ anni in asset management. Ex CFO di compagnia assicurativa. Porta esperienza in compliance e gestione del rischio.',
      image: '/placeholder.svg',
      linkedin: '#'
    }
  ];

  return (
    <SectionWrapper id="team" className="bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Il Team che Rende Possibile Tutto Questo
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Non siamo solo developer. Siamo trader, analisti finanziari, educator. Gente che ha vissuto il problema e ha costruito la soluzione.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {team.map((member, index) => (
            <div
              key={index}
              className="bg-background border border-border rounded-lg p-8 hover:border-primary transition-colors"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full bg-muted overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  </div>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground leading-relaxed">{member.bio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 bg-primary/5 rounded-lg border border-primary/20 text-center">
          <p className="text-lg">
            <strong>Combined experience:</strong> 45+ anni in finanza, tech e crypto
          </p>
          <p className="text-muted-foreground mt-2">
            Ma soprattutto: siamo anche utenti della nostra piattaforma. Investiamo con la Wheel Strategy ogni giorno.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
};
