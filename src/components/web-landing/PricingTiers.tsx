import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PricingTiers = () => {
  const tiers = [
    {
      icon: '🥉',
      name: 'Starter',
      capital: '€1K-€2.5K',
      price: '€9.90',
      returns: '€62/mese',
      net: '€52+',
      popular: false,
    },
    {
      icon: '🥈',
      name: 'Growth',
      capital: '€2.5K-€5K',
      price: '€19.90',
      returns: '€225/mese',
      net: '€205+',
      popular: false,
    },
    {
      icon: '🥇',
      name: 'Advanced',
      capital: '€5K-€10K',
      price: '€39.90',
      returns: '€450/mese',
      net: '€410+',
      popular: true,
    },
    {
      icon: '💎',
      name: 'Premium',
      capital: '€10K-€25K',
      price: '€79.90',
      returns: '€1.050/mese',
      net: '€970+',
      popular: false,
    },
    {
      icon: '👑',
      name: 'Elite',
      capital: '€25K+',
      price: '€159.90',
      returns: '€1.500+/mese',
      net: '€1.340+',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            💰{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Pricing che Cresce con il Tuo Successo
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Canone basato sul capitale raggiunto - Allineamento totale di interessi
          </p>
        </div>

        {/* Pricing Cards - Desktop */}
        <div className="hidden lg:block overflow-x-auto mb-12">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2">
                <th className="text-left p-4 font-bold">TIER</th>
                <th className="text-left p-4 font-bold">CAPITALE</th>
                <th className="text-left p-4 font-bold">CANONE</th>
                <th className="text-left p-4 font-bold">RENDIMENTO TIPICO</th>
                <th className="text-left p-4 font-bold">NETTO MENSILE</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier, index) => (
                <tr
                  key={index}
                  className={`border-b hover:bg-muted/50 transition-colors ${
                    tier.popular ? 'bg-primary/5 border-2 border-primary' : ''
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tier.icon}</span>
                      <span className="font-bold">{tier.name}</span>
                      {tier.popular && (
                        <span className="px-2 py-1 rounded-full bg-primary/20 text-xs font-bold text-primary">
                          POPOLARE
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono font-bold">{tier.capital}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xl font-bold text-primary">{tier.price}</span>
                    <span className="text-sm text-muted-foreground">/mese</span>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-green-500">{tier.returns}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-lg font-bold">{tier.net}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Cards - Mobile */}
        <div className="lg:hidden grid sm:grid-cols-2 gap-6 mb-12">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative bg-card border-2 rounded-xl p-6 hover:shadow-xl transition-all ${
                tier.popular
                  ? 'border-primary shadow-lg scale-105'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  PIÙ POPOLARE
                </div>
              )}

              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{tier.icon}</div>
                <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                <p className="text-sm text-muted-foreground font-mono">{tier.capital}</p>
              </div>

              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-primary mb-1">{tier.price}</div>
                <div className="text-sm text-muted-foreground">al mese</div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rendimento</span>
                  <span className="font-semibold text-green-500">{tier.returns}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Netto</span>
                  <span className="font-bold">{tier.net}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Important Note */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-muted/50 border-2 border-primary/20 rounded-xl p-6 text-center">
            <p className="font-semibold text-lg mb-2">
              📊 Il canone rappresenta sempre {'<'}15% della crescita mensile del capitale
            </p>
            <p className="text-sm text-muted-foreground">
              Modello di pricing trasparente e allineato ai tuoi risultati
            </p>
          </div>
        </div>

        {/* Guarantees */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Passaggio Automatico</h4>
              <p className="text-sm text-muted-foreground">
                Tra tier quando capitale cresce
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Nessuna Penale</h4>
              <p className="text-sm text-muted-foreground">
                Per upgrade/downgrade
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-card border rounded-lg">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">6 Mesi Gratuiti</h4>
              <p className="text-sm text-muted-foreground">
                Per testare tutto
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/auth">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              INIZIA CON 6 MESI GRATIS
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PricingTiers;
