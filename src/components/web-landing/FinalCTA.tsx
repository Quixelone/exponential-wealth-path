import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Shield, Lock, MessageCircle } from 'lucide-react';

const FinalCTA = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary opacity-10"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main CTA */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6">
            🚀 Inizia la Tua{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Trasformazione Finanziaria
            </span>{' '}
            Oggi
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            6 mesi gratuiti per testare tutto. Zero rischi, massimo potenziale.
          </p>

          {/* Main CTA Button */}
          <Link to="/auth">
            <Button
              size="lg"
              className="text-xl px-12 py-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 mb-4 shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105"
            >
              ACCEDI GRATIS PER 6 MESI
            </Button>
          </Link>

          <p className="text-sm text-muted-foreground">
            Nessuna carta di credito richiesta • Cancellazione in qualsiasi momento
          </p>
        </div>

        {/* 3 Guarantees */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <div className="text-center p-6 bg-card border-2 border-primary/20 rounded-xl hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">🛡️ Garanzia Soddisfatti</h3>
            <p className="text-sm text-muted-foreground">
              o Rimborsati 30 giorni. Prova senza rischi.
            </p>
          </div>

          <div className="text-center p-6 bg-card border-2 border-primary/20 rounded-xl hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="font-bold text-lg mb-2">🔒 Dati Sicuri</h3>
            <p className="text-sm text-muted-foreground">
              Crittografia Enterprise. Privacy garantita.
            </p>
          </div>

          <div className="text-center p-6 bg-card border-2 border-primary/20 rounded-xl hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="font-bold text-lg mb-2">📞 Supporto Prioritario</h3>
            <p className="text-sm text-muted-foreground">
              in Italiano. Risposta entro 24h.
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="max-w-4xl mx-auto border-t border-primary/20 pt-16 mb-16"></div>

        {/* Footer */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                Finanza Creativa
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                La prima piattaforma AI per trader autonomi. Tecnologia, formazione e segnali per
                crescere il tuo capitale con la wheel strategy su Bitcoin options.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4">Contatti</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a
                  href="https://t.me/finanzacreativa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:text-primary transition-colors"
                >
                  Telegram
                </a>
                <a
                  href="mailto:info@finanzacreativa.com"
                  className="block hover:text-primary transition-colors"
                >
                  Email
                </a>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold mb-4">Legale</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link to="/privacy" className="block hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="block hover:text-primary transition-colors">
                  Termini di Servizio
                </Link>
                <Link to="/disclaimer" className="block hover:text-primary transition-colors">
                  Disclaimer
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-primary/20 text-center text-sm text-muted-foreground">
            <p className="mb-2">
              ⚠️ <strong>Disclaimer:</strong> Il trading comporta rischi. Non investire capitale
              che non puoi permetterti di perdere. Finanza Creativa è un servizio educativo e
              tecnologico, non un consulente finanziario. Le performance passate non garantiscono
              risultati futuri.
            </p>
            <p className="mt-4">
              © {new Date().getFullYear()} Finanza Creativa. Tutti i diritti riservati.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
