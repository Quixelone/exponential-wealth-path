import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna alla Home
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl">Termini di Servizio</CardTitle>
            </div>
            <p className="text-muted-foreground">
              Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <h2>1. Accettazione dei Termini</h2>
            <p>
              Benvenuto su Finanza Creativa. Utilizzando i nostri servizi, accetti di essere vincolato da questi 
              termini di servizio. Se non accetti questi termini, ti preghiamo di non utilizzare i nostri servizi.
            </p>

            <h2>2. Descrizione del Servizio</h2>
            <p>
              Finanza Creativa fornisce una piattaforma educativa per il trading di opzioni Bitcoin. 
              I nostri servizi includono:
            </p>
            <ul>
              <li>Corsi educativi sul trading di opzioni</li>
              <li>Simulatore di trading per la pratica</li>
              <li>Segnali AI per il trading di opzioni</li>
              <li>Dashboard per il monitoraggio delle strategie</li>
              <li>Copertura assicurativa opzionale</li>
            </ul>

            <h2>3. Registrazione e Account</h2>
            <p>
              Per accedere a determinati servizi, devi registrarti e creare un account. Accetti di:
            </p>
            <ul>
              <li>Fornire informazioni accurate, aggiornate e complete</li>
              <li>Mantenere la sicurezza della tua password</li>
              <li>Notificarci immediatamente qualsiasi uso non autorizzato del tuo account</li>
              <li>Essere responsabile per tutte le attività che avvengono sotto il tuo account</li>
            </ul>

            <h2>4. Disclaimer sul Trading</h2>
            <p className="text-destructive font-semibold">
              ATTENZIONE: Il trading di opzioni comporta rischi significativi e può portare alla perdita 
              del capitale investito. I contenuti forniti sono solo a scopo educativo e non costituiscono 
              consulenza finanziaria.
            </p>
            <ul>
              <li>Non garantiamo profitti o risultati specifici</li>
              <li>Le performance passate non sono indicative dei risultati futuri</li>
              <li>Dovresti fare trading solo con capitale che puoi permetterti di perdere</li>
              <li>Ti consigliamo di consultare un consulente finanziario professionale</li>
            </ul>

            <h2>5. Piani di Abbonamento e Pagamenti</h2>
            <p>
              Offriamo diversi piani di abbonamento. Tutti gli abbonamenti:
            </p>
            <ul>
              <li>Vengono addebitati in anticipo su base ricorrente</li>
              <li>Si rinnovano automaticamente salvo cancellazione</li>
              <li>Non sono rimborsabili, salvo dove richiesto dalla legge</li>
              <li>Possono essere cancellati in qualsiasi momento dalle impostazioni dell'account</li>
            </ul>

            <h2>6. Proprietà Intellettuale</h2>
            <p>
              Tutti i contenuti, materiali educativi, codice sorgente e design presenti su Finanza Creativa 
              sono di nostra proprietà o dei nostri licenzianti. Non puoi:
            </p>
            <ul>
              <li>Copiare, modificare o distribuire i nostri contenuti senza autorizzazione</li>
              <li>Utilizzare i nostri contenuti per scopi commerciali</li>
              <li>Rimuovere watermark o avvisi di copyright</li>
            </ul>

            <h2>7. Limitazione di Responsabilità</h2>
            <p>
              Nella massima misura consentita dalla legge, Finanza Creativa non sarà responsabile per:
            </p>
            <ul>
              <li>Perdite finanziarie derivanti dalle tue decisioni di trading</li>
              <li>Interruzioni del servizio o errori tecnici</li>
              <li>Danni indiretti, consequenziali o punitivi</li>
            </ul>

            <h2>8. Modifiche ai Termini</h2>
            <p>
              Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. 
              Le modifiche entreranno in vigore immediatamente dopo la pubblicazione sul sito web. 
              Il tuo uso continuato dei servizi dopo le modifiche costituisce accettazione dei nuovi termini.
            </p>

            <h2>9. Legge Applicabile</h2>
            <p>
              Questi termini sono regolati dalla legge italiana. Qualsiasi controversia sarà sottoposta 
              alla giurisdizione esclusiva dei tribunali italiani.
            </p>

            <h2>10. Contatti</h2>
            <p>
              Per domande su questi termini di servizio, contattaci a: 
              <a href="mailto:legal@finanzacreativa.it" className="text-primary hover:underline"> legal@finanzacreativa.it</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
