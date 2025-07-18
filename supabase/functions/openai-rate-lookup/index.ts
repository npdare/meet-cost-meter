import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Get allowed origins from environment or use secure defaults
const getAllowedOrigins = () => {
  const projectDomain = 'https://e151aae9-9bf3-4dd4-a806-7490dec75a7f.lovableproject.com'
  const supabaseDomain = 'https://qubtwlzumrbeltbrcvgn.supabase.co'
  const devOrigin = 'http://localhost:3000'
  return [projectDomain, supabaseDomain, devOrigin, '*'] // Allow all for now
}

const getCorsHeaders = (origin?: string) => {
  return {
    'Access-Control-Allow-Origin': '*', // Temporarily allow all origins
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)
  
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
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: `You are a professional compensation expert. Return ONLY a number representing the typical hourly rate in USD that would be used to calculate the cost of having this role in a business meeting. Consider appropriate rates for all levels:

- Entry level (Intern, Junior): $15-35/hour
- Mid-level (Associate, Analyst): $35-75/hour  
- Senior (Senior roles, Specialist): $75-150/hour
- Management (Manager, Director): $100-200/hour
- Executive (VP, C-suite): $200-500+/hour

Factor in industry standards, regional variations, and role responsibility level. Return only the number without currency symbols or explanations.`
          },
          { 
            role: 'user', 
            content: `What is the typical hourly meeting cost rate for a ${role} in the ${region || 'Technology'} industry?`
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
    console.error('OpenAI rate lookup error:', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    // Sanitize error message for client
    const clientError = error.message.includes('API') || error.message.includes('rate') 
      ? 'Service temporarily unavailable. Please try again.' 
      : 'An unexpected error occurred.';
    
    return new Response(JSON.stringify({ 
      error: clientError,
      rate: 75 // fallback rate
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});