import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zcqrrqpktmegyjtcpaos.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcXJycXBrdG1lZ3lqdGNwYW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzYzMzcsImV4cCI6MjA3NjgxMjMzN30.IBvlwqEtkzDCCrjKj7DGdag5yvsOO7f8MoN07Eq7vB8';

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