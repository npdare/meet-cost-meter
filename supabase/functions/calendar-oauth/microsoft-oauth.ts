import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { storeConnection } from './database.ts'
import type { TokenData, UserInfo } from './types.ts'

export const handleMicrosoftAuth = async (
  code: string | undefined,
  redirectUri: string,
  userId: string,
  supabaseClient: SupabaseClient,
  corsHeaders: Record<string, string>
): Promise<Response> => {
  if (!code) {
    return getMicrosoftAuthUrl(redirectUri, userId, corsHeaders)
  }

  return exchangeMicrosoftCode(code, redirectUri, userId, supabaseClient, corsHeaders)
}

const getMicrosoftAuthUrl = (redirectUri: string, userId: string, corsHeaders: Record<string, string>): Response => {
  const clientId = Deno.env.get('MICROSOFT_OAUTH_CLIENT_ID')
  const scopes = [
    'https://graph.microsoft.com/Calendars.Read',
    'https://graph.microsoft.com/User.Read'
  ].join(' ')

  const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize')
  authUrl.searchParams.set('client_id', clientId!)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', scopes)
  authUrl.searchParams.set('response_mode', 'query')
  authUrl.searchParams.set('state', userId)

  return new Response(
    JSON.stringify({ authorization_url: authUrl.toString() }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

const exchangeMicrosoftCode = async (
  code: string,
  redirectUri: string,
  userId: string,
  supabaseClient: SupabaseClient,
  corsHeaders: Record<string, string>
): Promise<Response> => {
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
      redirect_uri: redirectUri,
    }),
  })

  if (!tokenResponse.ok) {
    throw new Error(`Microsoft token exchange failed: ${await tokenResponse.text()}`)
  }

  const tokenData: TokenData = await tokenResponse.json()

  const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })

  const userInfo: UserInfo = await userInfoResponse.json()

  const connection = await storeConnection(supabaseClient, userId, 'microsoft', tokenData, userInfo)

  return new Response(
    JSON.stringify({ 
      success: true, 
      connection
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}