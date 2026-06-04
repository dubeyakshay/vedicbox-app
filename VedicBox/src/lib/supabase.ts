import { createClient } from '@supabase/supabase-js';

// Supports BOTH Vercel integration (NEXT_PUBLIC_) and manual setup (VITE_)
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://YOUR_PROJECT_ID.supabase.co';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'YOUR_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if Supabase is configured (either via Vercel integration or manual)
export const isSupabaseConfigured = () => {
  return (
    !SUPABASE_URL.includes('YOUR_PROJECT_ID') &&
    !SUPABASE_ANON_KEY.includes('YOUR_ANON_KEY')
  );
};
