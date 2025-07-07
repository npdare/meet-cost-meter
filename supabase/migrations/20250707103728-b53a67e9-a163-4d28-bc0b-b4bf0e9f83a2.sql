-- Add foreign key constraint to favorite_attendees table
ALTER TABLE public.favorite_attendees 
ADD CONSTRAINT favorite_attendees_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add security headers function for edge functions
CREATE OR REPLACE FUNCTION public.log_api_usage(
  user_id UUID,
  endpoint TEXT,
  request_count INTEGER DEFAULT 1
) RETURNS VOID AS $$
BEGIN
  -- This function can be used to track API usage for rate limiting
  -- For now, just log the usage (can be extended later)
  RAISE LOG 'API Usage: User % called endpoint % (count: %)', user_id, endpoint, request_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;