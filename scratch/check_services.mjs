const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkServices() {
  console.log('--- Checking Services Prices ---');
  const response = await fetch(`${SUPABASE_URL}/rest/v1/services?select=name,price_small,price_medium,price_large`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

checkServices();
