import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { ConnectionResponse, TokenData, UserInfo } from './types.ts'

export const storeConnection = async (
  supabaseClient: SupabaseClient,
  userId: string,
  provider: 'google' | 'microsoft',
  tokenData: TokenData,
  userInfo: UserInfo
): Promise<ConnectionResponse> => {
  const expiresAt = tokenData.expires_in 
    ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    : null

  const { data: connection, error: connectionError } = await supabaseClient
    .from('calendar_connections')
    .upsert({
      user_id: userId,
      provider,
      provider_account_id: userInfo.id,
      provider_email: provider === 'microsoft' 
        ? (userInfo.mail || userInfo.userPrincipalName)
        : userInfo.email,
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
    console.error(`${provider} connection error:`, { 
      error: connectionError.message,
      user_id: userId,
      provider
    })
    throw new Error('Authentication failed. Please try again.')
  }

  return {
    id: connection.id,
    provider: connection.provider,
    email: connection.provider_email,
    connected_at: connection.created_at
  }
}