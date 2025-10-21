import { Clock, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

const DailyRoutine = () => {
  const tasks = [
    { time: '10:00', task: 'Ricezione segnale AI', duration: '1 min', icon: '📱' },
    { time: '10:05', task: 'Analisi e validazione', duration: '3 min', icon: '🔍' },
    { time: '10:10', task: 'Esecuzione su broker', duration: '2 min', icon: '💰' },
    { time: '10:15', task: 'Conferma e tracking', duration: '2 min', icon: '✅' }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Clock className="h-4 w-4" />
            Routine Quotidiana
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Solo 15 Minuti al Giorno
          </h2>
          <p className="text-lg text-muted-foreground">
            Una finestra temporale precisa (10:00-11:00 AM) per massimizzare efficienza e risultati
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            {/* Timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

              <div className="space-y-6">
                {tasks.map((item, index) => (
                  <div key={index} className="relative flex items-center gap-6">
                    {/* Time badge */}
                    <div className="shrink-0 w-24 text-center">
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                        <Clock className="h-3 w-3" />
                        {item.time}
                      </div>
                    </div>

                    {/* Task card */}
                    <div className="flex-1 flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.task}</h3>
                        <p className="text-sm text-muted-foreground">{item.duration}</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total time highlight */}
            <div className="mt-8 p-6 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-center gap-3">
                <Clock className="h-6 w-6 text-primary" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">MAX 15 MINUTI/GIORNO</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Sempre nella stessa finestra temporale per comodità
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DailyRoutine;
