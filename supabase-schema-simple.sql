-- Simplified Supabase Schema for Reflect & Connect Journaling System
-- This version focuses on basic functionality without complex RPC functions

-- Create users table (extends Clerk user data)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk user ID
  username TEXT,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journals table
CREATE TABLE IF NOT EXISTS journals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1', -- Journal color theme
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('excellent', 'good', 'neutral', 'poor', 'terrible')),
  tags TEXT[], -- Array of tags
  is_private BOOLEAN DEFAULT TRUE,
  word_count INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 0, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chats table for chatbot conversations
CREATE TABLE IF NOT EXISTS chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL, -- Groups messages in a conversation
  message TEXT NOT NULL,
  is_user_message BOOLEAN NOT NULL,
  context_data JSONB, -- Store relevant journal data for context
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create avatar table for user mood tracking
CREATE TABLE IF NOT EXISTS avatar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL CHECK (mood IN ('happy', 'sad', 'excited', 'calm', 'anxious', 'grateful', 'frustrated', 'peaceful')),
  mood_intensity INTEGER CHECK (mood_intensity >= 1 AND mood_intensity <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create health_entries table (enhanced from original)
CREATE TABLE IF NOT EXISTS health_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  mood TEXT CHECK (mood IN ('excellent', 'good', 'neutral', 'poor', 'terrible')),
  symptoms TEXT,
  notes TEXT,
  sleep_hours DECIMAL(3,1) DEFAULT 0 CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  water_intake DECIMAL(4,1) DEFAULT 0 CHECK (water_intake >= 0),
  exercise_minutes INTEGER DEFAULT 0 CHECK (exercise_minutes >= 0),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table for extended user information
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  age INTEGER,
  height INTEGER, -- in cm
  weight DECIMAL(5,2), -- in kg
  health_goals TEXT[],
  medical_conditions TEXT[],
  medications TEXT[],
  emergency_contact TEXT,
  doctor_info TEXT,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journals_user_id ON journals(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_journal_id ON journal_entries(journal_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_session_id ON chats(session_id);
CREATE INDEX IF NOT EXISTS idx_avatar_user_id ON avatar(user_id);
CREATE INDEX IF NOT EXISTS idx_avatar_created_at ON avatar(created_at);
CREATE INDEX IF NOT EXISTS idx_health_entries_user_id ON health_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_health_entries_entry_date ON health_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for Clerk integration
-- Note: We use permissive policies since Clerk handles authentication
CREATE POLICY "Users can manage own data" ON users
  FOR ALL USING (true);

CREATE POLICY "Users can manage own journals" ON journals
  FOR ALL USING (true);

CREATE POLICY "Users can manage own journal entries" ON journal_entries
  FOR ALL USING (true);

CREATE POLICY "Users can manage own chats" ON chats
  FOR ALL USING (true);

CREATE POLICY "Users can manage own avatar" ON avatar
  FOR ALL USING (true);

CREATE POLICY "Users can manage own health entries" ON health_entries
  FOR ALL USING (true);

CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journals_updated_at
  BEFORE UPDATE ON journals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_entries_updated_at
  BEFORE UPDATE ON health_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate word count and reading time
CREATE OR REPLACE FUNCTION calculate_content_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate word count (simple word splitting)
  NEW.word_count = array_length(string_to_array(trim(NEW.content), ' '), 1);
  
  -- Calculate reading time (average 200 words per minute)
  NEW.reading_time = CEIL(NEW.word_count / 200.0);
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for content metrics
CREATE TRIGGER calculate_journal_entry_metrics
  BEFORE INSERT OR UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_content_metrics();
