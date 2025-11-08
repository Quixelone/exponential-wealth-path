# Rate Limiting Strategy for Finanza Creativa

## Overview

This document outlines the rate limiting strategy for protecting Supabase Edge Functions and preventing abuse of external API integrations (OpenAI, CoinGecko).

## Why Rate Limiting?

1. **Cost Control**: Prevent excessive API calls to paid services (OpenAI)
2. **API Quota Management**: Stay within free tier limits of external APIs
3. **DDoS Protection**: Prevent malicious actors from overwhelming the system
4. **Fair Usage**: Ensure all users get equal access to resources

---

## Implementation Strategy

### 1. **Client-Side Rate Limiting (Frontend)**

**Location**: React Query configuration in `src/App.tsx`

Already implemented:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - reduces unnecessary refetches
      gcTime: 1000 * 60 * 30,   // 30 minutes cache
      retry: 1,                  // Only retry once on failure
      refetchOnWindowFocus: false, // Don't refetch on window focus
    },
  },
});
```

**Benefits**:
- Reduces redundant API calls
- Improves performance with caching
- Prevents excessive retries

---

### 2. **Database-Level Rate Limiting (Recommended)**

**Implementation**: Use Supabase Functions with PostgreSQL-based rate limiting

Create a rate limiting table:

```sql
-- Create rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own rate limits"
  ON rate_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage rate limits"
  ON rate_limits FOR ALL
  USING (true);

-- Index for performance
CREATE INDEX idx_rate_limits_user_endpoint
  ON rate_limits(user_id, endpoint, window_start);
```

**Helper Function (PL/pgSQL)**:

```sql
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_endpoint TEXT,
  p_max_requests INTEGER,
  p_window_minutes INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate window start time
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;

  -- Get or create rate limit record
  INSERT INTO rate_limits (user_id, endpoint, request_count, window_start)
  VALUES (p_user_id, p_endpoint, 1, NOW())
  ON CONFLICT (user_id, endpoint)
  DO UPDATE SET
    request_count = CASE
      WHEN rate_limits.window_start < v_window_start THEN 1
      ELSE rate_limits.request_count + 1
    END,
    window_start = CASE
      WHEN rate_limits.window_start < v_window_start THEN NOW()
      ELSE rate_limits.window_start
    END
  RETURNING request_count INTO v_count;

  -- Check if limit exceeded
  IF v_count > p_max_requests THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;
```

---

### 3. **Edge Function Rate Limiting**

Apply rate limiting to each Edge Function:

#### **Example: AI Trading Agent** (`supabase/functions/ai-trading-agent/index.ts`)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check rate limit: 10 requests per hour
    const { data: canProceed } = await supabase.rpc('check_rate_limit', {
      p_user_id: user.id,
      p_endpoint: 'ai-trading-agent',
      p_max_requests: 10,
      p_window_minutes: 60,
    });

    if (!canProceed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'You have exceeded the maximum number of AI signal requests. Please try again later.',
          retryAfter: 3600, // seconds
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '3600',
          },
        }
      );
    }

    // Proceed with normal function logic
    // ... your AI trading agent code ...

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

---

## Recommended Rate Limits by Endpoint

| Edge Function | Max Requests | Time Window | Reasoning |
|--------------|--------------|-------------|-----------|
| `ai-trading-agent` | 10 | 1 hour | OpenAI API costs |
| `fingenius-chat` | 50 | 1 hour | ChatGPT conversation limits |
| `fetch-btc-price` | 100 | 1 day | CoinGecko free tier: 50 calls/min |
| `assess-risk-profile` | 5 | 1 hour | Heavy AI computation |
| `send-notifications` | 20 | 1 hour | Email/SMS limits |
| `backup-strategies` | 10 | 1 day | Storage writes |
| `stripe-webhook` | No limit | - | Webhook must always work |

---

## Frontend Rate Limit Handling

**Location**: Create a custom hook `src/hooks/useRateLimitedQuery.ts`

```typescript
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

interface RateLimitError {
  error: string;
  message: string;
  retryAfter?: number;
}

export function useRateLimitedQuery<T>(
  options: UseQueryOptions<T>
) {
  return useQuery({
    ...options,
    retry: (failureCount, error: any) => {
      // Don't retry on rate limit errors
      if (error?.status === 429) {
        const data = error.data as RateLimitError;
        toast.error(data.message || 'Rate limit exceeded', {
          description: data.retryAfter
            ? `Riprova tra ${Math.ceil(data.retryAfter / 60)} minuti`
            : 'Riprova più tardi',
        });
        return false;
      }
      return failureCount < 1;
    },
  });
}
```

**Usage Example**:

```typescript
const { data, isLoading, error } = useRateLimitedQuery({
  queryKey: ['ai-signals'],
  queryFn: async () => {
    const response = await fetch('/api/ai-trading-agent', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const error = await response.json();
      throw { status: response.status, data: error };
    }
    return response.json();
  },
});
```

---

## Monitoring & Analytics

### Track Rate Limit Events

```sql
-- Create rate limit violations table
CREATE TABLE rate_limit_violations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  endpoint TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Query to find abuse patterns
SELECT
  user_id,
  endpoint,
  COUNT(*) as violation_count,
  MAX(created_at) as last_violation
FROM rate_limit_violations
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id, endpoint
HAVING COUNT(*) > 5
ORDER BY violation_count DESC;
```

---

## Implementation Checklist

- [x] Client-side caching (React Query)
- [ ] Database rate limit table and function
- [ ] Apply rate limiting to critical Edge Functions:
  - [ ] `ai-trading-agent`
  - [ ] `fingenius-chat`
  - [ ] `fetch-btc-price`
  - [ ] `assess-risk-profile`
  - [ ] `send-notifications`
  - [ ] `backup-strategies`
- [ ] Frontend rate limit error handling
- [ ] Rate limit violations tracking table
- [ ] Admin dashboard for monitoring violations
- [ ] User-facing rate limit status indicator

---

## Testing Rate Limits

```typescript
// Test script (run with Deno)
async function testRateLimit() {
  const endpoint = 'YOUR_EDGE_FUNCTION_URL';
  const token = 'YOUR_AUTH_TOKEN';

  for (let i = 0; i < 15; i++) {
    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`Request ${i + 1}: ${response.status}`);

    if (response.status === 429) {
      console.log('Rate limit triggered!');
      const data = await response.json();
      console.log('Response:', data);
      break;
    }

    // Wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testRateLimit();
```

---

## Future Enhancements

1. **IP-based rate limiting** for unauthenticated endpoints
2. **Tiered rate limits** based on subscription level (premium users get higher limits)
3. **Dynamic rate limits** based on system load
4. **Rate limit headers** in responses (`X-RateLimit-Limit`, `X-RateLimit-Remaining`)
5. **Redis integration** for distributed rate limiting across multiple instances

---

## Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [PostgreSQL Rate Limiting Patterns](https://www.2ndquadrant.com/en/blog/postgresql-rate-limiting/)
- [HTTP 429 Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429)
