-- Fix search path security issue for database functions
-- Update all SECURITY DEFINER functions to have secure search paths

CREATE OR REPLACE FUNCTION public.log_api_usage(
  user_id UUID,
  endpoint TEXT,
  request_count INTEGER DEFAULT 1
) RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- This function can be used to track API usage for rate limiting
  -- For now, just log the usage (can be extended later)
  RAISE LOG 'API Usage: User % called endpoint % (count: %)', user_id, endpoint, request_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Update the updated_at column to current timestamp
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    display_name TEXT,
    subscription_status TEXT,
    subscription_expires_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
    SELECT p.id, p.user_id, p.display_name, p.subscription_status, p.subscription_expires_at
    FROM public.profiles p
    WHERE p.user_id = auth.uid();
$$;