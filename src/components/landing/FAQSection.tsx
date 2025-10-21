import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQSection = () => {
  const faqs = [
    {
      question: 'Gestite i nostri soldi?',
      answer: 'NO. Finanza Creativa NON è un servizio di gestione patrimoniale. Forniamo solo formazione e segnali di trading. I tuoi fondi rimangono sempre sotto il tuo controllo presso i broker scelti da te. Non abbiamo mai accesso ai tuoi conti.'
    },
    {
      question: 'Quanto tempo serve ogni giorno?',
      answer: '10-15 minuti massimo, sempre tra le 10:00-11:00 AM. Questa finestra temporale fissa ti permette di organizzarti facilmente e mantenere la disciplina necessaria per il successo.'
    },
    {
      question: 'Serve esperienza precedente di trading?',
      answer: 'No, il corso ti porta da zero a operativo in 2-3 settimane. Partiamo dai fondamenti delle opzioni Bitcoin fino alle strategie avanzate, con un percorso progressivo e strutturato.'
    },
    {
      question: 'Quali sono le commissioni sui profitti?',
      answer: 'ZERO commissioni sui profitti. A differenza di altri servizi, NON prendiamo percentuali sui tuoi guadagni. Il canone mensile copre solo formazione e segnali. I profitti sono 100% tuoi.'
    },
    {
      question: 'Come funziona il periodo gratuito di 6 mesi?',
      answer: 'Registrandoti ottieni accesso immediato al piano gratuito per 6 mesi interi. Nessuna carta richiesta, nessun vincolo. Dopo i 6 mesi puoi scegliere se passare al Premium o continuare con le funzionalità base.'
    },
    {
      question: 'Quali broker posso usare?',
      answer: 'Consigliamo broker regolamentati UE che supportano opzioni Bitcoin. Ti forniamo una lista di partner verificati e ti guidiamo nella scelta più adatta alle tue esigenze. Tu mantieni sempre il controllo totale.'
    },
    {
      question: 'Posso perdere soldi?',
      answer: 'Sì, il trading comporta rischi. Anche con segnali accurati e strategie testate, non ci sono garanzie di profitto. Per questo il corso include moduli dedicati alla gestione del rischio e al money management.'
    },
    {
      question: 'Quanto capitale serve per iniziare?',
      answer: 'Consigliamo un minimo di €1.000-2.000 per avere margini operativi confortevoli. Puoi iniziare anche con meno, ma con capitale ridotto le opportunità sono più limitate.'
    },
    {
      question: 'I segnali AI sono sempre vincenti?',
      answer: 'No, nessun sistema è infallibile al 100%. I segnali AI hanno un track record positivo nel lungo periodo, ma singole operazioni possono chiudersi in perdita. L\'importante è la disciplina e la visione di lungo termine.'
    },
    {
      question: 'Posso disdire in qualsiasi momento?',
      answer: 'Sì, nessun vincolo contrattuale. Il piano gratuito dura 6 mesi automaticamente. Il Premium è a canone mensile cancellabile in qualsiasi momento, senza penali o costi nascosti.'
    }
  ];

  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Domande Frequenti
          </h2>
          <p className="text-lg text-muted-foreground">
            Tutto quello che devi sapere prima di iniziare
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border rounded-lg px-6"
              >
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Non hai trovato la risposta che cercavi?
            </p>
            <a 
              href="https://t.me/finanzacreativa_bot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:underline"
            >
              Contattaci su Telegram →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
