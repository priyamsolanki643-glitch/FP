import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Initialize the Supabase client using the Service Role Key for backend administration
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
