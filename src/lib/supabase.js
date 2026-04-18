import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    '%c[Novaël] Missing Supabase env vars.\n' +
      'Copy `.env.local.example` → `.env.local` and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.\n' +
      'The app will render but data operations will fail until configured.',
    'color: #C6A97A; font-weight: bold;',
  )
}

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)

export const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
