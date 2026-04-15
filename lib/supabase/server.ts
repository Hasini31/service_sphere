import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = await cookies()

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // The "setAll" method was called from a Server Component.
          }
        },
      },
    },
  )

  // DEMO MODE BYPASS: If normal auth fails, check for a demo email cookie
  const originalGetUser = client.auth.getUser.bind(client.auth);
  client.auth.getUser = async (...args) => {
    const { data, error } = await originalGetUser(...args);
    if (data?.user) return { data, error };

    const demoEmail = cookieStore.get('demo_email')?.value;
    if (demoEmail) {
      console.log('--- BYPASS: Found demo_email cookie:', demoEmail);
      const { data: profile, error: profileError } = await client.from('profiles').select('id, role').eq('email', demoEmail).single();
      
      if (profileError) {
        console.error('--- BYPASS ERROR: Could not find profile for', demoEmail, profileError.message);
      }

      if (profile) {
        console.log('--- BYPASS SUCCESS: Logged in as', profile.id);
        return {
          data: {
            user: { id: profile.id, email: demoEmail, role: 'authenticated' } as any
          },
          error: null
        };
      }
    }
    return { data, error };
  };

  return client
}
