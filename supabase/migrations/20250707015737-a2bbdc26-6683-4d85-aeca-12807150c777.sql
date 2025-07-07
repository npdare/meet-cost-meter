-- Ensure RLS policies are properly configured for meetings table
-- Add index for better performance on user queries
CREATE INDEX IF NOT EXISTS idx_meetings_user_id_created_at ON public.meetings(user_id, created_at DESC);

-- Add index for calendar connections user queries
CREATE INDEX IF NOT EXISTS idx_calendar_connections_user_id ON public.calendar_connections(user_id);

-- Add index for calendar events user queries  
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id_start_time ON public.calendar_events(user_id, start_time DESC);

-- Add a function to safely get user profile data
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
AS $$
    SELECT p.id, p.user_id, p.display_name, p.subscription_status, p.subscription_expires_at
    FROM public.profiles p
    WHERE p.user_id = auth.uid();
$$;