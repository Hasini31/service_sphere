const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function getProfiles() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,email,company_name,role`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  
  const profiles = await response.json();
  console.log(JSON.stringify(profiles, null, 2));
}

getProfiles();
