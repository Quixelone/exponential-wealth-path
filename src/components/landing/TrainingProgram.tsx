import { BookOpen, Target, Shield, Brain, BarChart3, Coins } from 'lucide-react';
import { Card } from '@/components/ui/card';

const TrainingProgram = () => {
  const modules = [
    {
      icon: BookOpen,
      title: 'Fondamenti Opzioni Bitcoin',
      description: 'Cosa sono le opzioni, come funzionano, terminologia base e meccanismi di esercizio',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Target,
      title: 'Wheel Strategy Avanzata',
      description: 'La strategia completa: vendita put, assegnazione, vendita call coperte',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Gestione del Rischio',
      description: 'Size position, stop loss, gestione capital allocation e margini',
      color: 'from-red-500 to-orange-500'
    },
    {
      icon: Brain,
      title: 'Psicologia del Trading',
      description: 'Controllo emotivo, disciplina, gestione stress e decision making razionale',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: BarChart3,
      title: 'Analisi Tecnica Base',
      description: 'Lettura grafici, supporti/resistenze, volumi e indicatori essenziali',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      icon: Coins,
      title: 'Ottimizzazione Fiscale',
      description: 'Tassazione crypto in Italia, dichiarazione redditi e strategie legali',
      color: 'from-yellow-500 to-amber-500'
    }
  ];

  const materials = [
    { icon: '🎥', title: 'Video HD', description: 'Lezioni video professionali' },
    { icon: '📄', title: 'Guide PDF', description: 'Materiali scaricabili' },
    { icon: '🎓', title: 'Webinar Live', description: 'Sessioni Q&A settimanali' },
    { icon: '👥', title: 'Community', description: 'Gruppo Telegram privato' },
    { icon: '🎮', title: 'Simulatore', description: 'Pratica senza rischi' }
  ];

  return (
    <section id="formazione" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Programma Formativo Completo
          </h2>
          <p className="text-lg text-muted-foreground">
            Da zero a operativo in 2-3 settimane con un percorso strutturato e progressivo
          </p>
        </div>

        {/* Modules grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {modules.map((module, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all group cursor-pointer">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <module.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{module.title}</h3>
              <p className="text-sm text-muted-foreground">{module.description}</p>
            </Card>
          ))}
        </div>

        {/* Materials section */}
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
            <h3 className="text-2xl font-bold text-center mb-8">Materiali Inclusi</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-6">
              {materials.map((material, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl mb-3">{material.icon}</div>
                  <h4 className="font-semibold mb-1">{material.title}</h4>
                  <p className="text-xs text-muted-foreground">{material.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default TrainingProgram;
