export interface OAuthRequest {
  provider: 'google' | 'microsoft'
  code?: string
  state?: string
  redirect_uri: string
}

export interface ConnectionResponse {
  id: string
  provider: string
  email: string
  connected_at: string
}

export interface TokenData {
  access_token: string
  refresh_token?: string
  expires_in?: number
  scope?: string
}

export interface UserInfo {
  id: string
  email?: string
  mail?: string
  userPrincipalName?: string
}