# Comprehensive Testing Guide - Finanza Creativa

## Table of Contents
1. [Overview](#overview)
2. [Testing Stack](#testing-stack)
3. [Running Tests](#running-tests)
4. [Unit Testing](#unit-testing)
5. [Integration Testing](#integration-testing)
6. [E2E Testing](#e2e-testing)
7. [Testing Best Practices](#testing-best-practices)
8. [Coverage Requirements](#coverage-requirements)
9. [CI/CD Integration](#cicd-integration)

---

## Overview

This guide covers all testing practices for the Finanza Creativa application. Testing is **critical** for a financial application to ensure accuracy, security, and reliability.

### Test Pyramid

```
        /\
       /  \  E2E Tests (5-10%)
      /----\
     / Inte \  Integration Tests (20-30%)
    /  grat \
   /   ion   \
  /___________\
 /   Unit      \ Unit Tests (60-70%)
/_______________\
```

---

## Testing Stack

### Current Setup ✅

- **Test Runner**: Vitest (fast, Vite-compatible)
- **React Testing**: @testing-library/react
- **DOM Testing**: @testing-library/jest-dom
- **User Simulation**: @testing-library/user-event
- **Environment**: jsdom

### Configuration Files

- `vitest.config.ts` - Vitest configuration
- `src/test/setup.ts` - Global test setup
- `package.json` - Test scripts

---

## Running Tests

### Available Commands

```bash
# Run tests in watch mode (development)
npm test

# Run tests once (CI/CD)
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Watch Mode

Best for development - tests rerun on file changes:

```bash
npm test
```

### Coverage Report

```bash
npm run test:coverage

# Opens HTML report at: coverage/index.html
```

---

## Unit Testing

### What to Test

1. **Utility Functions** (`src/lib/`, `src/utils/`)
2. **Calculation Logic** (investment calculations, PAC formulas)
3. **Custom Hooks** (data fetching, state management)
4. **Pure Components** (presentational components)
5. **Validation Logic** (Zod schemas)

### Example: Testing Utility Functions

**File**: `src/lib/utils.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn (classNames utility)', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toContain('text-red-500');
    expect(result).toContain('bg-blue-500');
  });

  it('should handle Tailwind conflicts', () => {
    const result = cn('p-4', 'p-8');
    expect(result).toBe('p-8'); // Last one wins
  });
});
```

### Example: Testing Investment Calculations

**File**: `src/hooks/useInvestmentData.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInvestmentData } from './useInvestmentData';

describe('useInvestmentData', () => {
  it('should calculate correct investment returns', () => {
    const { result } = renderHook(() =>
      useInvestmentData({
        initialCapital: 10000,
        dailyReturnPercentage: 0.1,
        investmentDays: 365,
      })
    );

    expect(result.current.finalValue).toBeCloseTo(13778.37, 2);
  });

  it('should handle zero return correctly', () => {
    const { result } = renderHook(() =>
      useInvestmentData({
        initialCapital: 10000,
        dailyReturnPercentage: 0,
        investmentDays: 365,
      })
    );

    expect(result.current.finalValue).toBe(10000);
  });
});
```

### Example: Testing React Components

**File**: `src/components/ui/button.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });

  it('applies variant styles', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    expect(container.firstChild).toHaveClass('bg-destructive');
  });
});
```

---

## Integration Testing

### What to Test

1. **Multi-component interactions**
2. **Form submissions**
3. **Data fetching with React Query**
4. **Context providers**
5. **Routing**

### Example: Testing Form Submission

**File**: `src/components/configuration/ConfigurationPanel.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigurationPanel } from './ConfigurationPanel';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('ConfigurationPanel', () => {
  it('submits configuration correctly', async () => {
    const onSubmit = vi.fn();
    render(<ConfigurationPanel onSubmit={onSubmit} />, {
      wrapper: createWrapper(),
    });

    // Fill form
    await userEvent.type(screen.getByLabelText(/capitale iniziale/i), '10000');
    await userEvent.type(screen.getByLabelText(/durata/i), '365');
    await userEvent.type(screen.getByLabelText(/rendimento/i), '0.1');

    // Submit
    await userEvent.click(screen.getByRole('button', { name: /salva/i }));

    // Verify
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        initialCapital: 10000,
        investmentDays: 365,
        dailyReturnPercentage: 0.1,
      });
    });
  });
});
```

### Example: Testing with Auth Context

**File**: `src/components/dashboard/StatisticsCards.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { StatisticsCards } from './StatisticsCards';

const mockUser = {
  id: '123',
  email: 'test@example.com',
  role: 'user',
};

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider value={{ user: mockUser, loading: false }}>
    {children}
  </AuthProvider>
);

describe('StatisticsCards', () => {
  it('displays user statistics', async () => {
    render(
      <MockAuthProvider>
        <StatisticsCards />
      </MockAuthProvider>
    );

    expect(await screen.findByText(/capitale totale/i)).toBeInTheDocument();
  });
});
```

---

## E2E Testing

### Recommended Tools

- **Playwright** (recommended) or **Cypress**

### Installation

```bash
npm install -D @playwright/test
npx playwright install
```

### Configuration

**File**: `playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Example E2E Test

**File**: `e2e/investment-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Investment Configuration Flow', () => {
  test('user can create and save investment strategy', async ({ page }) => {
    // Navigate to app
    await page.goto('/app');

    // Login
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword');
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Create new strategy
    await page.click('text=Nuova Strategia');
    await page.fill('input[name="initialCapital"]', '10000');
    await page.fill('input[name="investmentDays"]', '365');
    await page.fill('input[name="dailyReturnPercentage"]', '0.1');

    // Save
    await page.click('button:has-text("Salva")');

    // Verify success
    await expect(page.locator('.toast')).toContainText('Configurazione salvata');
  });
});
```

---

## Testing Best Practices

### 1. **AAA Pattern** (Arrange, Act, Assert)

```typescript
it('calculates compound interest', () => {
  // Arrange
  const principal = 10000;
  const rate = 0.1;
  const time = 365;

  // Act
  const result = calculateCompoundInterest(principal, rate, time);

  // Assert
  expect(result).toBeCloseTo(13778.37, 2);
});
```

### 2. **Test One Thing at a Time**

```typescript
// ❌ Bad: Testing multiple things
it('handles everything', () => {
  expect(add(1, 2)).toBe(3);
  expect(subtract(5, 2)).toBe(3);
  expect(multiply(2, 3)).toBe(6);
});

// ✅ Good: Separate tests
it('adds two numbers', () => {
  expect(add(1, 2)).toBe(3);
});

it('subtracts two numbers', () => {
  expect(subtract(5, 2)).toBe(3);
});
```

### 3. **Use Descriptive Test Names**

```typescript
// ❌ Bad
it('works', () => { ... });

// ✅ Good
it('calculates final portfolio value with compound returns', () => { ... });
```

### 4. **Mock External Dependencies**

```typescript
import { vi } from 'vitest';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));
```

### 5. **Test Error Cases**

```typescript
it('throws error for negative principal', () => {
  expect(() => calculateCompoundInterest(-1000, 0.1, 365)).toThrow();
});
```

---

## Coverage Requirements

### Minimum Coverage Targets

| Type | Target | Critical Path Target |
|------|--------|---------------------|
| Statements | 80% | 100% |
| Branches | 75% | 100% |
| Functions | 80% | 100% |
| Lines | 80% | 100% |

### Critical Paths (Require 100% Coverage)

1. **Investment calculations** (`useInvestmentData.ts`)
2. **PAC payment logic** (`usePACPayments.ts`)
3. **Trade execution** (`useActualTrades.ts`)
4. **Authentication** (`AuthContext.tsx`)
5. **Validation schemas** (`validation.ts`)

### Viewing Coverage

```bash
npm run test:coverage

# Opens: coverage/index.html
```

---

## CI/CD Integration

### GitHub Actions Workflow

**File**: `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm run test:run

      - name: Generate coverage
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: true
```

---

## Testing Checklist

### Before Committing

- [ ] All tests pass locally (`npm run test:run`)
- [ ] Coverage meets minimum thresholds
- [ ] No console errors or warnings
- [ ] Linter passes (`npm run lint`)

### Before Deploying

- [ ] All CI/CD tests pass
- [ ] E2E tests pass
- [ ] Manual smoke testing completed
- [ ] Performance regression testing done

---

## Common Testing Scenarios

### Testing Async Operations

```typescript
it('fetches BTC price', async () => {
  const { result } = renderHook(() => useBTCPrice());

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.price).toBeGreaterThan(0);
});
```

### Testing Timers

```typescript
import { vi } from 'vitest';

it('calls callback after delay', async () => {
  vi.useFakeTimers();
  const callback = vi.fn();

  setTimeout(callback, 1000);

  vi.advanceTimersByTime(1000);

  expect(callback).toHaveBeenCalled();

  vi.useRealTimers();
});
```

### Testing Error Boundaries

Already implemented in `src/components/ErrorBoundary.test.tsx`!

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Next Steps

1. **Add more unit tests** for critical business logic
2. **Implement E2E tests** with Playwright
3. **Set up CI/CD pipeline** with GitHub Actions
4. **Configure Codecov** for coverage tracking
5. **Add visual regression testing** with Percy or Chromatic
