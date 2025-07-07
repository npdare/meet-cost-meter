import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OAuthRequest {
  provider: 'google' | 'microsoft'
  code?: string
  state?: string
  redirect_uri: string
}

serve(async (req) => {
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

    const { provider, code, redirect_uri }: OAuthRequest = await req.json()

    if (provider === 'google') {
      if (!code) {
        // Step 1: Return authorization URL
        const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID')
        const scopes = [
          'https://www.googleapis.com/auth/calendar.readonly',
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile'
        ].join(' ')

        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
        authUrl.searchParams.set('client_id', clientId!)
        authUrl.searchParams.set('redirect_uri', redirect_uri)
        authUrl.searchParams.set('response_type', 'code')
        authUrl.searchParams.set('scope', scopes)
        authUrl.searchParams.set('access_type', 'offline')
        authUrl.searchParams.set('prompt', 'consent')
        authUrl.searchParams.set('state', user.id)

        return new Response(
          JSON.stringify({ authorization_url: authUrl.toString() }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        // Step 2: Exchange code for tokens
        const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID')
        const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET')

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId!,
            client_secret: clientSecret!,
            code,
            grant_type: 'authorization_code',
            redirect_uri,
          }),
        })

        if (!tokenResponse.ok) {
          throw new Error(`Token exchange failed: ${await tokenResponse.text()}`)
        }

        const tokenData = await tokenResponse.json()

        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        })

        const userInfo = await userInfoResponse.json()

        // Calculate expiry time
        const expiresAt = tokenData.expires_in 
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null

        // Store calendar connection
        const { data: connection, error: connectionError } = await supabaseClient
          .from('calendar_connections')
          .upsert({
            user_id: user.id,
            provider: 'google',
            provider_account_id: userInfo.id,
            provider_email: userInfo.email,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: expiresAt,
            scope: tokenData.scope,
            is_active: true,
          }, {
            onConflict: 'user_id,provider,provider_account_id'
          })
          .select()
          .single()

        if (connectionError) {
          console.error('Error storing calendar connection:', connectionError)
          throw new Error('Failed to store calendar connection')
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            connection: {
              id: connection.id,
              provider: connection.provider,
              email: connection.provider_email,
              connected_at: connection.created_at
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else if (provider === 'microsoft') {
      if (!code) {
        // Step 1: Return Microsoft authorization URL
        const clientId = Deno.env.get('MICROSOFT_OAUTH_CLIENT_ID')
        const scopes = [
          'https://graph.microsoft.com/Calendars.Read',
          'https://graph.microsoft.com/User.Read'
        ].join(' ')

        const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize')
        authUrl.searchParams.set('client_id', clientId!)
        authUrl.searchParams.set('redirect_uri', redirect_uri)
        authUrl.searchParams.set('response_type', 'code')
        authUrl.searchParams.set('scope', scopes)
        authUrl.searchParams.set('response_mode', 'query')
        authUrl.searchParams.set('state', user.id)

        return new Response(
          JSON.stringify({ authorization_url: authUrl.toString() }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        // Step 2: Exchange code for tokens
        const clientId = Deno.env.get('MICROSOFT_OAUTH_CLIENT_ID')
        const clientSecret = Deno.env.get('MICROSOFT_OAUTH_CLIENT_SECRET')

        const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId!,
            client_secret: clientSecret!,
            code,
            grant_type: 'authorization_code',
            redirect_uri,
          }),
        })

        if (!tokenResponse.ok) {
          throw new Error(`Microsoft token exchange failed: ${await tokenResponse.text()}`)
        }

        const tokenData = await tokenResponse.json()

        // Get user info from Microsoft Graph
        const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        })

        const userInfo = await userInfoResponse.json()

        // Calculate expiry time
        const expiresAt = tokenData.expires_in 
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null

        // Store calendar connection
        const { data: connection, error: connectionError } = await supabaseClient
          .from('calendar_connections')
          .upsert({
            user_id: user.id,
            provider: 'microsoft',
            provider_account_id: userInfo.id,
            provider_email: userInfo.mail || userInfo.userPrincipalName,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: expiresAt,
            scope: tokenData.scope,
            is_active: true,
          }, {
            onConflict: 'user_id,provider,provider_account_id'
          })
          .select()
          .single()

        if (connectionError) {
          console.error('Error storing Microsoft calendar connection:', connectionError)
          throw new Error('Failed to store Microsoft calendar connection')
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            connection: {
              id: connection.id,
              provider: connection.provider,
              email: connection.provider_email,
              connected_at: connection.created_at
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    throw new Error('Unsupported provider')

  } catch (error) {
    console.error('Calendar OAuth error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})