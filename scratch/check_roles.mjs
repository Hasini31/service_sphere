const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkRoles() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=role`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  
  const roles = await response.json();
  console.log('Roles found in database:', [...new Set(roles.map(r => r.role))]);
}

checkRoles();
