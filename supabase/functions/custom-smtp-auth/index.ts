import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SMTPAuthRequest {
  email: string;
  password?: string;
  type: 'signup' | 'recovery' | 'email_change' | 'magic_link';
  redirectTo?: string;
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per hour per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  record.count++;
  return true;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

function validatePassword(password: string): boolean {
  return password.length >= 8 && password.length <= 100;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract IP address for rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      console.warn(`🚫 Rate limit exceeded for IP: ${ip}`);
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please try again later.',
          retryAfter: 3600 
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { email, password, type, redirectTo }: SMTPAuthRequest = await req.json();

    // Input validation
    if (!email || !validateEmail(email)) {
      console.error('❌ Invalid email format');
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (type === 'signup' && password && !validatePassword(password)) {
      console.error('❌ Invalid password format');
      return new Response(
        JSON.stringify({ error: 'Password must be between 8 and 100 characters' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`🔐 Processing ${type} request for email: ${email} from IP: ${ip}`);

    let result;
    
    switch (type) {
      case 'signup':
        if (!password) {
          throw new Error('Password required for signup');
        }
        result = await supabaseClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // Skip email confirmation
          user_metadata: {}
        });
        break;
        
      case 'recovery':
        result = await supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: redirectTo || `${new URL(req.url).origin}/auth`
        });
        break;
        
      case 'magic_link':
        result = await supabaseClient.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectTo || `${new URL(req.url).origin}/`
          }
        });
        break;
        
      default:
        throw new Error(`Unsupported auth type: ${type}`);
    }

    if (result.error) {
      console.error(`❌ Auth error for ${type}:`, result.error);
      return new Response(
        JSON.stringify({ 
          error: result.error.message,
          details: result.error
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`✅ ${type} successful for email: ${email}`);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: `${type} completed successfully`,
        user: result.data.user || null
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error(`💥 Error in custom-smtp-auth:`, error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);