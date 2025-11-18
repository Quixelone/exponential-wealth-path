# Wireframes UI - Wealth Compass Redesign 2.0
## Stile: Linear/Stripe/Vercel Inspired

---

## 🎨 DESIGN PRINCIPLES

**Visual Hierarchy**: Informazione chiara e scannable in <3 secondi  
**Breathing Space**: Spacing generoso, non claustrofobico  
**Subtle Depth**: Elevation system minimalista (no heavy shadows)  
**Micro-interactions**: Feedback immediato ad ogni azione  
**Mobile-First**: Touch-friendly, thumb zone optimized

---

## 📱 WIREFRAME 1: DASHBOARD PRINCIPALE (/)

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] Dashboard ▼ | [Search...........] | [🔔3] [👤 Mario] │ ← HEADER (64px)
├─────────────────────────────────────────────────────────────┤
│ ┌───────┬─────────────────────────────────────────────────┐ │
│ │ SIDE  │ MAIN CONTENT AREA                               │ │
│ │ BAR   │                                                 │ │
│ │ (240) │  ┌─ Breadcrumbs: Home > Dashboard              │ │
│ │       │  │                                              │ │
│ │ [🏠]  │  ├─ PAGE TITLE: "Portfolio Performance"        │ │
│ │ Dash  │  │  Subtitle: "Ultimo aggiornamento: 2 min fa" │ │
│ │       │  │                                              │ │
│ │ [📊]  │  ├─ STATISTICS CARDS (Grid 4 cols)             │ │
│ │ Strat │  │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐   │ │
│ │       │  │  │ Card1 │ │ Card2 │ │ Card3 │ │ Card4 │   │ │
│ │ [💼]  │  │  │ €5.2K │ │ +12%  │ │ 42    │ │ €120  │   │ │
│ │ Trade │  │  │ ▲ 8%  │ │ ▼ -2% │ │ [✓]   │ │ [📈] │   │ │
│ │       │  │  └───────┘ └───────┘ └───────┘ └───────┘   │ │
│ │ [🎓]  │  │                                              │ │
│ │ Educa │  ├─ INVESTMENT CHART (Full width)              │ │
│ │       │  │  ┌─────────────────────────────────────┐   │ │
│ │ [⚙️]  │  │  │ [Line Chart Area - 500px height]    │   │ │
│ │ Sett  │  │  │ Interactive legend: ☑ Teorico ☑ Real│   │ │
│ │       │  │  │ Tooltip on hover: Day 45, €4,230   │   │ │
│ │       │  │  └─────────────────────────────────────┘   │ │
│ │ ───   │  │                                              │ │
│ │       │  ├─ REPORT TABLE (Virtualized)                │ │
│ │ [👤]  │  │  ┌──────────────────────────────────────┐  │ │
│ │ Profil│  │  │ Day | PAC | Premium | Capital | BTN  │  │ │
│ │       │  │  │ ─────────────────────────────────────│  │ │
│ │ [🚪]  │  │  │  1  |€100 | €12.50  | €5,112  | [📝]│  │ │
│ │ Logout│  │  │  2  |€100 | €14.20  | €5,226  | [📝]│  │ │
│ │       │  │  │ ... (50 rows visible, scroll 365)    │  │ │
│ └───────┤  │  └──────────────────────────────────────┘  │ │
│         │  └──────────────────────────────────────────── │ │
└─────────┴─────────────────────────────────────────────────┘
```

### ANNOTATIONS:

**HEADER (Sticky, z-index: 50)**
- Height: 64px (desktop), 56px (mobile)
- Background: `bg-background/95 backdrop-blur-lg` (glassmorphism)
- Border: `border-b border-border/40`
- Shadow: `shadow-sm` only on scroll

**SEARCH BAR**
- Width: 320px desktop, full-width mobile
- Placeholder: "Cerca strategia, trade, segnale..." (context-aware)
- Icon: Lucide `Search` 20px, left positioned
- Shortcut hint: "⌘K" badge right (desktop only)
- Focus: `ring-2 ring-primary/20`

**NOTIFICATION BELL**
- Badge: `bg-destructive text-white` with count (max 99+)
- Dropdown: 300px width, max-height 400px scroll
- Item: Icon + Title + Time ago + Unread dot
- Footer: "View all notifications" link

**USER MENU**
- Avatar: 32px circle, fallback initials (M)
- Dropdown: 200px width
  - Profile → Settings
  - Billing → Team (if applicable)
  - Divider
  - Logout (destructive variant)

**SIDEBAR**
- Width: 240px expanded, 64px collapsed (toggle icon top-right)
- Background: `bg-card/50`
- Border: `border-r border-border/40`
- Nav items:
  - Icon: 20px Lucide
  - Label: 14px medium (hidden when collapsed)
  - Active state: `bg-accent text-accent-foreground font-semibold`
  - Hover: `hover:bg-accent/50 transition-colors duration-150`
- Footer: Mini profile card (avatar + name + email truncated)

**STATISTICS CARDS**
- Layout: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`
- Card size: Auto-height, min-height 120px
- Padding: `p-6` (generous)
- Background: `bg-card hover:bg-card/80 transition-all duration-200`
- Border: `border border-border/50`
- Radius: `rounded-xl` (12px)
- Shadow: `shadow-sm hover:shadow-md`
- Content:
  - Icon: 32px, `text-primary`, top-left
  - Title: 12px uppercase tracking-wide `text-muted-foreground`
  - Value: 28px bold `text-foreground`
  - Trend: 14px `text-success/text-destructive` with arrow icon
  - Sparkline: Mini line chart (optional, 40px height)

**INVESTMENT CHART**
- Height: 500px desktop, 300px mobile
- Padding: `p-6`
- Background: `bg-card`
- Border: `border border-border/50 rounded-xl`
- Legend:
  - Position: Top-right, inline with title
  - Checkboxes: Interactive toggle series
  - Colors: Use semantic tokens (primary, success)
- Tooltip:
  - Background: `bg-popover border border-border shadow-lg`
  - Content: Day, Date, Value formatted €, Percentage
  - Animation: `fade-in-0 zoom-in-95 duration-150`
- Axes:
  - Labels: 14px `text-muted-foreground`
  - Grid: `stroke-border/20` (subtle)

**REPORT TABLE**
- Height: Auto, max-height 600px with scroll
- Header: Sticky, `bg-background/95 backdrop-blur`
- Columns:
  - Day: 60px fixed
  - PAC: 100px, right-aligned numbers
  - Premium: 120px, right-aligned
  - Capital: 150px, right-aligned, bold
  - Actions: 80px, icon buttons (Edit, Delete)
- Rows:
  - Height: 48px (touch-friendly)
  - Zebra: `even:bg-muted/30` (very subtle)
  - Hover: `hover:bg-accent/20`
  - Selected: `bg-primary/10 border-l-2 border-primary`
- Pagination: Bottom, center-aligned
  - Arrows: Icon buttons
  - Page info: "1-50 of 365 results"
  - Jump to: Input field (optional)

---

## 📱 WIREFRAME 2: MOBILE DASHBOARD (< 768px)

```
┌─────────────────────────────┐
│ [☰] Dashboard    [🔔3] [👤] │ ← 56px header
├─────────────────────────────┤
│                             │
│ ┌─ Swipe carousel ───────┐ │
│ │ [Card 1] [Card 2] ...   │ │ ← Horizontal scroll
│ └─────────────────────────┘ │
│                             │
│ ┌─ Chart (collapsed) ─────┐│
│ │ [Tap to expand]          ││ ← 200px preview
│ └──────────────────────────┘│
│                             │
│ ┌─ Quick Actions ──────────┐│
│ │ [+ New Trade] [💰 PAC]   ││
│ └──────────────────────────┘│
│                             │
│ ┌─ Recent Trades (5) ──────┐│
│ │ Day 45 | €12.50 | [>]    ││
│ │ Day 44 | €11.80 | [>]    ││
│ └──────────────────────────┘│
│                             │
├─────────────────────────────┤
│ [🏠] [📊] [💼] [🎓] [⚙️]    │ ← Bottom nav
└─────────────────────────────┘
```

### ANNOTATIONS:

**HAMBURGER MENU**
- Opens drawer from left (240px width)
- Same nav structure as desktop sidebar
- Backdrop: `bg-background/80 backdrop-blur-sm`
- Gesture: Swipe right to open, left to close

**CARDS CAROUSEL**
- Layout: Horizontal scroll, snap mandatory
- Card width: 85vw (shows next card edge)
- Gap: 16px
- Scroll indicator: Dots below (active dot primary)

**CHART PREVIEW**
- Collapsed: 200px height, legend hidden
- Expanded: Full screen modal (90vh)
  - Header: Title + Close button
  - Content: Full interactive chart
  - Gesture: Pinch to zoom, pan

**QUICK ACTIONS**
- Floating Action Button style
- Primary action: "+ New Trade" (gradient primary)
- Secondary: "💰 PAC Payment" (outline)
- Position: Sticky top after scroll

**BOTTOM NAVIGATION**
- Height: 64px (thumb-friendly)
- Background: `bg-card/95 backdrop-blur-lg`
- Border: `border-t border-border/40`
- Icons: 24px, active with label (12px)
- Active state: `text-primary` with animated underline

---

## 📱 WIREFRAME 3: STRATEGIE LIST & EDIT

### Desktop Layout
```
┌─────────────────────────────────────────────────┐
│ HEADER (same as Dashboard)                      │
├─────┬───────────────────────────────────────────┤
│ SIDE│ ┌─ Breadcrumbs: Home > Strategie          │
│ BAR │ │                                          │
│     │ ├─ PAGE HEADER                            │
│     │ │  "Le tue Strategie"                     │
│     │ │  [+ Nuova Strategia] [⚙️ Impostazioni]  │
│     │ │                                          │
│     │ ├─ FILTERS BAR (Sticky)                   │
│     │ │  [All] [Attive] [Archiviate] [Assicurate]│
│     │ │  Search: [🔍 Cerca strategia...]        │
│     │ │                                          │
│     │ ├─ STRATEGY CARDS (Grid 2 cols)           │
│     │ │  ┌────────────────┐ ┌────────────────┐ │
│     │ │  │ Strategy Card  │ │ Strategy Card  │ │
│     │ │  │ "BTC Wheel Q1" │ │ "Conservative" │ │
│     │ │  │ ──────────────│ │ ──────────────│ │
│     │ │  │ Capital: €5K   │ │ Capital: €10K  │ │
│     │ │  │ PAC: €100/day  │ │ PAC: €50/day   │ │
│     │ │  │ Return: +12%   │ │ Return: +8%    │ │
│     │ │  │ ──────────────│ │ ──────────────│ │
│     │ │  │ [View] [Edit]  │ │ [View] [Edit]  │ │
│     │ │  └────────────────┘ └────────────────┘ │
│     │ │                                          │
│     │ └──────────────────────────────────────── │
└─────┴───────────────────────────────────────────┘
```

### STRATEGY CARD ANATOMY
```
┌────────────────────────────────────┐
│ [🛡️ Insured] [⭐ Favorite]   [•••] │ ← Header badges + menu
├────────────────────────────────────┤
│                                    │
│ 📊 Strategy Name (18px bold)       │
│ Created: 15 Jan 2025 · 45 days    │ ← Metadata
│                                    │
│ ┌─ Key Metrics (Grid 2x2) ───────┐│
│ │ Capital Initial  | Capital Now  ││
│ │ €5,000          | €5,624 ▲ 12% ││
│ │                                 ││
│ │ PAC Amount      | Total PAC     ││
│ │ €100/day        | €4,500        ││
│ └──────────────────────────────────┘│
│                                    │
│ ┌─ Mini Chart (80px) ─────────────┐│
│ │ [Sparkline trend últimos 30d]   ││
│ └──────────────────────────────────┘│
│                                    │
│ [👁️ View Details] [✏️ Edit Config] │ ← Primary actions
│ [📥 Export CSV] [🗑️ Archive]       │ ← Secondary actions
└────────────────────────────────────┘
```

### EDIT STRATEGY DIALOG (Modal)
```
┌─────────────────────────────────────────┐
│ ← Back    Edit Strategy    [✓ Save]  [X]│ ← 64px header
├─────────────────────────────────────────┤
│                                         │
│ ┌─ TABS ─────────────────────────────┐ │
│ │ [General] [PAC] [Returns] [Insurance]│
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─ TAB CONTENT: General ──────────────┐│
│ │                                      ││
│ │ Strategy Name *                      ││
│ │ [BTC Wheel Q1__________]             ││
│ │                                      ││
│ │ Initial Capital * (EUR)              ││
│ │ [5000_____] [▼ EUR|USD|USDT]        ││
│ │                                      ││
│ │ Time Horizon (days)                  ││
│ │ [365_____] ◀────────▶ [slider]      ││
│ │                                      ││
│ │ ☑ Use Real BTC Prices (Live API)    ││
│ │                                      ││
│ └──────────────────────────────────────┘│
│                                         │
│ ┌─ PREVIEW SUMMARY ────────────────────┐│
│ │ Estimated Final Capital: €7,240      ││
│ │ Total Return: +44.8%                 ││
│ │ Daily Avg Premium: €12.50            ││
│ └──────────────────────────────────────┘│
│                                         │
│ [← Back] [Cancel] [Save Changes]       │
└─────────────────────────────────────────┘
```

---

## 📱 WIREFRAME 4: LANDING PAGE (/)

### Hero Section (Full viewport)
```
┌───────────────────────────────────────────────────┐
│ [Logo Wealth] [Features] [Pricing] [Login] [CTA] │ ← Navbar transparent
│                                                   │
│          ┌─ Hero Content (Center) ──────────┐    │
│          │                                   │    │
│          │ Fai Crescere il tuo Bitcoin      │    │ ← H1: 56px
│          │ con la Wheel Strategy             │    │
│          │                                   │    │
│          │ Genera rendite passive con        │    │ ← Subtitle: 20px
│          │ opzioni covered call automatiche  │    │
│          │                                   │    │
│          │ [🚀 Inizia Gratis] [▶️ Demo]     │    │ ← CTAs 18px
│          │                                   │    │
│          │ ⭐⭐⭐⭐⭐ 4.9/5 da 127 trader     │    │ ← Social proof
│          │                                   │    │
│          └───────────────────────────────────┘    │
│                                                   │
│ ┌─ Animated Dashboard Mockup (Perspective) ────┐ │
│ │ [Screenshot app con blur-fade-in animation]  │ │ ← 600px height
│ └──────────────────────────────────────────────┘ │
│                                                   │
└───────────────────────────────────────────────────┘
```

### Features Section (3 cards)
```
┌───────────────────────────────────────────────────┐
│                                                   │
│ Come Funziona (Center, 36px)                      │
│ La strategia professionale, semplificata          │
│                                                   │
│ ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│ │ [Icon]  │  │ [Icon]  │  │ [Icon]  │           │
│ │ Configur│  │ Automatiza│  │ Monitora│           │
│ │ Capital │  │ Segnali AI│  │ Profitti│           │
│ │ e PAC   │  │ & Notific │  │ Real-time│           │
│ │         │  │           │  │         │           │
│ │ [Learn]  │  │ [Learn]   │  │ [Learn] │           │
│ └─────────┘  └─────────┘  └─────────┘           │
│                                                   │
└───────────────────────────────────────────────────┘
```

### Pricing Section (3 tiers)
```
┌───────────────────────────────────────────────────┐
│                                                   │
│ Prezzi Semplici, Valore Reale (36px)             │
│ Scegli il piano perfetto per te                   │
│                                                   │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│ │ FREE     │ │ PRO ⭐   │ │ PREMIUM  │          │
│ │ €0/mese  │ │ €29/mese │ │ €99/mese │          │
│ │──────────│ │──────────│ │──────────│          │
│ │ ✓ 1 Strat│ │ ✓ 5 Strat│ │ ✓ Illimit│          │
│ │ ✓ AI Base│ │ ✓ AI Adv │ │ ✓ AI VIP │          │
│ │ ✗ Insuran│ │ ✓ Insuran│ │ ✓ Priority│          │
│ │          │ │          │ │          │          │
│ │ [Start]  │ │ [Start]  │ │ [Contact]│          │
│ └──────────┘ └──────────┘ └──────────┘          │
│                                                   │
└───────────────────────────────────────────────────┘
```

### Testimonials (Carousel)
```
┌───────────────────────────────────────────────────┐
│ Cosa Dicono i Trader (36px)                       │
│                                                   │
│ ┌────────────────────────────────────────────┐   │
│ │ "Ho generato €2,400 in 3 mesi con capitale │   │
│ │  iniziale di €5,000. Risultati reali!"    │   │
│ │  - Marco R., Trader da 2 anni              │   │
│ │  ⭐⭐⭐⭐⭐                                    │   │
│ └────────────────────────────────────────────┘   │
│ [◀] [▶] Dots: ● ○ ○                              │
└───────────────────────────────────────────────────┘
```

### Final CTA Section
```
┌───────────────────────────────────────────────────┐
│                                                   │
│ Inizia a Generare Rendite Oggi (48px)            │
│ Nessuna carta di credito richiesta. Free forever. │
│                                                   │
│ [🚀 Crea il tuo Account Gratis]                   │ ← Primary CTA
│ [📅 Prenota una Demo 1-to-1]                      │ ← Secondary CTA
│                                                   │
└───────────────────────────────────────────────────┘
```

---

## 🎯 KEY UI PATTERNS RIEPILOGO

### Buttons
- **Primary**: `bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6`
- **Secondary**: `bg-secondary text-secondary-foreground hover:bg-secondary/80`
- **Outline**: `border-2 border-input bg-background hover:bg-accent`
- **Ghost**: `hover:bg-accent hover:text-accent-foreground`
- **Destructive**: `bg-destructive text-destructive-foreground hover:bg-destructive/90`
- **Icon only**: `h-9 w-9` (40px min touch target mobile)

### Input Fields
- Height: `h-10` (40px)
- Padding: `px-3`
- Border: `border border-input`
- Focus: `focus-visible:ring-2 ring-ring ring-offset-2`
- Error: `border-destructive focus-visible:ring-destructive`

### Cards
- Padding: `p-6`
- Border: `border border-border/50`
- Radius: `rounded-xl`
- Shadow: `shadow-sm hover:shadow-md transition-shadow duration-200`
- Background: `bg-card text-card-foreground`

### Modals/Dialogs
- Width: `max-w-lg` (512px) default, `max-w-4xl` per complex forms
- Padding: `p-6`
- Backdrop: `bg-background/80 backdrop-blur-sm`
- Animation: `data-[state=open]:animate-in data-[state=closed]:animate-out`

### Toast Notifications
- Position: Bottom-right desktop, bottom center mobile
- Width: `max-w-sm`
- Duration: 5s default, 3s success, 7s error
- Actions: Icon (variant-specific) + Message + Close button
- Variants: Success (green), Error (red), Warning (yellow), Info (blue)

### Empty States
- Icon: 48px, `text-muted-foreground`
- Title: 18px semibold
- Description: 14px `text-muted-foreground`
- CTA: Primary button "Create your first..."

### Loading States
- Skeleton: `animate-pulse bg-muted rounded`
- Spinner: 20px default, 32px large, `animate-spin text-primary`
- Progressive: Shimmer effect con gradient

---

## 📐 SPACING REFERENCE

```
xs:  4px   (gap-1)    → Icon-to-text
sm:  8px   (gap-2)    → Inline elements
md:  16px  (gap-4)    → Card internal padding
lg:  24px  (gap-6)    → Section spacing
xl:  32px  (gap-8)    → Major sections
2xl: 48px  (gap-12)   → Page sections
3xl: 64px  (gap-16)   → Hero sections
```

## 🎨 ELEVATION (Z-INDEX)

```
z-0:  Base content
z-10: Dropdown menus, tooltips
z-20: Sticky headers, floating buttons
z-30: Modals, dialogs
z-40: Toast notifications
z-50: Top-level overlays (hamburger menu)
```

---

**Next Steps**: Implementazione Style Guide aggiornato + Task Breakdown Day 1-15
