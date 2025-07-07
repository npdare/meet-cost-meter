import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getCorsHeaders, sanitizeError } from './utils.ts'
import { validateUser } from './auth.ts'
import { handleGoogleAuth } from './google-oauth.ts'
import { handleMicrosoftAuth } from './microsoft-oauth.ts'
import type { OAuthRequest } from './types.ts'

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user, supabaseClient } = await validateUser(req.headers.get('Authorization'))
    const { provider, code, redirect_uri }: OAuthRequest = await req.json()

    if (provider === 'google') {
      return await handleGoogleAuth(code, redirect_uri, user.id, supabaseClient, corsHeaders)
    } else if (provider === 'microsoft') {
      return await handleMicrosoftAuth(code, redirect_uri, user.id, supabaseClient, corsHeaders)
    }

    throw new Error('Unsupported provider')

  } catch (error) {
    console.error('Calendar OAuth error:', { 
      error: error.message,
      timestamp: new Date().toISOString()
    })
    
    const clientError = sanitizeError(error)
    
    return new Response(
      JSON.stringify({ error: clientError }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})