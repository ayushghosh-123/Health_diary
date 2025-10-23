import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type HealthEntry = {
  id: string;
  user_id: string;
  entry_date: string;
  mood: string;
  symptoms: string;
  notes: string;
  sleep_hours: number;
  water_intake: number;
  exercise_minutes: number;
  created_at: string;
  updated_at: string;
};