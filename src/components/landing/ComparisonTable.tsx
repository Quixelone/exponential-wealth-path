import { Check, X } from 'lucide-react';
import { Card } from '@/components/ui/card';

const ComparisonTable = () => {
  const comparisons = [
    {
      feature: 'Gestione Fondi',
      others: { text: 'Controllano i tuoi soldi', icon: X, benefit: false },
      us: { text: 'Tu mantieni controllo totale', icon: Check, benefit: true },
      advantage: 'Sicurezza'
    },
    {
      feature: 'Commissioni',
      others: { text: '% sui profitti', icon: X, benefit: false },
      us: { text: 'Canone fisso, profitti 100% tuoi', icon: Check, benefit: true },
      advantage: 'Trasparenza'
    },
    {
      feature: 'Decisioni Trading',
      others: { text: 'Opache e automatiche', icon: X, benefit: false },
      us: { text: 'Formazione per autonomia', icon: Check, benefit: true },
      advantage: 'Indipendenza'
    },
    {
      feature: 'Dipendenza Servizio',
      others: { text: 'Totale dal servizio', icon: X, benefit: false },
      us: { text: 'Competenze acquisite', icon: Check, benefit: true },
      advantage: 'Libertà'
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Perché Finanza Creativa è Diverso
          </h2>
          <p className="text-lg text-muted-foreground">
            Non siamo un servizio di gestione patrimoniale. Siamo una piattaforma educativa che ti rende autonomo.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Card className="overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 p-6 bg-muted/50 border-b">
              <div className="font-semibold">Caratteristica</div>
              <div className="text-center font-semibold">Altri Servizi</div>
              <div className="text-center font-semibold text-primary">Finanza Creativa</div>
              <div className="text-center font-semibold">Vantaggio</div>
            </div>

            {/* Rows */}
            {comparisons.map((row, index) => (
              <div 
                key={index}
                className="grid grid-cols-4 gap-4 p-6 border-b last:border-b-0 hover:bg-muted/20 transition-colors"
              >
                <div className="font-medium flex items-center">{row.feature}</div>
                
                <div className="flex items-center justify-center gap-2">
                  <row.others.icon className={`h-5 w-5 shrink-0 ${row.others.benefit ? 'text-green-600' : 'text-destructive'}`} />
                  <span className="text-sm text-center">{row.others.text}</span>
                </div>
                
                <div className="flex items-center justify-center gap-2">
                  <row.us.icon className={`h-5 w-5 shrink-0 ${row.us.benefit ? 'text-green-600' : 'text-destructive'}`} />
                  <span className="text-sm text-center font-medium">{row.us.text}</span>
                </div>
                
                <div className="flex items-center justify-center">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {row.advantage}
                  </span>
                </div>
              </div>
            ))}
          </Card>

          <div className="mt-8 p-6 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-center text-sm text-muted-foreground">
              <strong className="text-foreground">Importante:</strong> Finanza Creativa NON è un servizio di gestione patrimoniale. 
              Forniamo esclusivamente formazione e segnali di trading. I tuoi fondi rimangono sempre sotto il tuo controllo 
              presso i broker da te scelti.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;
