import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('💳 Insurance Payment Checker started');
    
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    const dueDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-03`;
    
    // Check if today is after the 3rd of the month
    if (today.getDate() >= 3) {
      const { data: unpaidUsers, error } = await supabase
        .from('insurance_payments')
        .select(`
          user_id,
          payment_month,
          payment_due_date,
          user_profiles!inner(
            email,
            notification_settings(telegram_chat_id)
          )
        `)
        .eq('payment_month', currentMonth)
        .eq('is_paid', false)
        .lte('payment_due_date', dueDate);
      
      if (error) throw error;
      
      if (unpaidUsers && unpaidUsers.length > 0) {
        console.log(`⚠️ ${unpaidUsers.length} users with unpaid insurance`);
        
        for (const user of unpaidUsers) {
          const telegramChatId = (user.user_profiles as any)?.notification_settings?.telegram_chat_id;
          
          if (!telegramChatId) continue;
          
          // Send reminder via Telegram
          await supabase
            .from('telegram_notifications_queue')
            .insert({
              user_id: user.user_id,
              message_type: 'payment_reminder',
              message_text: `⚠️ *Promemoria Canone Assicurativo*\n\n` +
                           `Il pagamento per ${new Date(user.payment_month).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })} non è stato ricevuto.\n\n` +
                           `Scadenza: ${new Date(user.payment_due_date).toLocaleDateString('it-IT')}\n\n` +
                           `Per continuare a ricevere i segnali AI e la copertura assicurativa, effettua il pagamento.\n\n` +
                           `Contatta il supporto per assistenza.`,
              telegram_chat_id: telegramChatId,
              priority: 3
            });
          
          console.log(`📧 Payment reminder sent to user ${user.user_id}`);
        }
        
        return new Response(
          JSON.stringify({ success: true, unpaid: unpaidUsers.length, reminded: unpaidUsers.length }), 
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
        );
      } else {
        console.log('✅ All users have paid');
        return new Response(
          JSON.stringify({ success: true, unpaid: 0 }), 
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
        );
      }
    } else {
      console.log('Not yet time to check (before 3rd of month)');
      return new Response(
        JSON.stringify({ message: 'Not time to check yet' }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      );
    }
    
  } catch (error) {
    console.error('❌ Insurance Payment Checker error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  }
});
