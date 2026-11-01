import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL と SUPABASE_ANON_KEY を .env に設定してください');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
