
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Setting up cron job for payment reminders...');

    // Ottieni l'URL del progetto Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL or Anon Key not configured');
    }

    // Configura il cron job per eseguire ogni ora
    const { data, error } = await supabase.rpc('sql', {
      query: `
        SELECT cron.schedule(
          'payment-reminders-hourly-check',
          '0 * * * *', -- Ogni ora al minuto 0
          $$
          SELECT
            net.http_post(
              url:='${supabaseUrl}/functions/v1/send-notifications',
              headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${supabaseAnonKey}"}'::jsonb,
              body:='{"type": "check_reminders"}'::jsonb
            ) as request_id;
          $$
        );
      `
    });

    if (error) {
      console.error('Error setting up cron job:', error);
      throw error;
    }

    console.log('Cron job configured successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Cron job configured successfully. Payment reminders will be checked every hour.',
        schedule: '0 * * * * (every hour at minute 0)'
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('Error in setup-cron function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
