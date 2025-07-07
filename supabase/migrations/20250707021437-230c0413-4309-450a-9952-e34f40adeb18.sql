-- Create favorite_attendees table for Pro users
CREATE TABLE public.favorite_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  rate NUMERIC NOT NULL DEFAULT 0,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.favorite_attendees ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own favorite attendees" 
ON public.favorite_attendees 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorite attendees" 
ON public.favorite_attendees 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorite attendees" 
ON public.favorite_attendees 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite attendees" 
ON public.favorite_attendees 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_favorite_attendees_updated_at
BEFORE UPDATE ON public.favorite_attendees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();