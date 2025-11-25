# Landing Pages Documentation

## Overview

The project has multiple landing pages optimized for different purposes:

## 1. Main Platform Landing (`/`)
**File**: `src/pages/WebLanding.tsx`

Main landing page for the platform showcasing all features.

**Purpose**: General platform promotion
**Target**: All potential users
**Features**:
- Full platform overview
- Feature showcase
- Platform technology stack
- Pricing tiers
- Testimonials & FAQ

## 2. Educational Landing (`/educational`) - NEW!
**File**: `src/pages/EducationalLanding.tsx`

Dedicated landing page for educational courses and Bitcoin trading academy.

**Purpose**: Marketing campaigns for Bitcoin trading courses
**Target**: Aspiring Bitcoin traders, students
**Features**:
- AI Tutor "Prof Satoshi" showcase
- Gamification highlights (XP, badges, leaderboard)
- Paper trading simulator demo
- 3-tier pricing (Free/Pro/Enterprise)
- Social proof with testimonials
- UTM parameter tracking
- Google Analytics integration

### Components Structure

```
src/components/educational-landing/
├── LandingNavbar.tsx          # Custom navbar with smooth scroll
├── LandingHero.tsx            # Hero section with Prof Satoshi
├── LandingStats.tsx           # Animated statistics counters
├── LandingFeatures.tsx        # 6 feature cards with icons
├── LandingProfSatoshi.tsx     # AI tutor section
├── LandingHowItWorks.tsx      # 3-step process
├── LandingTestimonials.tsx    # User testimonials
├── LandingPricing.tsx         # Pricing plans
├── LandingFooter.tsx          # Footer with links
├── AnimatedCounter.tsx        # Reusable counter component
└── FloatingOrb.tsx            # Animated background orbs
```

## Education System Routes

After signup, users access the education system:

- `/education` - Main hub (EducationHomePage.tsx)
- `/education/dashboard` - Student progress dashboard
- `/education/leaderboard` - Global leaderboard
- `/education/simulation` - Paper trading simulator
- `/education/course/:courseId` - Course viewer

## UTM Tracking

### Campaign URL Format

```
https://finanzacreativa.live/educational?utm_source={source}&utm_campaign={campaign}&utm_medium={medium}
```

### Examples

**Facebook Ads:**
```
https://finanzacreativa.live/educational?utm_source=facebook&utm_campaign=corso_btc_maggio&utm_medium=ads
```

**Google Ads:**
```
https://finanzacreativa.live/educational?utm_source=google&utm_campaign=bitcoin_trading&utm_medium=cpc
```

**Email Campaign:**
```
https://finanzacreativa.live/educational?utm_source=newsletter&utm_campaign=corso_lancio&utm_medium=email
```

**Instagram:**
```
https://finanzacreativa.live/educational?utm_source=instagram&utm_campaign=corso_btc&utm_medium=social
```

### UTM Parameters Captured

The landing page automatically captures and stores:
- `utm_source` - Traffic source (facebook, google, newsletter, etc.)
- `utm_campaign` - Campaign identifier
- `utm_medium` - Marketing medium (ads, email, social, etc.)
- `timestamp` - When the user landed

Data is saved to `localStorage` for post-signup attribution.

## Google Analytics Events

### Tracked Events

| Event Name | Category | Action | Label | Trigger |
|------------|----------|--------|-------|---------|
| **landing_visit** | Campaign | Landing Visit | {source}-{campaign} | Page load with UTM |
| **cta_click** | Landing | Click CTA | "Start Free" / "Login" | CTA button click |
| **scroll_depth** | Engagement | Scroll | "25%" / "50%" / "75%" / "100%" | Page scroll |
| **pricing_view** | Conversion | View Pricing | "Free" / "Pro" / "Enterprise" | Pricing card visible |
| **feature_hover** | Engagement | Hover Feature | Feature name | Feature card hover |

### Setup

1. Get Measurement ID from Google Analytics 4
2. Add to `.env`:
   ```
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
3. Events are tracked automatically

## Design System

Both landing pages use the project's design system:

- **Colors**: HSL semantic tokens from `index.css`
- **Animations**: Motion (Framer Motion) library
- **Components**: shadcn/ui components
- **Responsive**: Mobile-first design

### Key Design Elements

- **Gradients**: Primary → Purple → Orange
- **Animations**: Smooth transitions, floating orbs, hover effects
- **Typography**: Bold headlines, clear CTAs
- **Icons**: Lucide React icons
- **Cards**: Glassmorphism, shadows, hover states

## SEO Optimization

Both pages include:

- Meta tags (title, description, keywords)
- Open Graph tags (social sharing)
- Twitter Card tags
- Structured data (JSON-LD)
- Semantic HTML
- Mobile-responsive design
- Fast loading times

## Performance

- **Lazy Loading**: All page components are lazy loaded
- **Code Splitting**: Automatic via React.lazy()
- **Image Optimization**: WebP format, lazy loading
- **Animation Performance**: Hardware-accelerated with `will-change`
- **Lighthouse Score**: Target >90

## A/B Testing Recommendations

Test these elements on `/educational`:

1. **Hero Copy**: Short vs detailed descriptions
2. **CTA Colors**: Blue vs Orange vs Green
3. **Pricing Position**: Above vs below testimonials
4. **Prof Satoshi**: Emoji vs custom illustration
5. **Social Proof**: Numbers vs testimonials first

## Maintenance

### Adding a New Landing Page

1. Create page in `src/pages/NewLanding.tsx`
2. Create components in `src/components/new-landing/`
3. Add route in `src/App.tsx`:
   ```tsx
   const NewLanding = lazy(() => import("./pages/NewLanding"));
   <Route path="/new" element={<NewLanding />} />
   ```
4. Update this documentation

### Updating Content

- **Text Changes**: Edit component files directly
- **Images**: Add to `src/assets/educational-landing/`
- **Analytics**: Edit `src/pages/EducationalLanding.tsx`
- **Styles**: Use design system tokens from `index.css`

## Resources

- [Motion (Framer Motion) Docs](https://motion.dev/)
- [React GA4 Docs](https://github.com/codler/react-ga4)
- [Google Analytics 4 Setup](https://analytics.google.com/)
- [UTM Best Practices](https://ga-dev-tools.google/campaign-url-builder/)
