// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true, // Ensure this is true
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
    // No custom cookie config — let @supabase/ssr handle it
  )
}