import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle2, Users, MessageSquare } from 'lucide-react';
import Logo from '@/components/brand/Logo';

const FinalCTA = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      
      <div className="container mx-auto px-4 relative">
        {/* Main CTA */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Pronto a Diventare un Trader Autonomo?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Inizia gratis per 6 mesi. Nessuna carta richiesta, nessun vincolo.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-12 h-16 shadow-xl hover:shadow-2xl transition-shadow">
              INIZIA ORA - 6 MESI GRATIS
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            Unisciti a centinaia di trader che hanno già iniziato il loro percorso
          </p>
        </div>

        {/* Trust signals */}
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">100% Sicuro</h3>
            <p className="text-sm text-muted-foreground">
              Fondi sempre sotto il tuo controllo
            </p>
          </div>
          <div className="text-center">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Trasparenza Totale</h3>
            <p className="text-sm text-muted-foreground">
              Nessun costo nascosto
            </p>
          </div>
          <div className="text-center">
            <Users className="h-12 w-12 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Community Attiva</h3>
            <p className="text-sm text-muted-foreground">
              Supporto e confronto costante
            </p>
          </div>
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Supporto Dedicato</h3>
            <p className="text-sm text-muted-foreground">
              Sempre disponibili per te
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-12">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center md:text-left">
            {/* Brand */}
            <div>
              <div className="flex justify-center md:justify-start mb-4">
                <Logo />
              </div>
              <p className="text-sm text-muted-foreground">
                Formazione e segnali AI per trading opzioni Bitcoin autonomo e consapevole.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4">Contatti</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a 
                    href="https://t.me/finanzacreativa_bot" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Telegram: @finanzacreativa_bot
                  </a>
                </li>
                <li className="text-muted-foreground">
                  Email: info@finanzacreativa.live
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4">Note Legali</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                    Termini di Servizio
                  </Link>
                </li>
                <li>
                  <Link to="/disclaimer" className="text-muted-foreground hover:text-primary transition-colors">
                    Disclaimer
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom disclaimer */}
          <div className="mt-12 pt-8 border-t text-center">
            <p className="text-xs text-muted-foreground max-w-3xl mx-auto">
              <strong>Disclaimer:</strong> Finanza Creativa è un servizio educativo e di segnalazione trading. 
              NON siamo gestori patrimoniali, NON gestiamo fondi di terzi. Il trading comporta rischi significativi 
              di perdita del capitale. Le performance passate non garantiscono risultati futuri. 
              Opera solo con capitali che puoi permetterti di perdere.
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              © 2025 Finanza Creativa. Tutti i diritti riservati.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
