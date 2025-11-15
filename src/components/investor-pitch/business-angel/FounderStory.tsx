import { SectionWrapper } from '../shared/SectionWrapper';
import { Heart, TrendingDown, Lightbulb } from 'lucide-react';

export const FounderStory = () => {
  return (
    <SectionWrapper id="story" className="bg-card">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
          Why I Started Finanzacreativa
        </h2>

        <div className="space-y-8">
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Il Problema che Ho Vissuto</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nel 2019 stavo guardando il mio estratto conto del fondo pensione. Avevo versato <strong>€15.000</strong> in 5 anni. Il valore? <strong>€13.200</strong>. Avevo <strong>PERSO</strong> soldi mentre "esperti" gestivano i miei risparmi. In quello stesso periodo, Bitcoin era passato da €3.000 a €50.000. Ma io non potevo investirci — troppo volatile, troppo rischioso.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">La Scoperta</h3>
              <p className="text-muted-foreground leading-relaxed">
                Poi ho scoperto la <strong>Wheel Strategy</strong>. Un modo per investire in Bitcoin generando reddito costante attraverso opzioni, con controllo totale del rischio. Ho testato la strategia sui miei fondi personali per 3 anni. I risultati? <strong>+18% medio annuo</strong>, con volatilità controllata. Ho capito: questo è il futuro delle pensioni.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Heart className="h-6 w-6 text-accent" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">La Missione</h3>
              <p className="text-muted-foreground leading-relaxed">
                Dopo 4 anni di test e perfezionamento, è il momento di democratizzare l'accesso. Finanzacreativa è nata per dare a tutti — non solo ai grandi investitori — la possibilità di costruire un fondo pensione Bitcoin sicuro e redditizio. Con formazione professionale, segnali AI quotidiani, e una community di supporto.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-primary/20">
          <p className="text-lg italic text-center">
            "Non voglio solo creare una piattaforma. Voglio creare un movimento che cambi il modo in cui le persone pensano alla loro pensione."
          </p>
          <p className="text-center mt-4 text-muted-foreground">— Luigi Coccimiglio, Founder & CEO</p>
        </div>
      </div>
    </SectionWrapper>
  );
};
