const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkProfilesTable() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*&limit=1`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'count=exact, head=true'
    }
  });
  
  if (!response.ok) {
     console.error('Error:', await response.text());
  } else {
     console.log('Columns:', response.headers.get('content-range'));
     // To see actual columns, we'd need a successful select *
     const dataResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*&limit=1`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
     });
     const data = await dataResponse.json();
     if (data.length > 0) {
        console.log('Sample row keys:', Object.keys(data[0]));
     } else {
        console.log('No rows found');
     }
  }
}

checkProfilesTable();
