import { createClient } from '@supabase/supabase-js'

// Note: This client uses the service_role key to bypass Row Level Security.
// It should NEVER be exposed to the client-side code and must only be used in
// Server Actions, Route Handlers, or Server Components.
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in the environment variables.')
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
