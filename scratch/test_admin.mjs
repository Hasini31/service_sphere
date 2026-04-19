import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testConnection() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1)
  if (error) {
    console.error('Error connecting to Supabase:', error.message)
  } else {
    console.log('Successfully connected to Supabase!')
    console.log('Sample profile data:', data)
  }
}

testConnection()
