import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Shield, Lock, MessageCircle } from 'lucide-react';

const FinalCTA = () => {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary opacity-10"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main CTA - Mobile Optimized */}
        <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            🚀 Inizia la Tua{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Trasformazione Finanziaria
            </span>{' '}
            Oggi
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
            6 mesi gratuiti per testare tutto. Zero rischi, massimo potenziale.
          </p>

          {/* Main CTA Button - Touch Friendly */}
          <Link to="/auth" className="inline-block w-full sm:w-auto px-4">
            <Button
              size="lg"
              className="w-full sm:w-auto text-base sm:text-lg lg:text-xl px-8 sm:px-10 lg:px-12 py-6 sm:py-7 lg:py-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 mb-3 sm:mb-4 shadow-2xl hover:shadow-primary/50 transition-all duration-300 active:scale-98"
            >
              ACCEDI GRATIS PER 6 MESI
            </Button>
          </Link>

          <p className="text-xs sm:text-sm text-muted-foreground px-4">
            Nessuna carta di credito richiesta • Cancellazione in qualsiasi momento
          </p>
        </div>

        {/* 3 Guarantees - Stack su mobile */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto mb-12 sm:mb-16">
          <div className="text-center p-4 sm:p-6 bg-card border-2 border-primary/20 rounded-xl hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h3 className="font-bold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">🛡️ Garanzia Soddisfatti</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              o Rimborsati 30 giorni. Prova senza rischi.
            </p>
          </div>

          <div className="text-center p-4 sm:p-6 bg-card border-2 border-primary/20 rounded-xl hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
              <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-secondary" />
            </div>
            <h3 className="font-bold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">🔒 Dati Sicuri</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Crittografia Enterprise. Privacy garantita.
            </p>
          </div>

          <div className="text-center p-4 sm:p-6 bg-card border-2 border-primary/20 rounded-xl hover:shadow-xl transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            </div>
            <h3 className="font-bold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">📞 Supporto Prioritario</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              in Italiano. Risposta entro 24h.
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="max-w-4xl mx-auto border-t border-primary/20 pt-10 sm:pt-16 mb-10 sm:mb-16"></div>

        {/* Footer - Ottimizzato per mobile */}
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* Company Info */}
            <div className="sm:col-span-2">
              <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3 sm:mb-4">
                Finanza Creativa
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed">
                La prima piattaforma AI per trader autonomi. Tecnologia, formazione e segnali per
                crescere il tuo capitale con la wheel strategy su Bitcoin options.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">Contatti</h4>
              <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <a
                  href="https://t.me/finanzacreativa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:text-primary transition-colors active:text-primary"
                >
                  Telegram
                </a>
                <a
                  href="mailto:info@finanzacreativa.com"
                  className="block hover:text-primary transition-colors active:text-primary"
                >
                  Email
                </a>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">Legale</h4>
              <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <Link to="/privacy" className="block hover:text-primary transition-colors active:text-primary">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="block hover:text-primary transition-colors active:text-primary">
                  Termini di Servizio
                </Link>
                <Link to="/disclaimer" className="block hover:text-primary transition-colors active:text-primary">
                  Disclaimer
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar - Compatto su mobile */}
          <div className="pt-6 sm:pt-8 border-t border-primary/20 text-center text-xs sm:text-sm text-muted-foreground">
            <p className="mb-2 leading-relaxed px-2">
              ⚠️ <strong>Disclaimer:</strong> Il trading comporta rischi. Non investire capitale
              che non puoi permetterti di perdere. Finanza Creativa è un servizio educativo e
              tecnologico, non un consulente finanziario. Le performance passate non garantiscono
              risultati futuri.
            </p>
            <p className="mt-3 sm:mt-4">
              © {new Date().getFullYear()} Finanza Creativa. Tutti i diritti riservati.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
