# Style Guide 2.0 - Wealth Compass
## Design System Completo (Linear/Stripe/Vercel Inspired)

---

## 🎨 COLOR PALETTE (HSL Format)

### Semantic Colors (Light Mode)
```css
/* Primary - Bitcoin Blue (più contrastato) */
--primary: 217 91% 60%;           /* #3b82f6 → #2563EB */
--primary-foreground: 0 0% 100%;  /* White text on primary */

/* Secondary - Bitcoin Orange accent */
--secondary: 25 95% 53%;          /* #F7931A (Bitcoin logo) */
--secondary-foreground: 0 0% 100%;

/* Background & Surface */
--background: 0 0% 100%;          /* Pure white */
--foreground: 222 47% 11%;        /* Near black (#0F172A) */

--card: 0 0% 100%;                /* White cards */
--card-foreground: 222 47% 11%;

--popover: 0 0% 100%;
--popover-foreground: 222 47% 11%;

/* Muted (subtle backgrounds) */
--muted: 210 40% 96%;             /* Very light gray (#F1F5F9) */
--muted-foreground: 215 16% 47%;  /* Medium gray text */

/* Accent (hover states, highlights) */
--accent: 210 40% 96%;            /* Same as muted */
--accent-foreground: 222 47% 11%;

/* Borders */
--border: 214 32% 91%;            /* Light border (#E2E8F0) */
--input: 214 32% 91%;             /* Same as border */
--ring: 217 91% 60%;              /* Primary for focus ring */

/* Semantic Status Colors */
--success: 142 76% 36%;           /* Green (#16A34A) */
--success-foreground: 0 0% 100%;

--warning: 38 92% 50%;            /* Amber (#F59E0B) */
--warning-foreground: 0 0% 100%;

--destructive: 0 84% 60%;         /* Red (#EF4444) */
--destructive-foreground: 0 0% 100%;

--info: 199 89% 48%;              /* Blue (#0EA5E9) */
--info-foreground: 0 0% 100%;
```

### Semantic Colors (Dark Mode)
```css
.dark {
  /* Primary - Lighter for better contrast on dark */
  --primary: 217 91% 65%;         /* Lighter blue */
  --primary-foreground: 222 47% 11%;

  /* Secondary */
  --secondary: 25 95% 58%;        /* Slightly lighter orange */
  --secondary-foreground: 222 47% 11%;

  /* Background & Surface */
  --background: 222 47% 11%;      /* Dark slate (#0F172A) */
  --foreground: 210 40% 98%;      /* Almost white */

  --card: 217 33% 17%;            /* Elevated dark (#1E293B) */
  --card-foreground: 210 40% 98%;

  --popover: 217 33% 17%;
  --popover-foreground: 210 40% 98%;

  /* Muted */
  --muted: 217 33% 17%;           /* Same as card */
  --muted-foreground: 215 20% 65%; /* Lighter gray */

  /* Accent */
  --accent: 217 33% 17%;
  --accent-foreground: 210 40% 98%;

  /* Borders */
  --border: 217 33% 24%;          /* Subtle border (#334155) */
  --input: 217 33% 24%;
  --ring: 217 91% 65%;

  /* Semantic (same hue, adjusted lightness) */
  --success: 142 76% 45%;
  --warning: 38 92% 60%;
  --destructive: 0 84% 65%;
  --info: 199 89% 55%;
}
```

### Gradient System
```css
/* Primary gradient (hero, CTAs) */
--gradient-primary: linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(199 89% 48%) 100%);

/* Bitcoin gradient (brand elements) */
--gradient-bitcoin: linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(25 95% 53%) 100%);

/* Success gradient */
--gradient-success: linear-gradient(135deg, hsl(142 76% 36%) 0%, hsl(158 64% 52%) 100%);

/* Glass effect (modals, cards) */
--gradient-glass: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);

/* Dark mode adjustments */
.dark {
  --gradient-glass: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
}
```

---

## 📝 TYPOGRAPHY SYSTEM

### Font Family
```css
/* Primary: Inter (Google Fonts) */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace: JetBrains Mono (optional for code/numbers) */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

### Font Sizes (Fluid Scale)
```css
/* Display (Hero sections) */
--text-display-lg: clamp(3rem, 6vw, 4rem);      /* 48-64px */
--text-display-md: clamp(2.5rem, 5vw, 3.5rem);  /* 40-56px */
--text-display-sm: clamp(2rem, 4vw, 3rem);      /* 32-48px */

/* Headings */
--text-h1: clamp(1.75rem, 3vw, 2.25rem);        /* 28-36px */
--text-h2: clamp(1.5rem, 2.5vw, 2rem);          /* 24-32px */
--text-h3: clamp(1.25rem, 2vw, 1.5rem);         /* 20-24px */
--text-h4: 1.125rem;                             /* 18px */

/* Body */
--text-body-lg: 1.125rem;                        /* 18px */
--text-body: 1rem;                               /* 16px */
--text-body-sm: 0.875rem;                        /* 14px */

/* Supporting */
--text-caption: 0.75rem;                         /* 12px */
--text-overline: 0.625rem;                       /* 10px */
```

### Font Weights
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### Line Heights
```css
--leading-tight: 1.2;    /* Headings */
--leading-snug: 1.375;   /* Subheadings */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.75; /* Long-form content */
```

### Letter Spacing
```css
--tracking-tight: -0.02em;  /* Display text */
--tracking-normal: 0;       /* Body */
--tracking-wide: 0.025em;   /* Labels, buttons */
--tracking-wider: 0.05em;   /* Uppercase labels */
```

---

## 📐 SPACING SYSTEM (8px Base Unit)

### Scale
```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px  - Icon spacing */
--space-2: 0.5rem;    /* 8px  - Inline elements */
--space-3: 0.75rem;   /* 12px - Small gaps */
--space-4: 1rem;      /* 16px - Default gap */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px - Card padding */
--space-8: 2rem;      /* 32px - Section spacing */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px - Major sections */
--space-16: 4rem;     /* 64px - Hero spacing */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### Component-Specific Spacing
```css
/* Button padding */
--btn-padding-sm: 0.5rem 1rem;       /* 8px 16px */
--btn-padding-md: 0.625rem 1.5rem;   /* 10px 24px */
--btn-padding-lg: 0.75rem 2rem;      /* 12px 32px */

/* Card padding */
--card-padding-sm: 1rem;             /* 16px */
--card-padding-md: 1.5rem;           /* 24px */
--card-padding-lg: 2rem;             /* 32px */

/* Section padding */
--section-padding-y: clamp(3rem, 8vw, 6rem); /* 48-96px */
--section-padding-x: clamp(1rem, 4vw, 2rem); /* 16-32px */
```

---

## 🔲 BORDER RADIUS

```css
--radius-sm: 0.375rem;   /* 6px  - Badges, tags */
--radius-md: 0.5rem;     /* 8px  - Buttons, inputs */
--radius-lg: 0.75rem;    /* 12px - Cards */
--radius-xl: 1rem;       /* 16px - Modals */
--radius-2xl: 1.5rem;    /* 24px - Hero cards */
--radius-full: 9999px;   /* Pills, avatars */
```

---

## 🌑 SHADOWS & ELEVATION

### Light Mode
```css
/* Subtle shadows for cards */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

/* Colored shadows (primary) */
--shadow-primary: 0 8px 16px -4px hsla(217, 91%, 60%, 0.3);

/* Inset shadows (inputs) */
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
```

### Dark Mode
```css
.dark {
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.5);

  --shadow-primary: 0 8px 16px -4px hsla(217, 91%, 65%, 0.4);
}
```

---

## 🎭 TRANSITIONS & ANIMATIONS

### Timing Functions
```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Durations
```css
--duration-fast: 150ms;      /* Hover, focus */
--duration-base: 200ms;      /* Default transitions */
--duration-slow: 300ms;      /* Modals, complex animations */
--duration-slower: 500ms;    /* Page transitions */
```

### Common Transitions
```css
/* Button hover */
.transition-button {
  transition: all var(--duration-fast) var(--ease-out);
}

/* Card elevation */
.transition-card {
  transition: box-shadow var(--duration-base) var(--ease-out);
}

/* Modal entrance */
.transition-modal {
  transition: opacity var(--duration-slow) var(--ease-out),
              transform var(--duration-slow) var(--ease-out);
}
```

### Keyframe Animations
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## 🧩 COMPONENT VARIANTS

### Button Variants
```tsx
// Primary (default)
<Button variant="default" size="default">
  Continue
</Button>

// Secondary
<Button variant="secondary">
  Cancel
</Button>

// Outline
<Button variant="outline">
  <Settings className="mr-2 h-4 w-4" />
  Settings
</Button>

// Ghost (subtle hover)
<Button variant="ghost">
  Learn More
</Button>

// Destructive
<Button variant="destructive">
  <Trash className="mr-2 h-4 w-4" />
  Delete
</Button>

// Link (no background)
<Button variant="link">
  Forgot password?
</Button>

// Icon only
<Button variant="ghost" size="icon">
  <Bell className="h-5 w-5" />
</Button>

// With loading state
<Button loading loadingText="Saving...">
  Save Changes
</Button>
```

### Card Variants
```tsx
// Default card
<Card className="p-6">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer actions</CardFooter>
</Card>

// Hoverable card (with lift effect)
<Card className="p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
  ...
</Card>

// Glass card (glassmorphism)
<Card className="bg-card/50 backdrop-blur-xl border-border/50">
  ...
</Card>

// Gradient border card
<Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
  ...
</Card>
```

### Badge Variants
```tsx
// Default
<Badge>Beta</Badge>

// Secondary
<Badge variant="secondary">New</Badge>

// Outline
<Badge variant="outline">Pro</Badge>

// Destructive
<Badge variant="destructive">Error</Badge>

// Success (custom)
<Badge className="bg-success text-success-foreground">
  Active
</Badge>

// With icon
<Badge>
  <Check className="mr-1 h-3 w-3" />
  Verified
</Badge>
```

### Input Variants
```tsx
// Standard input
<Input type="text" placeholder="Enter email..." />

// With icon (left)
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input className="pl-10" placeholder="Search..." />
</div>

// With icon (right)
<div className="relative">
  <Input placeholder="Password" type="password" />
  <Eye className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer" />
</div>

// Error state
<Input className="border-destructive focus-visible:ring-destructive" />
<p className="text-destructive text-sm mt-1">This field is required</p>

// Success state
<Input className="border-success focus-visible:ring-success" />
<p className="text-success text-sm mt-1">Email available</p>
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
/* Mobile First Approach */
--screen-sm: 640px;   /* Tablet portrait */
--screen-md: 768px;   /* Tablet landscape */
--screen-lg: 1024px;  /* Desktop */
--screen-xl: 1280px;  /* Large desktop */
--screen-2xl: 1536px; /* Extra large */

/* Usage in Tailwind */
/* Default: mobile */
<div className="px-4 sm:px-6 md:px-8 lg:px-12">
  /* Padding increases with screen size */
</div>

/* Grid responsive */
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  /* 1 col mobile, 2 tablet, 4 desktop */
</div>
```

---

## 🎯 ACCESSIBILITY GUIDELINES

### Color Contrast
- **AA Standard (minimum)**: 4.5:1 for normal text, 3:1 for large text (18px+)
- **AAA Standard (enhanced)**: 7:1 for normal text, 4.5:1 for large text
- **Tool**: Use WebAIM Contrast Checker

### Focus States
```css
/* All interactive elements MUST have visible focus */
.focus-visible:outline-none 
.focus-visible:ring-2 
.focus-visible:ring-ring 
.focus-visible:ring-offset-2
```

### Keyboard Navigation
- Tab order: Logical flow (left-to-right, top-to-bottom)
- Skip links: "Skip to main content" for screen readers
- Arrow keys: Navigate lists, menus, tabs
- Enter/Space: Activate buttons, links
- Escape: Close modals, dropdowns

### Screen Reader Support
```tsx
// Always include aria-labels for icon-only buttons
<Button variant="ghost" size="icon" aria-label="Open notifications">
  <Bell className="h-5 w-5" />
</Button>

// Use aria-describedby for error messages
<Input
  id="email"
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && (
  <p id="email-error" className="text-destructive text-sm mt-1">
    Invalid email address
  </p>
)}

// Loading states
<Button disabled aria-busy="true">
  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
  Loading...
</Button>
```

### Touch Targets (Mobile)
- **Minimum size**: 44x44px (iOS), 48x48px (Android Material Design)
- **Spacing**: Minimum 8px between interactive elements
- **Feedback**: Visual indication on tap (scale, background change)

---

## 🚀 PERFORMANCE BEST PRACTICES

### Image Optimization
```tsx
// Use Next.js Image component (if migrating to Next.js)
import Image from 'next/image'

<Image
  src="/hero-dashboard.png"
  alt="Dashboard preview"
  width={1200}
  height={800}
  priority // Above fold images
  placeholder="blur" // Loading placeholder
/>

// Or use native lazy loading
<img
  src="/chart.png"
  alt="Investment chart"
  loading="lazy"
  width="600"
  height="400"
/>
```

### Code Splitting
```tsx
// Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))

// Wrap with Suspense
<Suspense fallback={<LoadingState />}>
  <Dashboard />
</Suspense>
```

### Font Loading
```css
/* Use font-display: swap to prevent FOIT */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap;
}
```

---

## 🎨 DESIGN TOKENS IN CODE

### index.css Implementation
```css
@layer base {
  :root {
    /* Colors from this style guide */
    --primary: 217 91% 60%;
    --primary-foreground: 0 0% 100%;
    /* ... all other colors ... */

    /* Spacing */
    --space-1: 0.25rem;
    /* ... rest of spacing scale ... */

    /* Typography */
    --font-sans: 'Inter', sans-serif;
    --text-h1: clamp(1.75rem, 3vw, 2.25rem);
    /* ... rest of type scale ... */

    /* Radius */
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    /* ... rest of radius scale ... */
  }

  .dark {
    /* Dark mode overrides */
    --primary: 217 91% 65%;
    --background: 222 47% 11%;
    /* ... rest of dark mode colors ... */
  }
}
```

### Tailwind Config Extension
```js
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        // ... map all CSS variables
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        // ... map spacing scale
      },
      fontSize: {
        'h1': 'var(--text-h1)',
        'h2': 'var(--text-h2)',
        // ... map type scale
      },
      borderRadius: {
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        // ... map radius scale
      },
    },
  },
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

- [ ] Update `index.css` with new color palette (HSL values)
- [ ] Extend `tailwind.config.ts` with custom tokens
- [ ] Install Inter font (Google Fonts or self-hosted)
- [ ] Update `Button` component with new variants
- [ ] Update `Card` component with hover states
- [ ] Update `Badge` component with status variants
- [ ] Create `LoadingState` skeleton component
- [ ] Create `EmptyState` component with illustrations
- [ ] Implement focus-visible styles globally
- [ ] Add smooth transitions to all interactive elements
- [ ] Test color contrast with WebAIM tool
- [ ] Test keyboard navigation flow
- [ ] Test screen reader support (NVDA/JAWS)
- [ ] Test mobile touch targets (min 44x44px)
- [ ] Optimize images (WebP format, lazy loading)
- [ ] Implement code splitting for routes
- [ ] Set up font-display: swap
- [ ] Run Lighthouse audit (target: 90+ Performance, 100 Accessibility)

---

**Next Document**: Task Breakdown Day 1-15 con implementazione prioritizzata
