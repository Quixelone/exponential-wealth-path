import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestData = await req.json();
    const { investorType, name, email, ...otherFields } = requestData;

    console.log(`Processing ${investorType} inquiry from ${name} (${email})`);

    // Save to database
    const { data: inquiry, error: dbError } = await supabase
      .from('investor_inquiries')
      .insert({
        investor_type: investorType,
        name,
        email,
        data: otherFields,
        status: 'new',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log('Inquiry saved successfully:', inquiry.id);

    // Send email notification using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendApiKey) {
      try {
        // Email to team
        const teamEmailHtml = investorType === 'business-angel'
          ? `
            <h2>🚀 New Business Angel Inquiry</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>LinkedIn:</strong> ${otherFields.linkedin || 'N/A'}</p>
            <p><strong>Investment Range:</strong> ${otherFields.investmentRange}</p>
            <p><strong>Message:</strong></p>
            <p>${otherFields.message}</p>
            <hr>
            <p><small>Inquiry ID: ${inquiry.id}</small></p>
          `
          : `
            <h2>💼 New Venture Capital Inquiry</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Firm:</strong> ${otherFields.firm}</p>
            <p><strong>Position:</strong> ${otherFields.position}</p>
            <p><strong>AUM:</strong> ${otherFields.aum}</p>
            <p><strong>Timeframe:</strong> ${otherFields.timeframe}</p>
            <p><strong>Investment Thesis:</strong></p>
            <p>${otherFields.investmentThesis}</p>
            <hr>
            <p><small>Inquiry ID: ${inquiry.id}</small></p>
          `;

        const teamEmailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Investor Relations <investors@finanzacreativa.live>',
            to: ['lcoccimiglio@gmail.com'],
            subject: `${investorType === 'business-angel' ? '🚀' : '💼'} New ${investorType === 'business-angel' ? 'Business Angel' : 'Venture Capital'} Inquiry: ${name}`,
            html: teamEmailHtml,
          }),
        });

        if (!teamEmailResponse.ok) {
          const errorText = await teamEmailResponse.text();
          console.error('Resend team email error:', errorText);
        } else {
          console.log('Team notification email sent successfully');
        }

        // Auto-responder to investor
        const autoResponderHtml = investorType === 'business-angel'
          ? `
            <p>Hi ${name},</p>
            <p>Thank you for your interest in investing in Finanzacreativa.</p>
            <p>I'm Luigi, the founder. I read every inquiry personally.</p>
            <p>I'll review your message and get back to you within 24 hours to schedule a casual coffee chat (virtual or in-person if you're in Italy).</p>
            <p>In the meantime, feel free to:</p>
            <ul>
              <li>Download our <a href="https://finanzacreativa.live/docs/investor/business-angel-onepager.pdf">one-pager</a></li>
              <li>Join our investor updates list</li>
            </ul>
            <p>Looking forward to connecting!</p>
            <p>Luigi<br>Founder, Finanzacreativa</p>
          `
          : `
            <p>Dear ${name},</p>
            <p>Thank you for your interest in Finanzacreativa's Series A round.</p>
            <p>We've received your inquiry and our team will review it within 48 business hours.</p>
            <p>To expedite the process, we're granting you preliminary access to our investor materials:</p>
            <ul>
              <li>📄 <a href="https://finanzacreativa.live/docs/investor/venture-capital-executive-summary.pdf">Executive Summary</a></li>
              <li>📊 Financial Model (will be sent separately)</li>
              <li>📁 Data Room (NDA required - link will follow)</li>
            </ul>
            <p>We typically complete our investor evaluation process within 2 weeks.</p>
            <p>Best regards,<br>Investor Relations Team<br>Finanzacreativa</p>
          `;

        const autoResponderResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Finanzacreativa Team <noreply@finanzacreativa.live>',
            to: [email],
            subject: investorType === 'business-angel' 
              ? 'Thank you for your interest - Finanzacreativa'
              : 'Your Finanzacreativa Data Room Access - Next Steps',
            html: autoResponderHtml,
          }),
        });

        if (!autoResponderResponse.ok) {
          const errorText = await autoResponderResponse.text();
          console.error('Resend auto-responder error:', errorText);
        } else {
          console.log('Auto-responder email sent successfully');
        }

      } catch (emailError) {
        console.error('Error sending emails:', emailError);
        // Don't fail the whole request if email fails
      }
    } else {
      console.warn('RESEND_API_KEY not configured, skipping email notifications');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Inquiry submitted successfully',
        inquiryId: inquiry.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});
