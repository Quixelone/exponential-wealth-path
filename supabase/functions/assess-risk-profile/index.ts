import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuizAnswer {
  question: string;
  answer: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== Starting risk profile assessment ===");
    
    // Get user from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error("User not authenticated");
    console.log("User authenticated:", user.id);

    // Get quiz responses from request
    const { quizResponses, calculatedRiskLevel }: { 
      quizResponses: QuizAnswer[];
      calculatedRiskLevel: string;
    } = await req.json();
    console.log("Quiz responses received:", JSON.stringify(quizResponses, null, 2));

    // Call Lovable AI for risk assessment
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Sei un esperto consulente finanziario specializzato in criptovalute e trading di opzioni Bitcoin.
Il tuo compito è valutare il profilo di rischio dell'utente e raccomandare un percorso educativo personalizzato.

Analizza le risposte dell'utente e fornisci:
1. Livello di rischio (conservative, moderate, aggressive, expert)
2. Descrizione dettagliata dell'esperienza crypto
3. Raccomandazioni specifiche sui corsi da seguire
4. Motivazione per ogni raccomandazione

Considera:
- Esperienza crypto attuale
- Frequenza di trading
- Tolleranza al rischio
- Obiettivi di investimento
- Preferenze di apprendimento
- Conoscenza Bitcoin
- Esperienza con opzioni

Rispondi in italiano con un tono professionale ma accessibile.`;

    // Format quiz responses for AI
    const formattedResponses = quizResponses.map((r, i) => 
      `${i + 1}. ${r.question}\n   Risposta: ${r.answer}`
    ).join("\n\n");

    const userPrompt = `Valuta questo profilo utente basato sulle seguenti risposte:

${formattedResponses}

Livello di rischio calcolato: ${calculatedRiskLevel}

Fornisci una valutazione completa con:
1. Conferma o modifica del livello di rischio
2. Analisi delle competenze attuali
3. Raccomandazioni specifiche sui corsi da seguire
4. Motivazione per ogni raccomandazione`;

    console.log("Calling Lovable AI for assessment...");
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const aiAssessment = aiData.choices[0].message.content;
    console.log("AI assessment received:", aiAssessment.substring(0, 200) + "...");

    // Determine risk level from AI response or use calculated one
    let riskLevel: "conservative" | "moderate" | "aggressive" | "expert" = calculatedRiskLevel as any || "conservative";
    const aiLower = aiAssessment.toLowerCase();
    
    // AI can override the calculated risk level if it suggests differently
    if (aiLower.includes("expert") || aiLower.includes("esperto")) {
      riskLevel = "expert";
    } else if (aiLower.includes("aggressive") || aiLower.includes("aggressiv")) {
      riskLevel = "aggressive";
    } else if (aiLower.includes("moderate") || aiLower.includes("moderat")) {
      riskLevel = "moderate";
    } else if (aiLower.includes("conservativ") || aiLower.includes("prudent")) {
      riskLevel = "conservative";
    }

    console.log("Risk level - Calculated:", calculatedRiskLevel, "Final:", riskLevel);

    // Extract crypto experience from first question
    const experienceAnswer = quizResponses.find(r => 
      r.question.includes("esperienza con il trading")
    );
    
    // Save risk profile to database
    const { data: profile, error: profileError } = await supabaseClient
      .from("user_risk_profiles")
      .upsert({
        user_id: user.id,
        risk_level: riskLevel,
        crypto_experience: experienceAnswer?.answer || "unknown",
        investment_goals: [], // Can be extracted from answers if needed
        recommended_courses: [], // Will be updated when courses are created
        ai_assessment: {
          assessment: aiAssessment,
          timestamp: new Date().toISOString(),
          model: "google/gemini-2.5-flash",
          calculatedRiskLevel
        },
        quiz_responses: quizResponses,
        updated_at: new Date().toISOString()
      }, {
        onConflict: "user_id"
      })
      .select()
      .single();

    if (profileError) {
      console.error("Error saving profile:", profileError);
      throw new Error(`Failed to save risk profile: ${profileError.message}`);
    }

    console.log("Risk profile saved successfully:", profile.id);

    return new Response(
      JSON.stringify({
        success: true,
        profile: {
          id: profile.id,
          risk_level: riskLevel,
          ai_assessment: aiAssessment,
          quiz_responses: quizResponses
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in assess-risk-profile:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
