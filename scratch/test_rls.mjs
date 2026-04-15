const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testRLS() {
  const email = 'jordan@retailcorp.com';
  console.log(`Checking profile for: ${email}`);
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${email}&select=id,role`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  
  if (!response.ok) {
    const text = await response.text();
    console.error(`Error: ${response.status} ${text}`);
  } else {
    const data = await response.json();
    console.log('Result:', data);
  }
}

testRLS();
