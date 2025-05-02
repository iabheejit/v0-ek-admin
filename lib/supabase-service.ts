import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for server-side operations (with service role key)
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)

// Client for client-side operations (with anon key)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Singleton pattern for client-side Supabase client
let clientSideSupabase: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseClient() {
  if (typeof window === "undefined") {
    // Server-side: use admin client
    return supabaseAdmin
  }

  // Client-side: use singleton pattern
  if (!clientSideSupabase) {
    clientSideSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }

  return clientSideSupabase
}
