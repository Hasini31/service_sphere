const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function listTables() {
  console.log('--- Listing All Tables ---');
  // We can query the OpenAPI spec which Supabase provides
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (!response.ok) {
        console.error('Failed to fetch schema');
        return;
    }

    const data = await response.json();
    const tables = Object.keys(data.definitions || {});
    console.log('Tables found:', tables.join(', '));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

listTables();
