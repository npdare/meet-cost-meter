import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { storeConnection } from './database.ts'
import type { TokenData, UserInfo } from './types.ts'

export const handleGoogleAuth = async (
  code: string | undefined,
  redirectUri: string,
  userId: string,
  supabaseClient: SupabaseClient,
  corsHeaders: Record<string, string>
): Promise<Response> => {
  if (!code) {
    return getGoogleAuthUrl(redirectUri, userId, corsHeaders)
  }

  return exchangeGoogleCode(code, redirectUri, userId, supabaseClient, corsHeaders)
}

const getGoogleAuthUrl = (redirectUri: string, userId: string, corsHeaders: Record<string, string>): Response => {
  const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID')
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ].join(' ')

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', clientId!)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', scopes)
  authUrl.searchParams.set('access_type', 'offline')
  authUrl.searchParams.set('prompt', 'consent')
  authUrl.searchParams.set('state', userId)

  return new Response(
    JSON.stringify({ authorization_url: authUrl.toString() }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

const exchangeGoogleCode = async (
  code: string,
  redirectUri: string,
  userId: string,
  supabaseClient: SupabaseClient,
  corsHeaders: Record<string, string>
): Promise<Response> => {
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
      redirect_uri: redirectUri,
    }),
  })

  if (!tokenResponse.ok) {
    throw new Error(`Token exchange failed: ${await tokenResponse.text()}`)
  }

  const tokenData: TokenData = await tokenResponse.json()

  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })

  const userInfo: UserInfo = await userInfoResponse.json()

  const connection = await storeConnection(supabaseClient, userId, 'google', tokenData, userInfo)

  return new Response(
    JSON.stringify({ 
      success: true, 
      connection
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}