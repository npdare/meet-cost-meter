import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const validateUser = async (authHeader: string | null) => {
  if (!authHeader) {
    throw new Error('No authorization header')
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
  
  if (userError || !user) {
    throw new Error('Invalid user token')
  }

  return { user, supabaseClient }
}