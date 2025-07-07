import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { role, region } = await req.json();

    if (!role) {
      throw new Error('Role is required');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are a salary data expert. Return ONLY a number representing the average hourly rate in USD for the given role and region. Consider market rates, cost of living, and industry standards. Return only the number, no currency symbols or explanations.`
          },
          { 
            role: 'user', 
            content: `What is the average hourly rate for a ${role} in ${region || 'North America'}?`
          }
        ],
        temperature: 0.2,
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Extract number from response
    const rate = parseFloat(content.replace(/[^\d.]/g, ''));
    
    if (isNaN(rate) || rate <= 0) {
      throw new Error('Invalid rate returned from OpenAI');
    }

    return new Response(JSON.stringify({ rate }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in openai-rate-lookup function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      rate: 75 // fallback rate
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});