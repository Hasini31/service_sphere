import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  // CLIENT DEMO MODE BYPASS
  const originalGetUser = client.auth.getUser.bind(client.auth);
  client.auth.getUser = async (...args) => {
    const { data, error } = await originalGetUser(...args);
    if (data?.user) return { data, error };

    // Check for demo cookie in the browser
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {} as Record<string, string>);

    const demoEmail = cookies['demo_email'];
    if (demoEmail) {
      const { data: profile } = await client.from('profiles').select('id, role').eq('email', demoEmail).single();
      if (profile) {
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
