import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { TrendingUp } from 'lucide-react';

const CompoundInterestCalculator = () => {
  const [capital, setCapital] = useState(1000);
  const dailyRate = 0.002; // 0.20%

  const calculateReturns = (initialCapital: number, days: number) => {
    return initialCapital * Math.pow(1 + dailyRate, days);
  };

  const oneMonth = calculateReturns(capital, 30);
  const sixMonths = calculateReturns(capital, 180);
  const oneYear = calculateReturns(capital, 365);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Il Potere dell'Interesse Composto
          </h2>
          <p className="text-lg text-muted-foreground">
            Scopri come il tuo capitale può crescere con costanza e disciplina
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            {/* Capital selector */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium">Capitale Iniziale</label>
                <span className="text-2xl font-bold text-primary">
                  €{capital.toLocaleString('it-IT')}
                </span>
              </div>
              <Slider
                value={[capital]}
                onValueChange={(values) => setCapital(values[0])}
                min={500}
                max={50000}
                step={500}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>€500</span>
                <span>€50.000</span>
              </div>
            </div>

            {/* Returns display */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border">
                <div className="text-sm text-muted-foreground mb-2">Dopo 1 Mese</div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  €{oneMonth.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-sm font-semibold text-green-600">
                  +€{(oneMonth - capital).toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                  {' '}({((oneMonth / capital - 1) * 100).toFixed(1)}%)
                </div>
              </div>

              <div className="text-center p-6 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border">
                <div className="text-sm text-muted-foreground mb-2">Dopo 6 Mesi</div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  €{sixMonths.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-sm font-semibold text-green-600">
                  +€{(sixMonths - capital).toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                  {' '}({((sixMonths / capital - 1) * 100).toFixed(1)}%)
                </div>
              </div>

              <div className="text-center p-6 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border">
                <div className="text-sm text-muted-foreground mb-2">Dopo 1 Anno</div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  €{oneYear.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-sm font-semibold text-green-600">
                  +€{(oneYear - capital).toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                  {' '}({((oneYear / capital - 1) * 100).toFixed(1)}%)
                </div>
              </div>
            </div>

            {/* Key message */}
            <div className="p-6 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-start gap-4">
                <TrendingUp className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Il TEMPO è la tua leva, non il capitale
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Con una strategia costante e disciplinata, anche capitali modesti possono generare 
                    risultati significativi nel tempo. Il segreto è la costanza e il reinvestimento dei profitti.
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground text-center mt-6">
              * Calcoli basati su rendimento target di 0.20% giornaliero. I risultati passati non garantiscono performance future. 
              Il trading comporta rischi di perdita del capitale.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CompoundInterestCalculator;
