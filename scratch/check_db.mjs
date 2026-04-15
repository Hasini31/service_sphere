const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing in environment.');
  process.exit(1);
}

const tables = ['profiles', 'services', 'contracts', 'issues', 'invoices', 'sla_metrics'];

async function checkDb() {
  console.log('--- Database Status Check ---');
  for (const table of tables) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'count=exact, head=true'
        }
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.error(`Error checking ${table}: ${response.status} ${response.statusText} - ${text}`);
      } else {
        const count = response.headers.get('content-range')?.split('/')?.[1] || '0';
        console.log(`${table}: ${count} rows`);
      }
    } catch (err) {
      console.error(`Error checking ${table}:`, err.message);
    }
  }
}

checkDb();
