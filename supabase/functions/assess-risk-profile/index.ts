import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuizResponse {
  question: string;
  answer: string;
}

interface AssessmentRequest {
  quizResponses: QuizResponse[];
}

interface RiskProfile {
  risk_level: 'conservative' | 'moderate' | 'aggressive' | 'expert';
  crypto_experience: string;
  investment_goals: string[];
  recommended_courses: string[];
  ai_assessment: {
    reasoning: string;
    strengths: string[];
    areas_to_improve: string[];
    learning_path: string;
  };
}

const SYSTEM_PROMPT = `Sei un esperto consulente finanziario specializzato in criptovalute e strategie di investimento Bitcoin.

Il tuo compito è valutare il profilo di rischio di un utente basandoti sulle risposte a un questionario e fornire:

1. **Livello di Rischio** (risk_level): Scegli uno tra:
   - "conservative": Principiante, preferisce sicurezza, capital preservation
   - "moderate": Esperienza base, disposto ad accettare rischi moderati
   - "aggressive": Esperienza intermedia, cerca rendimenti elevati
   - "expert": Esperto avanzato, gestisce strategie complesse

2. **Esperienza Crypto** (crypto_experience): Descrizione breve della loro esperienza (2-3 frasi)

3. **Obiettivi di Investimento** (investment_goals): Array di 3-5 obiettivi principali

4. **Corsi Raccomandati** (recommended_courses): Array di titoli dei corsi da seguire in ordine di priorità

5. **Valutazione AI** (ai_assessment):
   - reasoning: Spiegazione dettagliata della valutazione (3-4 paragrafi)
   - strengths: Array di 3-4 punti di forza identificati
   - areas_to_improve: Array di 3-4 aree da migliorare
   - learning_path: Piano di apprendimento personalizzato (2-3 paragrafi)

Restituisci SOLO un JSON valido nel seguente formato, senza markdown o altro testo:

{
  "risk_level": "moderate",
  "crypto_experience": "...",
  "investment_goals": ["...", "..."],
  "recommended_courses": ["Corso Base Bitcoin", "Strategie DCA", "..."],
  "ai_assessment": {
    "reasoning": "...",
    "strengths": ["...", "..."],
    "areas_to_improve": ["...", "..."],
    "learning_path": "..."
  }
}`;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    console.log('Processing risk assessment for user:', user.id);

    // Parse request body
    const { quizResponses }: AssessmentRequest = await req.json();
    
    if (!quizResponses || !Array.isArray(quizResponses) || quizResponses.length === 0) {
      throw new Error('Invalid quiz responses');
    }

    // Build user prompt from quiz responses
    const userPrompt = `Ecco le risposte dell'utente al questionario di valutazione del rischio:

${quizResponses.map((q, idx) => `${idx + 1}. ${q.question}\nRisposta: ${q.answer}`).join('\n\n')}

Valuta il profilo di rischio dell'utente e fornisci una valutazione completa.`;

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Calling Lovable AI for risk assessment...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('Payment required. Please add credits to your Lovable AI workspace.');
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;
    
    if (!aiContent) {
      throw new Error('No response from AI');
    }

    console.log('AI Response received, parsing...');

    // Parse AI response
    let riskProfile: RiskProfile;
    try {
      // Remove markdown code blocks if present
      const cleanContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      riskProfile = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Invalid AI response format');
    }

    // Validate risk profile
    const validRiskLevels = ['conservative', 'moderate', 'aggressive', 'expert'];
    if (!validRiskLevels.includes(riskProfile.risk_level)) {
      throw new Error('Invalid risk level from AI');
    }

    // Save to database
    console.log('Saving risk profile to database...');

    const { error: upsertError } = await supabaseClient
      .from('user_risk_profiles')
      .upsert({
        user_id: user.id,
        risk_level: riskProfile.risk_level,
        crypto_experience: riskProfile.crypto_experience,
        investment_goals: riskProfile.investment_goals,
        recommended_courses: [], // Will be populated when courses are created
        ai_assessment: riskProfile.ai_assessment,
        quiz_responses: quizResponses,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      console.error('Database error:', upsertError);
      throw new Error(`Failed to save risk profile: ${upsertError.message}`);
    }

    console.log('Risk profile saved successfully');

    return new Response(
      JSON.stringify({
        success: true,
        profile: riskProfile,
        message: 'Profilo di rischio creato con successo'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in assess-risk-profile:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
