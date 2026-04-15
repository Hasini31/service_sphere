const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkContracts() {
  console.log('--- Checking for new contracts ---');
  const response = await fetch(`${SUPABASE_URL}/rest/v1/contracts?select=*,client:profiles!contracts_client_id_fkey(company_name),vendor:profiles!contracts_vendor_id_fkey(company_name)`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  
  const data = await response.json();
  if (data.length > 0) {
    console.log(`Found ${data.length} contracts.`);
    data.forEach(c => {
      console.log(`- Contract ${c.id}: ${c.client?.company_name} -> ${c.vendor?.company_name} ($${c.cost})`);
    });
  } else {
    console.log('No contracts found yet.');
  }
}

checkContracts();
