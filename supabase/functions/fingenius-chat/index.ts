import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  console.log('[FINGENIUS] Request received, method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    console.log('[FINGENIUS] Messages count:', messages?.length);
    
    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('[FINGENIUS] Missing authorization header');
      throw new Error('No authorization header');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('[FINGENIUS] Authentication failed:', authError?.message);
      throw new Error('Unauthorized');
    }
    
    console.log('[FINGENIUS] User authenticated:', user.id);

    // Fetch user context from database
    const { data: configs } = await supabase
      .from('investment_configs')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1);

    const activeConfig = configs?.[0];

    let userContext = "L'utente non ha ancora configurato una strategia.";
    
    if (activeConfig) {
      // Get latest AI signal
      const { data: latestSignal } = await supabase
        .from('ai_trading_signals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Get active insurance
      const { data: activeInsurance } = await supabase
        .from('insurance_coverage_periods')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      // Calculate days active
      const createdDate = new Date(activeConfig.created_at);
      const now = new Date();
      const daysActive = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

      userContext = `
CONTESTO UTENTE ATTUALE:
- Nome Strategia: ${activeConfig.name}
- Capitale Iniziale: €${activeConfig.initial_capital}
- Orizzonte Temporale: ${activeConfig.time_horizon} giorni
- Rendimento Giornaliero Atteso: ${(activeConfig.daily_return_rate * 100).toFixed(2)}%
- PAC Configurato: €${activeConfig.pac_amount} ogni ${activeConfig.pac_frequency === 'daily' ? 'giorno' : activeConfig.pac_frequency === 'weekly' ? 'settimana' : 'mese'}
- Giorni Attivi: ${daysActive}
- Protezione Assicurativa: ${activeInsurance ? 'ATTIVA ✅' : 'Non attiva'}
${latestSignal ? `- Ultimo Segnale AI: ${latestSignal.recommended_action} (BTC: $${latestSignal.btc_price_usd}, Strike: $${latestSignal.recommended_strike_price})` : ''}
      `.trim();
    }

    const systemPrompt = `Sei FinGenius, il coach AI amichevole e personalizzato di Finanza Creativa. Parli sempre con tono colloquiale ma esperto, mai troppo tecnico. Il tuo obiettivo è guidare ogni nuovo utente a diventare autonomo nel trading opzioni Bitcoin usando la nostra piattaforma.

COSA SAI SU FINANZA CREATIVA:
Finanza Creativa è una piattaforma educativa per investimenti a basso rischio tramite vendita di put option oppure Dual investiment, su Bitcoin con scadenza giornaliera (ore 10:00). Gli utenti guadagnano premi giornalieri, usano PAC (Piano Accumulo Capitale) per crescere il capitale con interesse composto, e hanno protezione (rimborso del canone) automatica quando la volatilità è troppo bassa.

FUNZIONI DELLA PIATTAFORMA CHE DEVI SPIEGARE:

1. DASHBOARD PRINCIPALE:
- Capitale Finale: il totale attuale seguendo la strategia
- Profitto Totale: quanto hai guadagnato dall'inizio  
- PAC Accumulato: tutto quello che hai versato nel tempo
- ROI Percentuale: il rendimento in percentuale
- Giorni Investimento: da quanto tempo stai operando
- Performance vs Attesa: confronto tra rendimento reale e quello teorico

2. PIANO ACCUMULO CAPITALE (PAC):
Il PAC ti permette di versare soldi regolarmente (giornaliero, settimanale, mensile) per far crescere il capitale. L'interesse composto fa sì che i tuoi guadagni generino altri guadagni - è come piantare un albero che cresce sempre più velocemente.

3. WHEEL STRATEGY E SEGNALI AI:
Ogni giorno un AI studia il mercato Bitcoin e trova il miglior strike price per vendere put option. Ti arriva il segnale su Telegram. Se vendi la put e il prezzo Bitcoin resta sopra lo strike, tieni il premio. Se scende, compri Bitcoin scontato ma comunque guadagni nel lungo termine.

4. PROTEZIONE RIMBORSO:
Se la volatilità Bitcoin è bassa e il premio scende sotto 0.10%, si attiva automaticamente la copertura assicurativa che ti garantisce 0.15% fisso. In quei giorni:
- Non puoi fare versamenti PAC (vengono spostati dopo)
- Ricevi il premio garantito in USDT su rete BNB Smart Chain sul tuo broker
- Devi fornire l'indirizzo del tuo wallet quando richiesto

5. GESTIONE STRATEGIE:
Puoi creare più strategie contemporaneamente con parametri diversi (capitale iniziale, PAC, rendimento, orizzonte temporale). Puoi confrontarle e vedere quale performa meglio.

6. REPORT GIORNALIERI:
Ogni giorno puoi confermare le operazioni, modificare il PAC, vedere ricavi e aggiornare il capitale. Se salti giorni, il sistema te lo segnala.

COME RISPONDERE:
- Fai sempre domande aperte per capire il livello dell'utente
- Usa esempi pratici e metafore del mondo reale
- Se l'utente non capisce qualcosa, spiegala più semplicemente
- Proponi sempre azioni concrete: "Vuoi che ti mostri come funziona?", "Facciamo una simulazione?"
- Incoraggia sempre e rassicura sui rischi ("I tuoi soldi restano sempre sui broker che scegli tu")
- Suggerisci di provare la demo o fare domande specifiche

ERRORI DA EVITARE:
- Non essere mai troppo tecnico
- Non fare lunghi monologhi
- Non usare termini finanziari complicati senza spiegarli
- Non promettere guadagni certi
- Non dare consigli di investimento specifici

${userContext}

Rispondi sempre in modo conciso (max 3-4 frasi) e amichevole. Mantieni un tono professionale ma mai freddo.`;

    if (!openAIApiKey) {
      console.error('[FINGENIUS] OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Configurazione mancante. La chiave API OpenAI non è stata configurata. Contatta l\'amministratore del sistema.' 
        }), 
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('[FINGENIUS] Calling OpenAI API with model: gpt-4o-mini');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 500,
        temperature: 0.7,
        stream: true
      }),
    });
    
    console.log('[FINGENIUS] OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[FINGENIUS] OpenAI API error:', response.status, errorText);
      
      let errorMessage = 'Si è verificato un errore con il servizio AI.';
      
      if (response.status === 401) {
        errorMessage = 'Chiave API OpenAI non valida. Contatta l\'amministratore.';
      } else if (response.status === 429) {
        errorMessage = 'Troppi messaggi. Riprova tra qualche minuto.';
      } else if (response.status === 402) {
        errorMessage = 'Crediti insufficienti. Contatta il supporto.';
      } else if (response.status === 400) {
        errorMessage = 'Richiesta non valida. Controlla i parametri.';
      }
      
      return new Response(JSON.stringify({ 
        error: errorMessage,
        details: errorText 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[FINGENIUS] Streaming response to client');
    
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('[FINGENIUS] Error in fingenius-chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Si è verificato un errore imprevisto. Riprova più tardi.',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
