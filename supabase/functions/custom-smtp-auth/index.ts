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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { email, password, type, redirectTo }: SMTPAuthRequest = await req.json();

    console.log(`🔐 Processing ${type} request for email: ${email}`);

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