import { useState } from 'react';
import { Download, FileText, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

const SPEC_DOCUMENT = `# 📊 FINANZA CREATIVA - Specifica Tecnica Completa

**Versione:** 2.0  
**Data:** ${new Date().toLocaleDateString('it-IT')}  
**Tipo:** Documento di Specifica per Ricostruzione Applicazione

---

## 📑 Indice

1. [Overview del Progetto](#1-overview-del-progetto)
2. [Stack Tecnologico](#2-stack-tecnologico)
3. [Architettura Database](#3-architettura-database)
4. [Policy di Sicurezza RLS](#4-policy-di-sicurezza-rls)
5. [Struttura Routing](#5-struttura-routing)
6. [Componenti Principali](#6-componenti-principali)
7. [Edge Functions](#7-edge-functions)
8. [Design System](#8-design-system)
9. [Ottimizzazioni Mobile](#9-ottimizzazioni-mobile)
10. [Ottimizzazioni Performance](#10-ottimizzazioni-performance)
11. [Custom Hooks](#11-custom-hooks)
12. [Best Practices](#12-best-practices)
13. [Analytics & Tracking](#13-analytics--tracking)
14. [Checklist Deploy](#14-checklist-deploy)
15. [Note Implementazione](#15-note-implementazione)

---

## 1. Overview del Progetto

### Descrizione
**Finanza Creativa** è una piattaforma web completa per la gestione degli investimenti che combina:
- **Calcolatore Investimenti**: Simulazione strategie con PAC e rendimenti composti
- **Wheel Strategy Trading**: Gestione opzioni BTC con tracking real-time
- **Sistema Educativo Gamificato**: Corsi, quiz, XP, badge e leaderboard
- **AI Coach (FinGenius)**: Assistente AI per analisi e consigli
- **Notifiche Telegram**: Segnali trading e reminder automatici

### Caratteristiche Chiave
- Lingua: Italiano
- Design: Mobile-first, responsive, dark/light mode
- Backend: Supabase (Auth, DB, Edge Functions, Storage)
- Sicurezza: RLS policies, audit logging, rate limiting

---

## 2. Stack Tecnologico

### Frontend
\`\`\`json
{
  "framework": "React 18.3.1",
  "language": "TypeScript 5.x",
  "bundler": "Vite 5.x",
  "styling": "Tailwind CSS 3.x + shadcn/ui",
  "animations": "Motion (Framer Motion) 12.x",
  "routing": "React Router DOM 6.x",
  "state": "TanStack React Query 5.x",
  "charts": "Recharts 2.x",
  "icons": "Lucide React",
  "forms": "React Hook Form + Zod"
}
\`\`\`

### Backend (Supabase)
- **Auth**: Email/Password + Google OAuth
- **Database**: PostgreSQL con RLS
- **Edge Functions**: Deno/TypeScript
- **Storage**: File uploads (avatars, documenti)

### Integrazioni
- **Telegram Bot API**: Notifiche e segnali
- **Stripe**: Pagamenti subscription
- **OpenAI API**: FinGenius AI Coach
- **Google Analytics 4**: Tracking eventi
- **CoinGecko API**: Prezzi BTC real-time

---

## 3. Architettura Database

### Tabelle Principali (43 totali)

#### Investment System
\`\`\`sql
-- Configurazioni investimento
CREATE TABLE investment_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  name TEXT NOT NULL,
  initial_capital NUMERIC NOT NULL,
  daily_return_rate NUMERIC NOT NULL,
  time_horizon INTEGER NOT NULL,
  pac_amount NUMERIC NOT NULL,
  pac_frequency TEXT NOT NULL,
  pac_start_date DATE NOT NULL,
  pac_custom_days INTEGER,
  currency TEXT DEFAULT 'EUR',
  use_real_btc_prices BOOLEAN DEFAULT false,
  is_insured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Rendimenti giornalieri
CREATE TABLE daily_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES investment_configs(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  return_rate NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Override PAC giornalieri
CREATE TABLE daily_pac_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES investment_configs(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  pac_amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pagamenti PAC
CREATE TABLE pac_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES investment_configs(id),
  scheduled_date DATE NOT NULL,
  scheduled_amount NUMERIC NOT NULL,
  is_executed BOOLEAN DEFAULT false,
  executed_date DATE,
  executed_amount NUMERIC,
  execution_notes TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
\`\`\`

#### Wheel Strategy System
\`\`\`sql
-- Trade opzioni
CREATE TABLE options_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  config_id UUID REFERENCES investment_configs(id),
  option_type TEXT NOT NULL, -- 'CSP' | 'CC'
  strike_price_usd NUMERIC NOT NULL,
  premium_usdt NUMERIC NOT NULL,
  premium_percentage NUMERIC NOT NULL,
  capital_employed_usdt NUMERIC NOT NULL,
  expiration_date DATE NOT NULL,
  duration_days INTEGER DEFAULT 7,
  status TEXT DEFAULT 'active', -- 'active' | 'expired' | 'assigned'
  is_assigned BOOLEAN DEFAULT false,
  btc_received NUMERIC,
  settlement_price_usd NUMERIC,
  apy_equivalent NUMERIC,
  user_confirmed BOOLEAN DEFAULT false,
  user_confirmed_at TIMESTAMPTZ,
  confirmation_source TEXT,
  opened_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Posizioni BTC
CREATE TABLE btc_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  config_id UUID REFERENCES investment_configs(id),
  btc_quantity NUMERIC DEFAULT 0,
  avg_cost_basis_usd NUMERIC,
  total_premium_earned_usdt NUMERIC DEFAULT 0,
  total_trades_count INTEGER DEFAULT 0,
  total_assignments_count INTEGER DEFAULT 0,
  last_fill_date DATE,
  last_fill_price_usd NUMERIC,
  last_fill_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Segnali AI Trading
CREATE TABLE ai_trading_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  config_id UUID REFERENCES investment_configs(id),
  signal_date DATE NOT NULL,
  signal_time TIME DEFAULT now()::time,
  btc_price_usd NUMERIC NOT NULL,
  recommended_action TEXT NOT NULL,
  recommended_strike_price NUMERIC,
  recommended_premium_pct NUMERIC,
  confidence_score NUMERIC,
  reasoning TEXT,
  rsi_14 NUMERIC,
  macd_signal TEXT,
  bollinger_position TEXT,
  support_level NUMERIC,
  resistance_level NUMERIC,
  volatility_24h NUMERIC,
  fill_probability NUMERIC,
  will_be_filled BOOLEAN,
  current_position_type TEXT,
  current_strike_price NUMERIC,
  current_expiration DATE,
  insurance_activated BOOLEAN DEFAULT false,
  telegram_sent BOOLEAN DEFAULT false,
  telegram_sent_at TIMESTAMPTZ,
  telegram_chat_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
\`\`\`

#### Education System
\`\`\`sql
-- Corsi
CREATE TABLE educational_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  level course_level DEFAULT 'beginner',
  duration_minutes INTEGER,
  thumbnail_url TEXT,
  prerequisites TEXT[],
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Moduli
CREATE TABLE course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES educational_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Lezioni
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  lesson_type lesson_type DEFAULT 'text',
  video_url TEXT,
  estimated_duration_minutes INTEGER,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Quiz
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id),
  title TEXT NOT NULL,
  questions JSONB NOT NULL,
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
\`\`\`

#### Gamification System
\`\`\`sql
-- Profilo gamification utente
CREATE TABLE user_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES user_profiles(id),
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]',
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Leaderboard settimanale
CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  week_start DATE NOT NULL,
  weekly_xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badge_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Challenge
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL,
  badge_reward TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
\`\`\`

#### User & Security
\`\`\`sql
-- Profili utente
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  admin_role admin_role_type,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  login_count INTEGER DEFAULT 0,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ruoli utente
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Audit log sicurezza
CREATE TABLE security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  admin_user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  accessed_fields TEXT[],
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
\`\`\`

#### Notification System
\`\`\`sql
-- Impostazioni notifiche
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES user_profiles(id),
  notifications_enabled BOOLEAN DEFAULT true,
  preferred_method TEXT DEFAULT 'telegram',
  telegram_chat_id TEXT,
  whatsapp_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Coda notifiche Telegram
CREATE TABLE telegram_notifications_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  telegram_chat_id TEXT NOT NULL,
  message_type TEXT NOT NULL,
  message_text TEXT NOT NULL,
  priority INTEGER DEFAULT 5,
  scheduled_send_time TIMESTAMPTZ,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  related_signal_id UUID REFERENCES ai_trading_signals(id),
  related_coverage_id UUID REFERENCES insurance_coverage_periods(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Codici link Telegram
CREATE TABLE telegram_link_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
\`\`\`

---

## 4. Policy di Sicurezza RLS

### Pattern Standard
\`\`\`sql
-- Abilita RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Policy SELECT: utente vede solo i propri dati
CREATE POLICY "Users can view own data"
ON table_name FOR SELECT
USING (auth.uid() = user_id);

-- Policy INSERT: utente inserisce solo per sé
CREATE POLICY "Users can insert own data"
ON table_name FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy UPDATE: utente modifica solo i propri dati
CREATE POLICY "Users can update own data"
ON table_name FOR UPDATE
USING (auth.uid() = user_id);

-- Policy DELETE: utente elimina solo i propri dati
CREATE POLICY "Users can delete own data"
ON table_name FOR DELETE
USING (auth.uid() = user_id);
\`\`\`

### Policy Admin
\`\`\`sql
-- Admin può vedere tutto (con audit)
CREATE POLICY "Admin can view all data"
ON table_name FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);
\`\`\`

---

## 5. Struttura Routing

\`\`\`typescript
// App.tsx - Route principali
const routes = [
  // Landing Pages (pubbliche)
  { path: "/", element: <WebLanding /> },
  { path: "/educational", element: <EducationalLanding /> },
  
  // Auth
  { path: "/auth", element: <Auth /> },
  { path: "/auth/callback", element: <AuthCallback /> },
  
  // App principale (protette)
  { path: "/strategies", element: <Strategies /> },
  { path: "/wheel-strategy", element: <WheelStrategy /> },
  { path: "/ai-signals", element: <AISignals /> },
  { path: "/coach-ai", element: <CoachAI /> },
  { path: "/settings", element: <Settings /> },
  
  // Education System
  { path: "/education", element: <Education /> },
  { path: "/education/dashboard", element: <EducationDashboard /> },
  { path: "/education/leaderboard", element: <EducationLeaderboard /> },
  { path: "/education/simulator", element: <TradingSimulator /> },
  { path: "/course/:courseId", element: <CourseViewer /> },
  
  // Admin
  { path: "/user-management", element: <UserManagement /> },
  
  // Legal
  { path: "/privacy", element: <Privacy /> },
  { path: "/terms", element: <Terms /> },
  { path: "/disclaimer", element: <Disclaimer /> },
  
  // 404
  { path: "*", element: <NotFound /> }
];
\`\`\`

---

## 6. Componenti Principali

### Investment Calculator
- \`ConfigurationPanel\`: Pannello configurazione strategia
- \`InvestmentChart\`: Grafico crescita capitale (Recharts)
- \`InvestmentSummary\`: Riepilogo investimento
- \`ReportTable\`: Tabella dettaglio giornaliero
- \`VirtualizedReportTable\`: Versione virtualizzata per performance
- \`PerformanceVsPlan\`: Confronto reale vs teorico
- \`StatisticsCards\`: Card statistiche principali

### Wheel Strategy
- \`WheelStrategyDashboard\`: Dashboard principale
- \`PnLDashboard\`: Dashboard P&L
- \`NewOptionForm\`: Form nuova opzione
- \`OptionExpirationConfirm\`: Conferma scadenza
- \`ValidationFeedback\`: Feedback validazione

### Education System
- \`EducationHomePage\`: Home education
- \`EducationDashboard\`: Dashboard progressi
- \`LessonViewer\`: Visualizzatore lezioni
- \`RiskAssessmentQuiz\`: Quiz profilo rischio
- \`TradingSimulator\`: Simulatore paper trading
- \`EducationLeaderboard\`: Classifica
- \`Mascot\`: Prof. Satoshi (mascotte)

### AI Coach
- \`CoachAI\` page con chat interface
- Integrazione OpenAI GPT-4
- Context-aware delle strategie utente

### Layout & Navigation
- \`AppLayout\`: Layout principale con sidebar
- \`ModernSidebar\`: Sidebar desktop
- \`ModernHeader\`: Header con user menu
- \`BottomNavigation\`: Nav mobile
- \`MobileDrawer\`: Menu mobile

---

## 7. Edge Functions

### Core Functions
\`\`\`typescript
// wheel-strategy-analysis - Analisi AI opzioni
// fingenius-chat - AI Coach chat
// fetch-btc-price - Prezzo BTC corrente
// sync-btc-prices - Sync storico prezzi
// check-expirations - Controllo scadenze opzioni
// ai-trading-agent - Generazione segnali
\`\`\`

### Telegram Functions
\`\`\`typescript
// telegram-webhook - Gestione messaggi bot
// telegram-generate-link-code - Genera codice collegamento
// telegram-verify-connection - Verifica collegamento
// telegram-send-test - Invio messaggio test
// telegram-notification-sender - Invio notifiche batch
// telegram-disconnect - Disconnessione account
\`\`\`

### Stripe Functions
\`\`\`typescript
// create-checkout - Crea sessione checkout
// stripe-webhook - Gestione eventi Stripe
// customer-portal - Portal gestione abbonamento
// check-subscription-status - Verifica stato subscription
\`\`\`

### Admin & Backup
\`\`\`typescript
// backup-strategies - Backup automatico strategie
// restore-strategy-backup - Ripristino backup
// admin-restore-backup - Ripristino admin
// recreate-deleted-strategy - Ricrea strategia eliminata
\`\`\`

---

## 8. Design System

### Colori (HSL)
\`\`\`css
:root {
  /* Background */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  
  /* Primary - Accent principale */
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  
  /* Secondary */
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  
  /* Muted */
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  
  /* Accent */
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  
  /* Destructive */
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  
  /* Success */
  --success: 142 76% 36%;
  --success-foreground: 210 40% 98%;
  
  /* Warning */
  --warning: 38 92% 50%;
  --warning-foreground: 222.2 84% 4.9%;
  
  /* Card */
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  
  /* Border & Input */
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  
  /* Radius */
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode values */
}
\`\`\`

### Spacing System
\`\`\`
4px  = 1 (p-1, m-1)
8px  = 2 (p-2, m-2)
12px = 3 (p-3, m-3)
16px = 4 (p-4, m-4)
24px = 6 (p-6, m-6)
32px = 8 (p-8, m-8)
\`\`\`

### Typography
\`\`\`css
/* Font families */
--font-sans: "Inter", system-ui, sans-serif;
--font-display: "Cal Sans", "Inter", sans-serif;

/* Sizes */
text-xs: 0.75rem
text-sm: 0.875rem
text-base: 1rem
text-lg: 1.125rem
text-xl: 1.25rem
text-2xl: 1.5rem
text-3xl: 1.875rem
text-4xl: 2.25rem
\`\`\`

---

## 9. Ottimizzazioni Mobile

### Breakpoints
\`\`\`css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
\`\`\`

### Componenti Mobile-Specific
- \`MobileHeader\`: Header compatto
- \`BottomNavigation\`: Tab bar inferiore
- \`FloatingActionButton\`: FAB per azioni rapide
- \`MobileDrawer\`: Menu slide-in
- \`BottomSheet\`: Sheet dal basso (Vaul)

### Gesture Hooks
- \`useSwipeGesture\`: Swipe left/right/up/down
- \`usePullToRefresh\`: Pull-to-refresh nativo
- \`use-mobile\`: Detect dispositivo mobile

---

## 10. Ottimizzazioni Performance

### Lazy Loading
\`\`\`typescript
const Education = lazy(() => import('./pages/Education'));
const WheelStrategy = lazy(() => import('./pages/WheelStrategy'));
// Wrap in Suspense con fallback
\`\`\`

### React.memo
\`\`\`typescript
const ExpensiveComponent = React.memo(({ data }) => {
  // Rendering costoso
}, (prevProps, nextProps) => {
  return prevProps.data.id === nextProps.data.id;
});
\`\`\`

### Virtual Scrolling
\`\`\`typescript
// Per liste > 100 elementi
import { VirtualizedReportTable } from './VirtualizedReportTable';
// Usa @tanstack/react-virtual internamente
\`\`\`

### Memoization Hooks
\`\`\`typescript
const memoizedValue = useMemo(() => computeExpensive(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a), [a]);
\`\`\`

---

## 11. Custom Hooks

### Authentication
- \`useAuth\`: Gestione autenticazione
- \`useUserRoles\`: Ruoli e permessi utente

### Investments
- \`useInvestmentCalculator\`: Calcoli investimento
- \`useInvestmentData\`: Fetch dati investimento
- \`useConfigurationManager\`: CRUD configurazioni
- \`useConfigurationHistory\`: Undo/Redo

### Supabase
- \`useSupabaseConfig\`: Config Supabase
- \`usePACPayments\`: Gestione pagamenti PAC
- \`useActualTrades\`: Trade reali

### Wheel Strategy
- \`useWheelStrategy\`: Logica wheel strategy
- \`useActiveOption\`: Opzione attiva corrente
- \`useBtcPosition\`: Posizione BTC
- \`useOptionValidation\`: Validazione opzioni

### Education
- \`useEducation\`: Corsi e progressi
- \`useGamification\`: XP, badge, livelli
- \`useLeaderboard\`: Classifica
- \`usePaperTrading\`: Trading simulato

### UI/UX
- \`useMobile\`: Detect mobile
- \`useSwipeGesture\`: Gesture swipe
- \`usePullToRefresh\`: Pull to refresh
- \`useParallax\`: Effetti parallax
- \`useDebouncedCallback\`: Debounce

---

## 12. Best Practices

### Error Handling
\`\`\`typescript
// Centralizzato in utils/errorHandler.ts
export const handleError = (error: unknown, context?: string) => {
  const message = error instanceof Error ? error.message : 'Errore sconosciuto';
  console.error(\`[\${context}]\`, message);
  toast({ title: "Errore", description: message, variant: "destructive" });
};
\`\`\`

### Logging
\`\`\`typescript
// utils/logger.ts
export const logger = {
  info: (msg: string, data?: any) => console.log(\`[INFO] \${msg}\`, data),
  warn: (msg: string, data?: any) => console.warn(\`[WARN] \${msg}\`, data),
  error: (msg: string, data?: any) => console.error(\`[ERROR] \${msg}\`, data),
};
\`\`\`

### Type Safety
\`\`\`typescript
// Usa tipi generati da Supabase
import { Database } from '@/integrations/supabase/types';
type InvestmentConfig = Database['public']['Tables']['investment_configs']['Row'];
\`\`\`

### Validation
\`\`\`typescript
// Con Zod
import { z } from 'zod';
const ConfigSchema = z.object({
  name: z.string().min(1),
  initial_capital: z.number().positive(),
  daily_return_rate: z.number().min(0).max(100),
});
\`\`\`

### Security
\`\`\`typescript
// Sanitize HTML (DOMPurify)
import DOMPurify from 'dompurify';
const safeHtml = DOMPurify.sanitize(userInput);

// Rate limiting (edge functions)
const rateLimit = new Map<string, number[]>();
\`\`\`

---

## 13. Analytics & Tracking

### Google Analytics 4
\`\`\`typescript
import ReactGA from 'react-ga4';

// Init
ReactGA.initialize('G-XXXXXXXXXX');

// Page view
ReactGA.send({ hitType: 'pageview', page: location.pathname });

// Events
ReactGA.event({
  category: 'Investment',
  action: 'create_strategy',
  label: strategyName,
  value: initialCapital
});
\`\`\`

### UTM Tracking
\`\`\`typescript
// Parametri supportati
const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
\`\`\`

---

## 14. Checklist Deploy

### Pre-Deploy
- [ ] Tutte le variabili ambiente configurate
- [ ] RLS policies attive su tutte le tabelle
- [ ] Edge functions deployate e testate
- [ ] Test su mobile (iOS Safari, Android Chrome)
- [ ] Lighthouse score > 90

### Post-Deploy
- [ ] Verifica auth flow (email + Google)
- [ ] Test notifiche Telegram
- [ ] Verifica pagamenti Stripe (test mode)
- [ ] Monitoring errori attivo
- [ ] Backup automatici configurati

---

## 15. Note Implementazione

### Priorità Sviluppo
1. **Core**: Auth, Investment Calculator, Strategies CRUD
2. **Trading**: Wheel Strategy, Opzioni, Segnali AI
3. **Education**: Corsi, Quiz, Gamification
4. **Integrations**: Telegram, Stripe, AI Coach
5. **Polish**: Animazioni, Performance, PWA

### Code Quality
- ESLint + Prettier configurati
- TypeScript strict mode
- Componenti < 300 righe
- Hooks riutilizzabili
- Test unitari per logica critica

### Da Evitare
- ❌ \`any\` type (usa \`unknown\` e type guards)
- ❌ Inline styles (usa Tailwind classes)
- ❌ Console.log in produzione
- ❌ Secrets nel codice (usa env vars)
- ❌ Componenti monolitici

---

## 📎 Appendice

### Variabili Ambiente Richieste
\`\`\`env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GA4_MEASUREMENT_ID=

# Edge Functions (Supabase secrets)
OPENAI_API_KEY=
TELEGRAM_BOT_TOKEN=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
\`\`\`

---

**Documento generato automaticamente da Finanza Creativa**  
**© ${new Date().getFullYear()} - Tutti i diritti riservati**
`;

export const DocumentExporter = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const downloadMarkdown = () => {
    const blob = new Blob([SPEC_DOCUMENT], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finanza-creativa-spec-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download completato",
      description: "Il file Markdown è stato scaricato con successo.",
    });
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 6;
    let y = margin;
    
    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FINANZA CREATIVA', pageWidth / 2, y, { align: 'center' });
    y += 10;
    
    doc.setFontSize(14);
    doc.text('Specifica Tecnica Completa', pageWidth / 2, y, { align: 'center' });
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Versione 2.0 - ${new Date().toLocaleDateString('it-IT')}`, pageWidth / 2, y, { align: 'center' });
    y += 20;

    // Process markdown content
    const lines = SPEC_DOCUMENT.split('\n');
    
    lines.forEach((line) => {
      // Check if we need a new page
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }

      // Headers
      if (line.startsWith('## ')) {
        y += 5;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        const text = line.replace('## ', '').replace(/[#📊📑]/g, '').trim();
        doc.text(text, margin, y);
        y += lineHeight + 2;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
      } else if (line.startsWith('### ')) {
        y += 3;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        const text = line.replace('### ', '').trim();
        doc.text(text, margin, y);
        y += lineHeight + 1;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
      } else if (line.startsWith('#### ')) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        const text = line.replace('#### ', '').trim();
        doc.text(text, margin, y);
        y += lineHeight;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
      } else if (line.startsWith('- ')) {
        // Bullet points
        const text = line.replace('- ', '• ');
        const splitText = doc.splitTextToSize(text, pageWidth - 2 * margin - 5);
        splitText.forEach((t: string) => {
          if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(t, margin + 5, y);
          y += lineHeight;
        });
      } else if (line.startsWith('```')) {
        // Code blocks - skip syntax highlighting marker
        doc.setFont('courier', 'normal');
      } else if (line.trim() === '---') {
        // Horizontal rule
        y += 3;
        doc.setDrawColor(200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;
      } else if (line.trim()) {
        // Regular text
        const cleanLine = line
          .replace(/\*\*/g, '')
          .replace(/`/g, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        
        const splitText = doc.splitTextToSize(cleanLine, pageWidth - 2 * margin);
        splitText.forEach((t: string) => {
          if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(t, margin, y);
          y += lineHeight;
        });
      } else {
        y += 2; // Empty line spacing
      }
    });

    // Footer on last page
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Generato il ${new Date().toLocaleString('it-IT')} - Finanza Creativa`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    doc.save(`finanza-creativa-spec-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "Download completato",
      description: "Il file PDF è stato generato e scaricato.",
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(SPEC_DOCUMENT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copiato!",
        description: "Il documento è stato copiato negli appunti.",
      });
    } catch {
      toast({
        title: "Errore",
        description: "Impossibile copiare negli appunti.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Esporta Specifica Tecnica
            </CardTitle>
            <CardDescription>
              Scarica il documento completo di specifica dell'applicazione
            </CardDescription>
          </div>
          <Badge variant="secondary">v2.0</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={downloadMarkdown} className="flex-1 min-w-[140px]">
            <Download className="h-4 w-4 mr-2" />
            Scarica Markdown
          </Button>
          
          <Button onClick={downloadPDF} variant="secondary" className="flex-1 min-w-[140px]">
            <Download className="h-4 w-4 mr-2" />
            Scarica PDF
          </Button>
          
          <Button onClick={copyToClipboard} variant="outline" className="flex-1 min-w-[140px]">
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copiato!' : 'Copia'}
          </Button>
        </div>

        <Separator />

        {/* Preview toggle */}
        <Button
          variant="ghost"
          onClick={() => setShowPreview(!showPreview)}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? 'Nascondi anteprima' : 'Mostra anteprima'}
          </span>
          <Badge variant="outline">{SPEC_DOCUMENT.split('\n').length} righe</Badge>
        </Button>

        {/* Preview content */}
        {showPreview && (
          <ScrollArea className="h-[500px] w-full rounded-md border p-4 bg-muted/30">
            <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground">
              {SPEC_DOCUMENT}
            </pre>
          </ScrollArea>
        )}

        {/* Document info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">43</div>
            <div className="text-xs text-muted-foreground">Tabelle DB</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">15</div>
            <div className="text-xs text-muted-foreground">Sezioni</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">20+</div>
            <div className="text-xs text-muted-foreground">Edge Functions</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">30+</div>
            <div className="text-xs text-muted-foreground">Custom Hooks</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentExporter;
