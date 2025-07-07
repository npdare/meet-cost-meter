// Get allowed origins from environment or use secure defaults
export const getAllowedOrigins = () => {
  const prodOrigin = 'https://app.myapp.com' // Replace with your actual domain
  const devOrigin = 'http://localhost:3000'
  return [prodOrigin, devOrigin, 'https://qubtwlzumrbeltbrcvgn.supabase.co']
}

export const getCorsHeaders = (origin?: string) => {
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

export const sanitizeError = (error: Error): string => {
  return error.message.includes('authentication') || error.message.includes('Authorization') 
    ? error.message 
    : 'An unexpected error occurred. Please try again.'
}