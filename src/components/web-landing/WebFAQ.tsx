import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const WebFAQ = () => {
  const faqs = [
    {
      question: 'Gestite i nostri soldi?',
      answer:
        'NO. Forniamo solo piattaforma tecnologica, formazione e segnali AI. I tuoi fondi rimangono sui broker scelti da te. Non siamo gestori patrimoniali.',
    },
    {
      question: 'Come funziona la protezione assicurativa?',
      answer:
        'Quando la volatilità Bitcoin è bassa e i premi opzioni scendono sotto 0.10%, il nostro pool assicurativo ti garantisce comunque 0.15% sul capitale investito attraverso hedging con perpetual futures.',
    },
    {
      question: "Qual è il rischio principale?",
      answer:
        "L'unico rischio è una diminuzione del valore temporanea se BTC scende molto sotto lo strike di acquisto. Ma la wheel strategy è progettata per recuperare nel tempo grazie ai premi costanti e all'acquisto di BTC a prezzi scontati.",
    },
    {
      question: 'Serve esperienza precedente?',
      answer:
        'No. Il corso completo ti porta da zero a operativo in 2-3 settimane con supporto continuo. La piattaforma automatizza i calcoli complessi e ti guida passo-passo.',
    },
    {
      question: 'Posso smettere quando voglio?',
      answer:
        "Sì, nessun vincolo contrattuale. Puoi cancellare l'abbonamento in qualsiasi momento. Potrai mantenere solo l'uso del pannello per ulteriori 2 mesi, non potrai usufruire della protezione e dei segnali AI.",
    },
    {
      question: 'Quali broker sono supportati?',
      answer:
        'La piattaforma funziona con i principali broker per opzioni Bitcoin come Deribit, OKX, Binance Options. Mantieni il controllo totale dei tuoi account e noi forniamo solo i segnali e la tecnologia.',
    },
    {
      question: 'Come funziona il PAC automatico?',
      answer:
        'Il Piano di Accumulo del Capitale ti permette di aggiungere capitale periodicamente (settimanale/mensile). La piattaforma calcola automaticamente il nuovo dimensionamento delle posizioni per ottimizzare i rendimenti composti.',
    },
    {
      question: 'Cosa include la formazione?',
      answer:
        'Corso completo su wheel strategy, gestione del rischio, psicologia del trading, utilizzo della piattaforma, analisi tecnica Bitcoin, e best practices per options trading. Materiali video, PDF e supporto live.',
    },
    {
      question: 'I 6 mesi gratuiti hanno limitazioni?',
      answer:
        'No, accesso completo a tutte le funzionalità della piattaforma, formazione, segnali AI quotidiani e supporto. Nessuna carta di credito richiesta per iniziare il periodo gratuito.',
    },
    {
      question: 'Come viene calcolato il tier di pricing?',
      answer:
        'Il tier si basa sul capitale totale che inserisci nella piattaforma (somma PAC + crescita). Il passaggio tra tier è automatico e proporzionale. Non paghi mai più del 15% della crescita mensile media.',
    },
  ];

  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            ❓{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Domande Frequenti
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Risposte alle domande più comuni sulla piattaforma e il servizio
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto mb-12">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border-2 border-primary/20 rounded-xl px-6 hover:shadow-lg transition-all"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-xl p-8">
            <h3 className="text-xl font-bold mb-4">Non hai trovato la risposta?</h3>
            <p className="text-muted-foreground mb-6">
              Il nostro team è disponibile per rispondere a qualsiasi domanda
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://t.me/finanzacreativa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                </svg>
                Contattaci su Telegram
              </a>
              <a
                href="mailto:support@finanzacreativa.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-primary text-primary hover:bg-primary/10 transition-colors font-medium"
              >
                Scrivici via Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WebFAQ;
