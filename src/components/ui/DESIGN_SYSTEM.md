# Design System Documentation

Comprehensive guide to the unified design system with design tokens, component variants, and best practices.

---

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Component Variants](#component-variants)
3. [Color System](#color-system)
4. [Best Practices](#best-practices)
5. [Usage Examples](#usage-examples)

---

## Design Tokens

Our design system uses CSS custom properties for consistency across all components.

### Spacing System

Consistent spacing scale for padding, margin, and gaps:

```css
--spacing-xs: 0.5rem;    /* 8px */
--spacing-sm: 0.75rem;   /* 12px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
--spacing-3xl: 4rem;     /* 64px */
```

**Usage in Tailwind:**
```tsx
<div className="p-[var(--spacing-md)] gap-[var(--spacing-lg)]">
  // Uses 16px padding and 24px gap
</div>
```

**Usage in Tailwind with tokens:**
```tsx
<div className="p-md gap-lg">
  // Same as above, more concise
</div>
```

### Sizing System

Standard sizes for buttons, inputs, and interactive elements:

```css
--size-xs: 1.5rem;       /* 24px */
--size-sm: 2rem;         /* 32px */
--size-md: 2.5rem;       /* 40px */
--size-lg: 3rem;         /* 48px */
--size-xl: 4rem;         /* 64px */
```

**Usage:**
```tsx
<Button className="h-[var(--size-lg)]">Large Button</Button>
```

### Radius System

Consistent border radius for all components:

```css
--radius-xs: 0.25rem;    /* 4px */
--radius-sm: 0.375rem;   /* 6px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-2xl: 1.5rem;    /* 24px */
--radius-full: 9999px;   /* Full rounded */
```

**Usage:**
```tsx
<Card className="rounded-[var(--radius-xl)]">Premium Card</Card>
```

---

## Component Variants

All components support consistent variants for visual hierarchy and states.

### Standard Variants

Available across Button, Card, Badge, Alert, Dialog, Input, Textarea, Select:

#### `default`
Standard appearance with primary accent color.
```tsx
<Button variant="default">Default Button</Button>
<Card variant="default">Default Card</Card>
```

#### `soft`
Subtle background with light primary color.
```tsx
<Button variant="soft">Soft Button</Button>
<Input variant="soft" placeholder="Soft input..." />
```

#### `soft-success`, `soft-warning`, `soft-danger`
Colored soft variants for status indication.
```tsx
<Badge variant="soft-success">Success</Badge>
<Alert variant="soft-warning">Warning message</Alert>
```

#### `glass`
Glassmorphism effect with backdrop blur.
```tsx
<Card variant="glass">Glass Card</Card>
<Button variant="glass">Glass Button</Button>
```

#### `premium`
Gradient background with glow effect for premium features.
```tsx
<Button variant="premium">Premium Action</Button>
<Dialog variant="premium">Premium Dialog</Dialog>
```

### Component-Specific Variants

#### Button Variants
- `default` - Primary solid button
- `destructive` - Danger/delete actions
- `outline` - Transparent with border
- `secondary` - Secondary solid button
- `ghost` - Transparent on hover only
- `link` - Text link style
- `success`, `warning`, `info` - Status colors
- `gradient` - Primary to secondary gradient
- `soft`, `soft-*` - Subtle backgrounds
- `glass` - Glassmorphism
- `premium` - Premium gradient with glow

#### Card Variants
- `default` - Standard card with border
- `outlined` - Thicker border, hover effect
- `elevated` - Shadow elevation
- `glass` - Glass effect
- `gradient` - Subtle gradient background
- `interactive` - Hover scale animation
- `premium` - Premium gradient with glow
- `hero` - Large premium card for hero sections
- `soft`, `soft-*` - Status colored backgrounds

#### Badge Variants
- `default` - Primary solid badge
- `secondary` - Secondary solid badge
- `destructive` - Danger badge
- `outline` - Transparent with border
- `success`, `warning`, `danger`, `info` - Status badges
- `gradient` - Gradient badge
- `soft`, `soft-*` - Subtle status badges
- `glass` - Glass effect badge
- `premium` - Premium gradient badge

---

## Color System

### Semantic Color Tokens

All colors use HSL format for consistency:

```css
/* Light Mode */
--primary: 220 90% 56%;     /* Bitcoin Blue */
--secondary: 28 100% 55%;   /* Bitcoin Orange */
--success: 134 61% 41%;     /* Green */
--warning: 45 93% 58%;      /* Orange */
--danger: 0 72% 51%;        /* Red */
--info: 195 85% 55%;        /* Cyan */

/* Always use with hsl() */
color: hsl(var(--primary));
background: hsl(var(--success) / 0.1); /* 10% opacity */
```

### Gradient Utilities

Pre-defined gradients for consistent visual effects:

```css
.gradient-primary    /* Primary to secondary */
.gradient-success    /* Success gradient */
.gradient-warning    /* Warning gradient */
.gradient-danger     /* Danger gradient */
.gradient-info       /* Info gradient */
```

---

## Best Practices

### 1. Always Use Design Tokens

❌ **DON'T:**
```tsx
<div className="p-4 rounded-lg gap-6">
```

✅ **DO:**
```tsx
<div className="p-[var(--spacing-md)] rounded-[var(--radius-lg)] gap-[var(--spacing-lg)]">
```

### 2. Use Semantic Colors

❌ **DON'T:**
```tsx
<div className="bg-blue-500 text-white">
```

✅ **DO:**
```tsx
<div className="bg-primary text-primary-foreground">
```

### 3. Consistent Component Variants

❌ **DON'T:**
```tsx
<Button className="bg-green-100 text-green-600">
<Badge className="bg-green-100 text-green-600">
```

✅ **DO:**
```tsx
<Button variant="soft-success">Save</Button>
<Badge variant="soft-success">Active</Badge>
```

### 4. Leverage Component Composition

❌ **DON'T:**
```tsx
<div className="rounded-lg bg-card border p-6">
  <h3 className="text-xl font-semibold">Title</h3>
  <p className="text-muted-foreground">Description</p>
</div>
```

✅ **DO:**
```tsx
<Card variant="elevated">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
</Card>
```

### 5. Use Appropriate Variants

**Status Indication:**
```tsx
<StatusIndicator variant="success" animate="pulse">
  Online
</StatusIndicator>
```

**Progress Tracking:**
```tsx
<ProgressBar 
  value={75} 
  variant="gradient-success" 
  showLabel 
  label="Completion"
/>
```

**Information Display:**
```tsx
<InfoCard 
  variant="soft-success"
  icon={CheckCircle}
  title="Success"
  description="Operation completed successfully"
/>
```

---

## Usage Examples

### Form Components

```tsx
import { Input, Textarea, Select } from "@/components/ui"

// Standard form
<Input variant="default" placeholder="Enter email..." />

// Soft variant for subtle emphasis
<Input variant="soft" placeholder="Search..." />

// Glass effect for overlay forms
<Textarea variant="glass" placeholder="Your message..." />

// Premium input for special features
<Select variant="premium">
  <SelectTrigger>
    <SelectValue placeholder="Choose plan" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="pro">Pro Plan</SelectItem>
  </SelectContent>
</Select>
```

### Cards and Layouts

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

// Standard card
<Card variant="default">
  <CardHeader>
    <CardTitle>Standard Card</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>

// Interactive card with hover effect
<Card variant="interactive" onClick={handleClick}>
  <CardContent>Click me</CardContent>
</Card>

// Premium hero card
<Card variant="hero" className="p-[var(--spacing-2xl)]">
  <CardHeader>
    <CardTitle className="text-3xl">Welcome</CardTitle>
  </CardHeader>
</Card>
```

### Buttons and Actions

```tsx
import { Button } from "@/components/ui/button"

// Primary action
<Button variant="default">Save Changes</Button>

// Soft variant for secondary actions
<Button variant="soft">Learn More</Button>

// Glass button for overlays
<Button variant="glass">Continue</Button>

// Premium button for paid features
<Button variant="premium">Upgrade to Pro</Button>

// Status buttons
<Button variant="soft-success">Approve</Button>
<Button variant="soft-danger">Reject</Button>
```

### Status Indicators

```tsx
import { StatusIndicator } from "@/components/ui/status-indicator"

// Static status
<StatusIndicator variant="success">Active</StatusIndicator>

// Animated status
<StatusIndicator variant="warning" animate="pulse">
  Pending
</StatusIndicator>

// Real-time status with ping
<StatusIndicator variant="primary" animate="ping">
  Live
</StatusIndicator>
```

### Progress Bars

```tsx
import { ProgressBar } from "@/components/ui/progress-bar"

// Simple progress
<ProgressBar value={60} variant="default" />

// Gradient progress with label
<ProgressBar 
  value={75} 
  variant="gradient-success"
  showLabel
  label="Profile Completion"
  animated
/>

// Status progress bars
<ProgressBar value={25} variant="warning" showLabel />
<ProgressBar value={100} variant="success" showLabel />
```

### Info Cards

```tsx
import { InfoCard } from "@/components/ui/info-card"
import { AlertCircle, CheckCircle } from "lucide-react"

// Basic info card
<InfoCard
  icon={AlertCircle}
  title="Important Notice"
  description="Please review the terms before continuing."
/>

// Success card with custom content
<InfoCard
  variant="soft-success"
  icon={CheckCircle}
  title="Success"
  description="Your changes have been saved."
>
  <Button variant="soft-success" size="sm">View Details</Button>
</InfoCard>

// Premium feature card
<InfoCard
  variant="premium"
  icon={Crown}
  title="Premium Feature"
  description="Unlock advanced analytics and insights."
  iconPosition="top"
/>
```

### Alerts and Notifications

```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

// Soft warning alert
<Alert variant="soft-warning">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>
    This action cannot be undone.
  </AlertDescription>
</Alert>

// Glass alert for overlays
<Alert variant="glass">
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>
    Updates are available.
  </AlertDescription>
</Alert>
```

### Dialogs and Modals

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Standard dialog
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent variant="default">
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <p>Dialog content here</p>
  </DialogContent>
</Dialog>

// Premium feature dialog
<DialogContent variant="premium">
  <DialogHeader>
    <DialogTitle>Premium Feature</DialogTitle>
  </DialogHeader>
  <p>Upgrade to unlock this feature</p>
</DialogContent>
```

---

## Component Sizing

All form components support consistent sizing:

```tsx
// Small
<Input inputSize="sm" />
<Button size="sm">Small</Button>

// Default (medium)
<Input inputSize="default" />
<Button size="default">Default</Button>

// Large
<Input inputSize="lg" />
<Button size="lg">Large</Button>

// Extra Large (Button only)
<Button size="xl">Extra Large</Button>
```

---

## Responsive Design

All components are mobile-first and responsive:

```tsx
// Responsive card grid
<div className="grid-mobile-3">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</div>

// Responsive spacing
<div className="space-mobile-md">
  {/* Adjusts spacing based on screen size */}
</div>

// Responsive text
<h1 className="text-fluid-3xl">Responsive Title</h1>
```

---

## Accessibility

All components follow accessibility best practices:

- Proper ARIA attributes
- Keyboard navigation support
- Focus visible states
- Screen reader support
- Touch target sizes (44px minimum)

```tsx
// Accessible button
<Button aria-label="Save changes">
  <Save className="h-4 w-4" />
</Button>

// Accessible form
<label htmlFor="email" className="sr-only">Email</label>
<Input id="email" type="email" placeholder="Enter email" />
```

---

## Migration Guide

### From Custom Styles to Design Tokens

**Before:**
```tsx
<div className="p-6 rounded-xl gap-6 bg-blue-50 border-blue-200">
  Content
</div>
```

**After:**
```tsx
<Card variant="soft" className="gap-[var(--spacing-lg)]">
  <CardContent>Content</CardContent>
</Card>
```

### From Inline Styles to Variants

**Before:**
```tsx
<button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
  Premium
</button>
```

**After:**
```tsx
<Button variant="premium">Premium</Button>
```

---

## Resources

- **Design Tokens Reference**: `src/index.css` (lines 88-115)
- **Tailwind Config**: `tailwind.config.ts` (extends section)
- **Component Source**: `src/components/ui/`

---

## Support

For questions or suggestions about the design system:
- Review existing component implementations
- Check this documentation
- Follow best practices outlined above
