
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { sendNotificationsSchema } from '../_shared/validation.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentReminder {
  id: string;
  user_id: string;
  payment_day: number;
  frequency: string;
  amount: number | null;
  description: string | null;
  next_reminder_date: string;
  reminder_time: string;
  is_active: boolean;
}

interface NotificationSettings {
  user_id: string;
  whatsapp_number: string | null;
  telegram_chat_id: string | null;
  preferred_method: string | null;
  notifications_enabled: boolean;
}

interface UserProfile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting notification check...');

    // Ottieni la data e ora correnti
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

    console.log(`Checking reminders for date: ${currentDate}, time: ${currentTime}`);

    // Trova tutti i promemoria scaduti e attivi
    const { data: dueReminders, error: remindersError } = await supabase
      .from('payment_reminders')
      .select('*')
      .eq('is_active', true)
      .lte('next_reminder_date', currentDate);

    if (remindersError) {
      console.error('Error fetching reminders:', remindersError);
      throw new Error(`Database error: ${remindersError.message}`);
    }

    console.log(`Found ${dueReminders?.length || 0} due reminders`);

    if (!dueReminders || dueReminders.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No due reminders found',
          processed: 0 
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    let processed = 0;
    let errors = 0;

    // Processa ogni promemoria scaduto
    for (const reminder of dueReminders) {
      try {
        console.log(`Processing reminder ${reminder.id} for user ${reminder.user_id}`);

        // Controlla se è già stata inviata una notifica oggi per questo promemoria
        const { data: existingLog } = await supabase
          .from('notification_logs')
          .select('id')
          .eq('reminder_id', reminder.id)
          .gte('created_at', `${currentDate}T00:00:00.000Z`)
          .eq('status', 'sent')
          .single();

        if (existingLog) {
          console.log(`Notification already sent today for reminder ${reminder.id}`);
          continue;
        }

        // Ottieni le impostazioni di notifica dell'utente
        const { data: settings, error: settingsError } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('user_id', reminder.user_id)
          .single();

        if (settingsError || !settings || !settings.notifications_enabled) {
          console.log(`Notifications disabled for user ${reminder.user_id}`);
          continue;
        }

        // Ottieni il profilo utente per l'email
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, email, first_name, last_name')
          .eq('id', reminder.user_id)
          .single();

        if (profileError || !userProfile) {
          console.error(`Error fetching user profile for ${reminder.user_id}:`, profileError);
          continue;
        }

        // Invia la notifica tramite il metodo preferito
        const success = await sendNotification(reminder, settings, userProfile);

        if (success) {
          // Aggiorna la data del prossimo promemoria
          await updateNextReminderDate(reminder);
          processed++;
        } else {
          errors++;
        }

      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error);
        errors++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${processed} reminders, ${errors} errors`,
        processed,
        errors
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('Error in send-notifications function:', error);
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

async function sendNotification(
  reminder: PaymentReminder, 
  settings: NotificationSettings, 
  userProfile: UserProfile
): Promise<boolean> {
  const userName = userProfile.first_name && userProfile.last_name 
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : userProfile.email || 'Utente';

  const message = createNotificationMessage(reminder, userName);

  // Determina il metodo di notifica da utilizzare
  let method = settings.preferred_method || 'email';
  
  // Verifica che il metodo preferito sia disponibile
  if (method === 'whatsapp' && !settings.whatsapp_number) method = 'email';
  if (method === 'telegram' && !settings.telegram_chat_id) method = 'email';
  if (method === 'email' && !userProfile.email) {
    // Se neanche l'email è disponibile, prova altri metodi
    if (settings.whatsapp_number) method = 'whatsapp';
    else if (settings.telegram_chat_id) method = 'telegram';
    else {
      console.error(`No valid notification method for user ${reminder.user_id}`);
      return false;
    }
  }

  try {
    let success = false;

    switch (method) {
      case 'whatsapp':
        success = await sendWhatsAppNotification(settings.whatsapp_number!, message);
        break;
      case 'telegram':
        success = await sendTelegramNotification(settings.telegram_chat_id!, message);
        break;
      case 'email':
      default:
        success = await sendEmailNotification(userProfile.email!, userName, message);
        break;
    }

    // Registra il log della notifica
    await logNotification(reminder.id, reminder.user_id, method, success ? 'sent' : 'failed', message);

    return success;

  } catch (error) {
    console.error(`Error sending ${method} notification:`, error);
    await logNotification(reminder.id, reminder.user_id, method, 'failed', message, error.message);
    return false;
  }
}

function createNotificationMessage(reminder: PaymentReminder, userName: string): string {
  const frequencyText = getFrequencyText(reminder.frequency);
  const amountText = reminder.amount ? ` di €${reminder.amount.toFixed(2)}` : '';
  const descriptionText = reminder.description ? ` (${reminder.description})` : '';
  
  return `Ciao ${userName}! 🔔\n\n` +
         `Ti ricordiamo che oggi è il giorno del tuo pagamento ${frequencyText}${amountText}${descriptionText}.\n\n` +
         `Non dimenticare di effettuare il versamento!\n\n` +
         `Buona giornata! 💰`;
}

function getFrequencyText(frequency: string): string {
  switch (frequency) {
    case 'daily': return 'giornaliero';
    case 'weekly': return 'settimanale';
    case 'monthly': return 'mensile';
    case 'quarterly': return 'trimestrale';
    case 'yearly': return 'annuale';
    default: return frequency;
  }
}

async function sendWhatsAppNotification(phoneNumber: string, message: string): Promise<boolean> {
  try {
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');

    if (!accountSid || !authToken) {
      console.error('Twilio credentials not configured');
      return false;
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: 'whatsapp:+14155238886', // Twilio Sandbox number
          To: `whatsapp:${phoneNumber}`,
          Body: message,
        }),
      }
    );

    if (response.ok) {
      console.log(`WhatsApp message sent successfully to ${phoneNumber}`);
      return true;
    } else {
      const error = await response.text();
      console.error(`WhatsApp send failed:`, error);
      return false;
    }
  } catch (error) {
    console.error('WhatsApp notification error:', error);
    return false;
  }
}

async function sendTelegramNotification(chatId: string, message: string): Promise<boolean> {
  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

    if (!botToken) {
      console.error('Telegram bot token not configured');
      return false;
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    if (response.ok) {
      console.log(`Telegram message sent successfully to ${chatId}`);
      return true;
    } else {
      const error = await response.text();
      console.error(`Telegram send failed:`, error);
      return false;
    }
  } catch (error) {
    console.error('Telegram notification error:', error);
    return false;
  }
}

async function sendEmailNotification(email: string, userName: string, message: string): Promise<boolean> {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      console.error('Resend API key not configured');
      return false;
    }

    // Use fetch API directly to avoid npm import issues
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Finanza Creativa <notifiche@resend.dev>',
        to: [email],
        subject: '🔔 Promemoria Pagamento - Finanza Creativa',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb; text-align: center;">💰 Promemoria Pagamento</h2>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="white-space: pre-line; font-size: 16px; line-height: 1.6; color: #334155;">
                ${message.replace(/\n/g, '<br>')}
              </p>
            </div>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px;">
                Questa è una notifica automatica di Finanza Creativa.<br>
                Se non vuoi più ricevere questi promemoria, puoi disattivarli nelle impostazioni.
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Email send failed:', error);
      return false;
    }

    console.log(`Email sent successfully to ${email}`);
    return true;

  } catch (error) {
    console.error('Email notification error:', error);
    return false;
  }
}

async function logNotification(
  reminderId: string, 
  userId: string, 
  method: string, 
  status: string, 
  message: string, 
  errorMessage?: string
): Promise<void> {
  try {
    await supabase
      .from('notification_logs')
      .insert({
        reminder_id: reminderId,
        user_id: userId,
        notification_method: method,
        status,
        message,
        error_message: errorMessage || null,
        sent_at: status === 'sent' ? new Date().toISOString() : null,
      });
  } catch (error) {
    console.error('Error logging notification:', error);
  }
}

async function updateNextReminderDate(reminder: PaymentReminder): Promise<void> {
  try {
    const currentDate = new Date(reminder.next_reminder_date);
    let nextDate = new Date(currentDate);

    switch (reminder.frequency) {
      case 'daily':
        nextDate.setDate(currentDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(currentDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(currentDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(currentDate.getFullYear() + 1);
        break;
    }

    await supabase
      .from('payment_reminders')
      .update({
        next_reminder_date: nextDate.toISOString().split('T')[0]
      })
      .eq('id', reminder.id);

    console.log(`Updated next reminder date for ${reminder.id} to ${nextDate.toISOString().split('T')[0]}`);

  } catch (error) {
    console.error('Error updating next reminder date:', error);
  }
}

serve(handler);
