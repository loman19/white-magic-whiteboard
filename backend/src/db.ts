import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
); 