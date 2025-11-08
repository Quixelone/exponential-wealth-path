# 🎨 Prompt per Lovable - Redesign UI/UX Finanza Creativa

## 📋 Contesto

Sto ridisegnando completamente la UI/UX della mia applicazione "Finanza Creativa" - una piattaforma per il trading di opzioni Bitcoin con educazione e gamification. L'app attuale è confusa, sovraccarica e difficile da usare.

---

## 🎯 Obiettivi del Redesign

Trasforma l'applicazione in un'esperienza **semplice, guidata e focalizzata** seguendo questi principi:

1. **Semplicità**: Ridurre il cognitive load, mostrare solo l'essenziale
2. **Progressione**: Guidare l'utente con onboarding e wizard
3. **Focus**: Una task principale alla volta
4. **Mobile-First**: Design ottimizzato prima per mobile
5. **Consistenza**: Unificare componenti e pattern

---

## 🛠️ Istruzioni per l'Implementazione

### **FASE 1: Ristrutturazione Architettura**

#### 1.1 Nuovo Sistema di Routing

**Obiettivo:** Semplificare da 7+ pagine a 4 pagine principali.

**Attuale (DA MODIFICARE):**
```
/app → Dashboard
/strategies → Gestione Strategie (DUPLICATO)
/ai-signals → Segnali AI
/coach-ai → Coach AI
/education → Education Home
/education/dashboard → Dashboard Educazione
/education/leaderboard → Classifica
/trading-simulator → Simulatore
/course-viewer/:id → Visualizzatore Corsi
/settings → Impostazioni
/user-management → Gestione Utenti (admin)
```

**Nuovo (DA IMPLEMENTARE):**
```
/ → Landing Page (mantenere WebLanding.tsx)
/auth → Autenticazione
/app → Dashboard Unificato (NUOVO - combina Index + Strategies)
/ai-assistant → Assistente AI (combina AI Signals + Coach AI)
/academy → Academy (combina tutte le sezioni educazione)
/profile → Profilo & Impostazioni
/admin → Area Admin (solo per admin)
```

**Implementa:**
```typescript
// src/App.tsx - Aggiorna routing
const router = createBrowserRouter([
  { path: "/", element: <WebLanding /> },
  { path: "/auth", element: <Auth /> },
  {
    path: "/app",
    element: <ProtectedRoute><UnifiedDashboard /></ProtectedRoute>
  },
  {
    path: "/ai-assistant",
    element: <ProtectedRoute><AIAssistant /></ProtectedRoute>
  },
  {
    path: "/academy",
    element: <ProtectedRoute><Academy /></ProtectedRoute>,
    children: [
      { path: "course/:id", element: <CourseViewer /> },
      { path: "simulator", element: <TradingSimulator /> },
      { path: "leaderboard", element: <Leaderboard /> },
    ]
  },
  {
    path: "/profile",
    element: <ProtectedRoute><Profile /></ProtectedRoute>
  },
  {
    path: "/admin",
    element: <ProtectedRoute requireAdmin><AdminPanel /></ProtectedRoute>
  },
]);
```

#### 1.2 Nuova Navigazione (Sidebar & Mobile)

**Sidebar Desktop (src/components/layout/ModernSidebar.tsx):**
```typescript
const navigationItems = [
  { name: 'Dashboard', icon: Home, path: '/app' },
  { name: 'Assistente AI', icon: Bot, path: '/ai-assistant', badge: 'NEW' },
  { name: 'Academy', icon: GraduationCap, path: '/academy' },
  { name: 'Profilo', icon: User, path: '/profile' },
];

// Se admin, aggiungi:
if (isAdmin) {
  navigationItems.push({ name: 'Admin', icon: Shield, path: '/admin' });
}
```

**Bottom Navigation Mobile (src/components/mobile/BottomNavigation.tsx):**
```typescript
const mobileNav = [
  { name: 'Home', icon: Home, path: '/app' },
  { name: 'AI', icon: Bot, path: '/ai-assistant' },
  { name: 'Academy', icon: GraduationCap, path: '/academy' },
  { name: 'Profilo', icon: User, path: '/profile' },
];
```

---

### **FASE 2: Dashboard Unificato**

#### 2.1 Creare UnifiedDashboard Component

**File:** `src/pages/UnifiedDashboard.tsx`

**Struttura:**
```tsx
import { useState } from 'react';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';
import { useActualTrades } from '@/hooks/useActualTrades';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, TrendingUp, Plus } from 'lucide-react';

const UnifiedDashboard = () => {
  const {
    config,
    updateConfig,
    currentConfigId,
    currentConfigName,
    summary,
    investmentData,
    hasUnsavedChanges,
  } = useInvestmentCalculator();

  const [isEditingStrategy, setIsEditingStrategy] = useState(false);
  const [showStrategyWizard, setShowStrategyWizard] = useState(!currentConfigId);

  // First-time user → Show wizard
  if (!currentConfigId && showStrategyWizard) {
    return <StrategyWizard onComplete={() => setShowStrategyWizard(false)} />;
  }

  return (
    <AppLayout hasUnsavedChanges={hasUnsavedChanges}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Hero Section: Strategia Attiva */}
        <StrategyHeroCard
          strategy={currentConfigName}
          summary={summary}
          currency={config.currency}
          onEdit={() => setIsEditingStrategy(true)}
          onCreateNew={() => setShowStrategyWizard(true)}
        />

        {/* Inline Strategy Editor (collapsible) */}
        {isEditingStrategy && (
          <Card className="p-6 border-primary/20">
            <StrategyEditorInline
              config={config}
              onConfigChange={updateConfig}
              onCancel={() => setIsEditingStrategy(false)}
              onSave={() => {
                // Save logic
                setIsEditingStrategy(false);
              }}
            />
          </Card>
        )}

        {/* Performance Chart */}
        <PerformanceSection
          data={investmentData}
          currency={config.currency}
        />

        {/* AI Signals Widget (collapsed by default) */}
        <AISignalsWidget />

        {/* Academy Progress Widget (collapsed by default) */}
        <AcademyProgressWidget />
      </div>
    </AppLayout>
  );
};
```

#### 2.2 StrategyHeroCard Component

**File:** `src/components/dashboard/StrategyHeroCard.tsx`

**Design:**
```tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Settings, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface StrategyHeroCardProps {
  strategy: string;
  summary: any;
  currency: string;
  onEdit: () => void;
  onCreateNew: () => void;
}

export const StrategyHeroCard = ({
  strategy,
  summary,
  currency,
  onEdit,
  onCreateNew
}: StrategyHeroCardProps) => {
  const finalCapital = summary?.final?.finalCapital || 0;
  const totalInvested = summary?.final?.totalInvested || 0;
  const profit = finalCapital - totalInvested;
  const roi = totalInvested > 0 ? ((profit / totalInvested) * 100) : 0;
  const currentDay = summary?.current?.day || 0;
  const totalDays = summary?.final?.day || 0;

  return (
    <Card className="overflow-hidden border-l-4 border-l-primary">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-6 pb-4 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{strategy || 'Nessuna Strategia'}</h1>
              <p className="text-sm text-muted-foreground">La tua strategia attiva</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Settings className="h-4 w-4 mr-2" />
                Modifica
              </Button>
              <Button variant="ghost" size="sm" onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Nuova
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics - SOLO 3 PRINCIPALI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x">
          {/* Capitale Finale */}
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Capitale Finale</p>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(finalCapital, currency)}</p>
            <Badge variant={profit >= 0 ? "success" : "destructive"} className="mt-2">
              {profit >= 0 ? '+' : ''}{formatCurrency(profit, currency)}
            </Badge>
          </div>

          {/* ROI */}
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">ROI %</p>
            <p className="text-3xl font-bold text-foreground">{roi.toFixed(2)}%</p>
            <div className="flex items-center justify-center gap-1 mt-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Rendimento totale</span>
            </div>
          </div>

          {/* Progress */}
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Progressione</p>
            <p className="text-3xl font-bold text-foreground">{currentDay}/{totalDays}</p>
            <div className="w-full bg-muted h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(currentDay / totalDays) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

#### 2.3 StrategyEditorInline Component

**File:** `src/components/strategy/StrategyEditorInline.tsx`

**Design:**
```tsx
import { useState } from 'react';
import { InvestmentConfig } from '@/types/investment';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CapitalConfiguration from '@/components/configuration/CapitalConfiguration';
import TimeHorizonConfiguration from '@/components/configuration/TimeHorizonConfiguration';
import ReturnConfiguration from '@/components/configuration/ReturnConfiguration';
import PACConfiguration from '@/components/configuration/PACConfiguration';
import { X, Save } from 'lucide-react';

interface StrategyEditorInlineProps {
  config: InvestmentConfig;
  onConfigChange: (newConfig: Partial<InvestmentConfig>) => void;
  onCancel: () => void;
  onSave: () => void;
}

export const StrategyEditorInline = ({
  config,
  onConfigChange,
  onCancel,
  onSave
}: StrategyEditorInlineProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Modifica Strategia</h2>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="capital" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="capital">Capitale</TabsTrigger>
          <TabsTrigger value="time">Tempo</TabsTrigger>
          <TabsTrigger value="returns">Rendimenti</TabsTrigger>
          <TabsTrigger value="pac">PAC</TabsTrigger>
        </TabsList>

        <TabsContent value="capital" className="space-y-4">
          <CapitalConfiguration
            config={config}
            onConfigChange={onConfigChange}
          />
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <TimeHorizonConfiguration
            config={config}
            onConfigChange={onConfigChange}
          />
        </TabsContent>

        <TabsContent value="returns" className="space-y-4">
          <ReturnConfiguration
            config={config}
            onConfigChange={onConfigChange}
          />
        </TabsContent>

        <TabsContent value="pac" className="space-y-4">
          <PACConfiguration
            config={config}
            onConfigChange={onConfigChange}
          />
        </TabsContent>
      </Tabs>

      {/* Sticky Footer con Azioni */}
      <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-card">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Annulla
        </Button>
        <Button variant="gradient" onClick={onSave} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          Salva Modifiche
        </Button>
      </div>
    </div>
  );
};
```

---

### **FASE 3: Onboarding con Wizard**

#### 3.1 StrategyWizard Component

**File:** `src/components/wizard/StrategyWizard.tsx`

**Design Multi-Step:**
```tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Step1Capital from './wizard-steps/Step1Capital';
import Step2PAC from './wizard-steps/Step2PAC';
import Step3Returns from './wizard-steps/Step3Returns';
import Step4Review from './wizard-steps/Step4Review';

interface StrategyWizardProps {
  onComplete: () => void;
}

export const StrategyWizard = ({ onComplete }: StrategyWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    initialCapital: 1000,
    timeHorizon: 365,
    currency: 'EUR' as const,
    pacAmount: 100,
    pacFrequency: 'monthly' as const,
    pacStartDate: new Date(),
    dailyReturnRate: 0.1,
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    // Salva la strategia
    // await saveConfiguration(...formData);
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-secondary/5">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Crea la Tua Prima Strategia</h1>
            <p className="text-muted-foreground">
              Ti guideremo passo dopo passo nella configurazione
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Passo {currentStep} di {totalSteps}</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps Pills */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  step < currentStep
                    ? 'bg-success'
                    : step === currentStep
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step Content */}
          {currentStep === 1 && (
            <Step1Capital
              data={formData}
              onChange={(updates) => setFormData({ ...formData, ...updates })}
            />
          )}
          {currentStep === 2 && (
            <Step2PAC
              data={formData}
              onChange={(updates) => setFormData({ ...formData, ...updates })}
            />
          )}
          {currentStep === 3 && (
            <Step3Returns
              data={formData}
              onChange={(updates) => setFormData({ ...formData, ...updates })}
            />
          )}
          {currentStep === 4 && (
            <Step4Review data={formData} />
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Indietro
              </Button>
            )}
            {currentStep < totalSteps && (
              <Button variant="gradient" onClick={handleNext} className="flex-1">
                Avanti
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {currentStep === totalSteps && (
              <Button variant="gradient" onClick={handleComplete} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Crea Strategia
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

#### 3.2 Wizard Steps

**Step 1 - Capital & Time (src/components/wizard/wizard-steps/Step1Capital.tsx):**
```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DollarSign, Calendar } from 'lucide-react';

export default function Step1Capital({ data, onChange }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <DollarSign className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Capitale e Durata</h2>
        <p className="text-muted-foreground">Quanto vuoi investire e per quanto tempo?</p>
      </div>

      <div className="space-y-4">
        {/* Capitale Iniziale */}
        <div>
          <Label htmlFor="capital">Capitale Iniziale</Label>
          <Input
            id="capital"
            type="number"
            value={data.initialCapital}
            onChange={(e) => onChange({ initialCapital: Number(e.target.value) })}
            className="text-lg"
          />
        </div>

        {/* Valuta */}
        <div>
          <Label>Valuta</Label>
          <RadioGroup
            value={data.currency}
            onValueChange={(value) => onChange({ currency: value })}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="EUR" id="eur" />
              <Label htmlFor="eur">EUR €</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="USD" id="usd" />
              <Label htmlFor="usd">USD $</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="USDT" id="usdt" />
              <Label htmlFor="usdt">USDT ₮</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Time Horizon */}
        <div>
          <Label htmlFor="time">Durata (giorni)</Label>
          <Input
            id="time"
            type="number"
            value={data.timeHorizon}
            onChange={(e) => onChange({ timeHorizon: Number(e.target.value) })}
            className="text-lg"
          />
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange({ timeHorizon: 30 })}
            >
              30 giorni
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange({ timeHorizon: 90 })}
            >
              90 giorni
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange({ timeHorizon: 365 })}
            >
              1 anno
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2 - PAC Config:** Simile a Step1, focus su frequenza PAC
**Step 3 - Returns:** Input rendimento giornaliero + info tooltip
**Step 4 - Review:** Mostra anteprima risultato finale calcolato

---

### **FASE 4: Widgets Collapsible**

#### 4.1 AISignalsWidget

**File:** `src/components/dashboard/AISignalsWidget.tsx`

```tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AISignalsWidget = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  // Mock data - sostituisci con chiamata API reale
  const todaySignal = {
    type: 'SELL_PUT',
    price: 95230,
    confidence: 87,
    expiry: '15 Feb 2025'
  };

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Segnali AI Oggi</CardTitle>
              <p className="text-sm text-muted-foreground">
                {todaySignal ? `${todaySignal.type} · Confidenza ${todaySignal.confidence}%` : 'Nessun segnale'}
              </p>
            </div>
          </div>
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {todaySignal ? (
            <div className="p-4 border rounded-lg bg-success/5 border-success/20">
              <div className="flex items-start justify-between mb-2">
                <Badge variant="success" className="text-sm">
                  {todaySignal.type}
                </Badge>
                <Badge variant="outline">{todaySignal.confidence}% Confidenza</Badge>
              </div>
              <p className="text-lg font-semibold mb-1">BTC @ ${todaySignal.price.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Scadenza: {todaySignal.expiry}</p>

              <Button
                variant="gradient"
                size="sm"
                onClick={() => navigate('/ai-assistant')}
                className="mt-4 w-full"
              >
                Vedi Dettagli e Altri Segnali
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              Nessun segnale disponibile oggi
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
};
```

#### 4.2 AcademyProgressWidget

**File:** `src/components/dashboard/AcademyProgressWidget.tsx`

```tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, ChevronDown, ChevronUp, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AcademyProgressWidget = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  // Mock data - sostituisci con dati reali
  const currentLesson = {
    title: 'Lezione 3: Strategie con Opzioni',
    progress: 80,
    courseId: 'bitcoin-options-101'
  };

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info/10 rounded-lg">
              <GraduationCap className="h-5 w-5 text-info" />
            </div>
            <div>
              <CardTitle className="text-lg">Il Tuo Percorso Formativo</CardTitle>
              <p className="text-sm text-muted-foreground">
                {currentLesson.title}
              </p>
            </div>
          </div>
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{currentLesson.title}</span>
              <span className="text-muted-foreground">{currentLesson.progress}%</span>
            </div>
            <Progress value={currentLesson.progress} className="h-2" />
          </div>

          <Button
            variant="gradient"
            size="sm"
            onClick={() => navigate(`/academy/course/${currentLesson.courseId}`)}
            className="w-full"
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Continua la Lezione
          </Button>
        </CardContent>
      )}
    </Card>
  );
};
```

---

### **FASE 5: Mobile Optimization**

#### 5.1 Fix Responsive Issues

**Trova e sostituisci TUTTE le occorrenze di template literals in className:**

❌ **ERRATO:**
```tsx
className={`space-y-${isMobile ? '4' : '6'}`}
className={`text-${size === 'sm' ? 'sm' : 'base'}`}
```

✅ **CORRETTO:**
```tsx
className={isMobile ? 'space-y-4' : 'space-y-6'}
className={size === 'sm' ? 'text-sm' : 'text-base'}
```

**File da controllare:**
- `src/pages/Index.tsx` (linea 214)
- `src/components/dashboard/StatisticsCards.tsx`
- Tutti i file in `src/components/`

#### 5.2 Mobile-First Layout

**Aggiorna AppLayout per mobile:**

```tsx
// src/components/layout/AppLayout.tsx

// Mobile Layout - Padding sicuro
{(isMobile || isTablet) && (
  <>
    <MobileHeader {...headerProps} />
    <MobileDrawer {...drawerProps} />

    {/* Main Content con safe area */}
    <div className="pt-14 pb-20 px-4 min-h-screen">
      {children}
    </div>

    {/* Bottom Navigation */}
    <BottomNavigation {...navProps} />

    {/* AI Coach FAB - sempre visibile */}
    <FloatingActionButton
      icon={<Bot />}
      onClick={() => navigate('/ai-assistant')}
      className="fixed bottom-24 right-4"
    />
  </>
)}
```

---

### **FASE 6: Unificare State Management**

#### 6.1 Rimuovere Duplicazione

**Problema:** `Index.tsx` e `Strategies.tsx` entrambi usano `useInvestmentCalculator()` in modo isolato.

**Soluzione:** Context Provider globale.

**File:** `src/contexts/StrategyContext.tsx`

```tsx
import { createContext, useContext, ReactNode } from 'react';
import { useInvestmentCalculator } from '@/hooks/useInvestmentCalculator';

const StrategyContext = createContext<ReturnType<typeof useInvestmentCalculator> | null>(null);

export const StrategyProvider = ({ children }: { children: ReactNode }) => {
  const calculator = useInvestmentCalculator();

  return (
    <StrategyContext.Provider value={calculator}>
      {children}
    </StrategyContext.Provider>
  );
};

export const useStrategy = () => {
  const context = useContext(StrategyContext);
  if (!context) {
    throw new Error('useStrategy must be used within StrategyProvider');
  }
  return context;
};
```

**Aggiorna App.tsx:**
```tsx
<AuthProvider>
  <StrategyProvider>
    <RouterProvider router={router} />
  </StrategyProvider>
</AuthProvider>
```

**Aggiorna tutti i componenti:**
```tsx
// Prima:
const { config, updateConfig, ... } = useInvestmentCalculator();

// Dopo:
const { config, updateConfig, ... } = useStrategy();
```

---

### **FASE 7: UI Polish**

#### 7.1 Loading States Unificati

**File:** `src/components/ui/LoadingState.tsx`

```tsx
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton';
  text?: string;
  className?: string;
}

export const LoadingState = ({ type = 'spinner', text, className = '' }: LoadingStateProps) => {
  if (type === 'spinner') {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    );
  }

  // Skeleton loader
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="h-8 bg-muted animate-pulse rounded" />
      <div className="h-32 bg-muted animate-pulse rounded" />
      <div className="h-64 bg-muted animate-pulse rounded" />
    </div>
  );
};
```

**Usa ovunque:**
```tsx
{loading && <LoadingState text="Caricamento dati..." />}
```

#### 7.2 Empty States

**File:** `src/components/ui/EmptyState.tsx`

```tsx
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {action}
    </div>
  );
};
```

**Usa per stati vuoti:**
```tsx
{!strategies.length && (
  <EmptyState
    icon={Target}
    title="Nessuna strategia ancora"
    description="Crea la tua prima strategia di investimento in pochi semplici passi"
    action={
      <Button variant="gradient" onClick={() => setShowWizard(true)}>
        Crea Prima Strategia
      </Button>
    }
  />
)}
```

---

## 🎨 Design Tokens da Mantenere

**NON modificare i colori CSS esistenti in `src/index.css`:**
- ✅ Mantieni il sistema di colori attuale (primary, secondary, success, etc.)
- ✅ Mantieni i gradienti definiti
- ✅ Mantieni il dark mode theme

**DA aggiornare:**
```css
/* Aggiungi utility classes mancanti */
@layer utilities {
  /* Safe area per mobile */
  .safe-top {
    padding-top: env(safe-area-inset-top);
  }
  .safe-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }

  /* Truncate multiline */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
```

---

## 📱 Testing Checklist

Dopo l'implementazione, TESTA:

### Desktop (>1024px)
- [ ] Sidebar collassabile funziona
- [ ] Dashboard unificato mostra tutti i widget
- [ ] Wizard si apre al primo accesso
- [ ] Editing inline della strategia funziona
- [ ] Navigation guards prevengono perdita dati

### Tablet (768px - 1024px)
- [ ] Layout mobile si attiva correttamente
- [ ] Bottom navigation visibile
- [ ] Drawer si apre/chiude smooth
- [ ] Tutti i widget sono scrollabili

### Mobile (<768px)
- [ ] Header mobile ottimizzato
- [ ] Bottom nav thumb-friendly
- [ ] FAB non copre contenuto
- [ ] Forms usabili con tastiera virtuale
- [ ] No horizontal scroll

### Funzionalità
- [ ] Crea nuova strategia (wizard)
- [ ] Modifica strategia esistente
- [ ] Salva/Carica configurazioni
- [ ] Navigation tra sezioni
- [ ] Logout sicuro (con conferma se unsaved)

---

## 🚀 Implementa in Questo Ordine

1. **Setup Base (1-2 ore)**
   - Crea `UnifiedDashboard.tsx`
   - Aggiorna routing in `App.tsx`
   - Aggiorna sidebar navigation

2. **Dashboard Components (3-4 ore)**
   - `StrategyHeroCard.tsx`
   - `StrategyEditorInline.tsx`
   - `AISignalsWidget.tsx`
   - `AcademyProgressWidget.tsx`

3. **Wizard (4-5 ore)**
   - `StrategyWizard.tsx`
   - Wizard steps (Step1, Step2, Step3, Step4)
   - Logica salvataggio post-wizard

4. **State Management (2-3 ore)**
   - `StrategyContext.tsx`
   - Migrare tutti i componenti a `useStrategy()`

5. **Mobile Fixes (2-3 ore)**
   - Fix template literals
   - Test responsive
   - Safe area handling

6. **UI Polish (2-3 ore)**
   - LoadingState, EmptyState
   - Standardizzare spacing
   - Animazioni smooth

7. **Testing (2-3 ore)**
   - Testa tutte le funzionalità
   - Fix bugs
   - Performance audit

**Tempo totale stimato: 16-23 ore**

---

## 💡 Principi da Seguire

1. **Semplicità > Completezza**
   - Mostra solo l'essenziale, nascondi il resto (progressive disclosure)
   - 3 metriche principali nel hero, il resto in dettagli

2. **Consistenza > Varietà**
   - Usa sempre gli stessi pattern (card, button, loading)
   - Non inventare nuovi componenti se esiste già

3. **Mobile-First > Desktop-First**
   - Progetta prima per mobile, poi espandi per desktop
   - Touch-friendly targets (min 44x44px)

4. **Guidato > Libero**
   - Wizard per nuovi utenti
   - Suggerimenti contestuali
   - CTA chiare in ogni stato

5. **Velocità Percepita > Velocità Reale**
   - Loading skeletons invece di spinner
   - Optimistic UI updates
   - Prefetch next likely route

---

## ⚠️ Attenzione

**NON TOCCARE (a meno che necessario):**
- `src/hooks/useInvestmentCalculator.ts` - Logica di business OK
- `src/hooks/useSupabaseConfig.ts` - DB logic OK
- `src/types/` - Type definitions OK
- `src/lib/utils.ts` - Utility functions OK

**MODIFICHE SAFE:**
- Tutti i file in `src/pages/`
- Tutti i file in `src/components/`
- `src/App.tsx` (routing)
- `src/index.css` (solo aggiungere, non rimuovere)

---

## 🎯 Obiettivo Finale

Al termine di questo redesign, l'utente dovrebbe:

1. **Capire subito cosa fa l'app** (primi 5 secondi)
2. **Creare la prima strategia senza aiuto** (<3 minuti)
3. **Navigare senza confusione** (2-3 click per qualsiasi task)
4. **Sentirsi guidato, non perso** (wizard, tooltips, CTA chiare)
5. **Voler tornare ogni giorno** (UI piacevole, feedback positivi)

---

**Ready to build? Start with FASE 1! 🚀**

*Se hai domande o dubbi durante l'implementazione, chiedi chiarimenti prima di procedere.*
