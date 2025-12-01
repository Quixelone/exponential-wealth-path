import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function Disclaimer() {
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

        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription className="text-base font-medium">
            AVVISO IMPORTANTE: Il trading di criptovalute comporta rischi elevati. 
            Leggi attentamente questo disclaimer prima di utilizzare i nostri servizi.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <CardTitle className="text-3xl">Disclaimer e Avvertenze sui Rischi</CardTitle>
            </div>
            <p className="text-muted-foreground">
              Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <h2>⚠️ Avvertenze Generali sui Rischi</h2>
            <p className="text-destructive font-semibold">
              IL TRADING DI OPZIONI SU CRIPTOVALUTE È ESTREMAMENTE RISCHIOSO E PUÒ PORTARE ALLA PERDITA 
              TOTALE DEL CAPITALE INVESTITO.
            </p>
            <p>
              Prima di iniziare a fare trading, dovresti considerare attentamente i tuoi obiettivi di 
              investimento, il livello di esperienza e la propensione al rischio. Esiste la possibilità 
              che tu possa subire una perdita di parte o di tutto il tuo investimento iniziale.
            </p>

            <h2>📚 Solo a Scopo Educativo</h2>
            <p>
              Tutti i contenuti forniti su questa piattaforma sono esclusivamente a scopo educativo 
              e informativo. NON costituiscono:
            </p>
            <ul>
              <li>Consulenza finanziaria, di investimento o fiscale</li>
              <li>Raccomandazioni personalizzate di investimento</li>
              <li>Offerta o sollecitazione all'acquisto/vendita di strumenti finanziari</li>
              <li>Garanzie di profitti o risultati</li>
            </ul>

            <h2>🤖 Segnali AI e Automazione</h2>
            <p>
              I segnali generati dall'intelligenza artificiale sono basati su analisi algoritmiche 
              e tecniche. Tuttavia:
            </p>
            <ul>
              <li>Gli algoritmi possono commettere errori o fornire analisi errate</li>
              <li>Le condizioni di mercato possono cambiare rapidamente</li>
              <li>Le performance passate dell'AI non garantiscono risultati futuri</li>
              <li>I segnali dovrebbero essere utilizzati come uno strumento tra molti, non come unica base decisionale</li>
            </ul>

            <h2>🛡️ Copertura Assicurativa</h2>
            <p>
              La copertura assicurativa offerta sulla piattaforma:
            </p>
            <ul>
              <li>Copre solo condizioni specifiche chiaramente definite nel contratto</li>
              <li>Non copre le normali fluttuazioni di mercato o perdite di trading</li>
              <li>È soggetta a termini, condizioni e limitazioni specifiche</li>
              <li>Richiede il pagamento di premi mensili regolari per rimanere attiva</li>
            </ul>

            <h2>💰 Perdite Potenziali</h2>
            <p>
              Devi essere consapevole che:
            </p>
            <ul>
              <li>Potresti perdere tutto il capitale investito</li>
              <li>Le perdite possono superare il tuo deposito iniziale in determinate condizioni</li>
              <li>La volatilità delle criptovalute può causare perdite rapide e significative</li>
              <li>Le condizioni di mercato estreme possono rendere impossibile chiudere posizioni</li>
            </ul>

            <h2>📊 Performance Simulate vs Reali</h2>
            <p>
              I risultati mostrati nel simulatore di trading:
            </p>
            <ul>
              <li>Sono basati su dati storici e non riflettono le condizioni di mercato reali</li>
              <li>Non includono slippage, commissioni reali o altri costi di trading</li>
              <li>Assumono l'esecuzione perfetta degli ordini</li>
              <li>NON sono indicativi dei risultati che otterrai nel trading reale</li>
            </ul>

            <h2>⚖️ Nessuna Garanzia</h2>
            <p>
              Finanza Creativa non garantisce:
            </p>
            <ul>
              <li>L'accuratezza, completezza o tempestività delle informazioni fornite</li>
              <li>Che la piattaforma sarà sempre disponibile o priva di errori</li>
              <li>Che i segnali AI o le strategie suggerite saranno profittevoli</li>
              <li>Risultati specifici o performance di trading</li>
            </ul>

            <h2>👤 Responsabilità Personale</h2>
            <p>
              Utilizzando questa piattaforma, riconosci e accetti che:
            </p>
            <ul>
              <li>Sei l'unico responsabile delle tue decisioni di trading</li>
              <li>Dovresti fare trading solo con capitale che puoi permetterti di perdere</li>
              <li>Dovresti consultare un consulente finanziario qualificato prima di prendere decisioni di investimento</li>
              <li>Hai letto e compreso tutti i rischi associati al trading di opzioni su criptovalute</li>
            </ul>

            <h2>🌍 Limitazioni Geografiche</h2>
            <p>
              I nostri servizi potrebbero non essere disponibili o legali in tutte le giurisdizioni. 
              È tua responsabilità assicurarti che l'utilizzo dei nostri servizi sia conforme alle leggi 
              locali del tuo paese o regione.
            </p>

            <h2>📞 Contatti</h2>
            <p>
              Per domande o chiarimenti su questo disclaimer, contattaci a: 
              <a href="mailto:support@finanzacreativa.it" className="text-primary hover:underline"> support@finanzacreativa.it</a>
            </p>

            <Alert className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>RICORDA:</strong> Non fare mai trading con denaro che non puoi permetterti di perdere. 
                Se hai dubbi, consulta sempre un consulente finanziario professionista.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
