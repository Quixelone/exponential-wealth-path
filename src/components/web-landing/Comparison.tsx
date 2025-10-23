import { X, Check, Minus } from 'lucide-react';

const Comparison = () => {
  const features = [
    {
      feature: 'Gestione Soldi',
      funds: { value: 'Controllano tutto', status: 'bad' },
      signals: { value: 'Solo segnali', status: 'bad' },
      us: { value: 'Tu mantieni controllo', status: 'good' },
    },
    {
      feature: 'Commissioni',
      funds: { value: '20-30% profitti', status: 'bad' },
      signals: { value: 'Canone fisso alto', status: 'bad' },
      us: { value: 'Canone proporzionale', status: 'good' },
    },
    {
      feature: 'Tecnologia',
      funds: { value: 'Black box', status: 'bad' },
      signals: { value: 'Solo Telegram', status: 'bad' },
      us: { value: 'Piattaforma completa', status: 'good' },
    },
    {
      feature: 'Formazione',
      funds: { value: 'Nessuna', status: 'bad' },
      signals: { value: 'Limitata', status: 'neutral' },
      us: { value: 'Corso professionale', status: 'good' },
    },
    {
      feature: 'Trasparenza',
      funds: { value: 'Opaco', status: 'bad' },
      signals: { value: 'Parziale', status: 'neutral' },
      us: { value: 'Totale + open source', status: 'good' },
    },
  ];

  const getIcon = (status: string) => {
    if (status === 'good') return <Check className="h-5 w-5 text-green-500" />;
    if (status === 'bad') return <X className="h-5 w-5 text-red-500" />;
    return <Minus className="h-5 w-5 text-yellow-500" />;
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            🆚 Perché{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Finanza Creativa è Diverso
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground px-4">
            Non siamo gestori di fondi. Siamo una piattaforma educativa con tecnologia proprietaria.
          </p>
        </div>

        {/* Comparison Table - Desktop */}
        <div className="hidden lg:block max-w-5xl mx-auto mb-12">
          <div className="bg-card border-2 border-primary/20 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b-2">
                  <th className="text-left p-6 font-bold text-lg">CARATTERISTICA</th>
                  <th className="text-center p-6 font-bold text-lg">GESTORI FONDI</th>
                  <th className="text-center p-6 font-bold text-lg">SIGNAL PROVIDERS</th>
                  <th className="text-center p-6 font-bold text-lg bg-gradient-to-r from-primary/10 to-secondary/10">
                    <div className="flex flex-col items-center gap-1">
                      <span>FINANZA CREATIVA</span>
                      <span className="text-xs font-normal text-primary">La Nostra Soluzione</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-6 font-semibold">{row.feature}</td>
                    <td className="p-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {getIcon(row.funds.status)}
                        <span className="text-sm text-muted-foreground">{row.funds.value}</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {getIcon(row.signals.status)}
                        <span className="text-sm text-muted-foreground">{row.signals.value}</span>
                      </div>
                    </td>
                    <td className="p-6 text-center bg-gradient-to-r from-primary/5 to-secondary/5">
                      <div className="flex items-center justify-center gap-2">
                        {getIcon(row.us.status)}
                        <span className="text-sm font-semibold">{row.us.value}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparison Cards - Mobile */}
        <div className="lg:hidden space-y-8 mb-12">
          {features.map((row, index) => (
            <div key={index} className="bg-card border-2 border-primary/20 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 pb-4 border-b">{row.feature}</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    {getIcon(row.funds.status)}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-1">Gestori Fondi</div>
                    <div className="text-sm font-medium">{row.funds.value}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    {getIcon(row.signals.status)}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-1">Signal Providers</div>
                    <div className="text-sm font-medium">{row.signals.value}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    {getIcon(row.us.status)}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-primary mb-1 font-semibold">Finanza Creativa</div>
                    <div className="text-sm font-bold">{row.us.value}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Callout */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-2 border-primary/20 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold mb-2">
              🔐 I tuoi fondi rimangono SEMPRE sui broker da te scelti
            </div>
            <p className="text-muted-foreground">
              Mantieni il controllo totale del tuo capitale in ogni momento
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
