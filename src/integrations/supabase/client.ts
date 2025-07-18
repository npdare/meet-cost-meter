// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qubtwlzumrbeltbrcvgn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1YnR3bHp1bXJiZWx0YnJjdmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MTA0NzgsImV4cCI6MjA2NzE4NjQ3OH0.h48KKBzjinCEV7Sr1rAIWb59PbLvWjYX5BpHwgAOt_U";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});