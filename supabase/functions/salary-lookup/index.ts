import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Get allowed origins from environment or use secure defaults
const getAllowedOrigins = () => {
  const prodOrigin = 'https://app.myapp.com' // Replace with your actual domain
  const devOrigin = 'http://localhost:3000'
  return [prodOrigin, devOrigin, 'https://qubtwlzumrbeltbrcvgn.supabase.co']
}

const getCorsHeaders = (origin?: string) => {
  const allowedOrigins = getAllowedOrigins()
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }
}

interface SalaryRequest {
  role: string
  region: string
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the user from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    const { role, region }: SalaryRequest = await req.json()

    if (!role || !region) {
      throw new Error('Role and region are required')
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    console.log(`Looking up salary for ${role} in ${region}`)

    // Use OpenAI to get salary estimate
    const prompt = `What is the median hourly salary for a ${role} in ${region} in USD? 
    Please respond with just a number representing the hourly rate in USD, no currency symbols or additional text. 
    Base this on current market rates for 2024/2025. If you're unsure, provide a reasonable estimate based on similar roles.
    
    For context:
    - Senior/Lead roles typically earn 20-40% more than mid-level
    - Executive roles (CEO, CTO, VP) typically earn $150-300+ per hour
    - Engineering roles vary widely by seniority and location
    - Consider cost of living differences between regions
    
    Role: ${role}
    Region: ${region}
    
    Respond with only the hourly rate number:`

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
            content: 'You are a salary research expert. Provide accurate hourly salary estimates based on current market data. Always respond with just the number.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 50,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const salaryText = data.choices[0].message.content.trim()
    
    // Parse the salary number
    const salaryMatch = salaryText.match(/\d+(?:\.\d{1,2})?/)
    const hourlyRate = salaryMatch ? parseFloat(salaryMatch[0]) : null

    if (!hourlyRate || hourlyRate <= 0) {
      throw new Error('Could not parse valid salary from OpenAI response')
    }

    console.log(`Salary lookup result: ${role} in ${region} = $${hourlyRate}/hour`)

    return new Response(
      JSON.stringify({ 
        success: true,
        role,
        region,
        hourly_rate: hourlyRate,
        source: 'openai_estimate'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Salary lookup error:', {
      error: error.message,
      timestamp: new Date().toISOString(),
      user_id: 'unknown'
    })
    
    // Sanitize error message for client
    const clientError = error.message.includes('API') || error.message.includes('OpenAI') 
      ? 'Service temporarily unavailable. Please try again.' 
      : 'An unexpected error occurred. Please try again.';
    
    return new Response(
      JSON.stringify({ 
        error: clientError,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})