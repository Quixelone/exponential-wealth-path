import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function Privacy() {
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
              <Shield className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            </div>
            <p className="text-muted-foreground">
              Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <h2>1. Introduzione</h2>
            <p>
              Finanza Creativa ("noi", "nostro") rispetta la tua privacy e si impegna a proteggere i tuoi dati personali. 
              Questa privacy policy ti informerà su come trattiamo i tuoi dati personali quando visiti il nostro sito web.
            </p>

            <h2>2. Dati che Raccogliamo</h2>
            <p>Potremmo raccogliere, utilizzare, memorizzare e trasferire diversi tipi di dati personali su di te:</p>
            <ul>
              <li><strong>Dati di identità:</strong> nome, cognome</li>
              <li><strong>Dati di contatto:</strong> indirizzo email, numero di telefono</li>
              <li><strong>Dati tecnici:</strong> indirizzo IP, tipo di browser, fuso orario</li>
              <li><strong>Dati di utilizzo:</strong> informazioni su come utilizzi il nostro sito web</li>
            </ul>

            <h2>3. Come Utilizziamo i Tuoi Dati</h2>
            <p>Utilizziamo i tuoi dati personali per:</p>
            <ul>
              <li>Fornirti i nostri servizi educativi e di trading</li>
              <li>Gestire il tuo account e l'abbonamento</li>
              <li>Comunicare con te riguardo ai servizi</li>
              <li>Migliorare il nostro sito web e i nostri servizi</li>
              <li>Rispettare obblighi legali e normativi</li>
            </ul>

            <h2>4. Sicurezza dei Dati</h2>
            <p>
              Abbiamo implementato misure di sicurezza appropriate per prevenire che i tuoi dati personali 
              vengano accidentalmente persi, utilizzati o accessibili in modo non autorizzato.
            </p>

            <h2>5. I Tuoi Diritti</h2>
            <p>Hai il diritto di:</p>
            <ul>
              <li>Richiedere l'accesso ai tuoi dati personali</li>
              <li>Richiedere la correzione dei tuoi dati personali</li>
              <li>Richiedere la cancellazione dei tuoi dati personali</li>
              <li>Opporti al trattamento dei tuoi dati personali</li>
              <li>Richiedere la limitazione del trattamento</li>
              <li>Richiedere il trasferimento dei tuoi dati</li>
            </ul>

            <h2>6. Cookie</h2>
            <p>
              Il nostro sito web utilizza cookie per distinguerti da altri utenti del nostro sito web. 
              Questo ci aiuta a fornirti una buona esperienza quando navighi sul nostro sito web e ci permette 
              di migliorarlo.
            </p>

            <h2>7. Contattaci</h2>
            <p>
              Per qualsiasi domanda riguardante questa privacy policy o le nostre pratiche di privacy, 
              contattaci a: <a href="mailto:privacy@finanzacreativa.it" className="text-primary hover:underline">privacy@finanzacreativa.it</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
