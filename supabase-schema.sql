

-- Create health_entries table

CREATE TABLE IF NOT EXISTS health_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  entry_date DATE NOT NULL,
  mood TEXT CHECK (mood IN ('excellent', 'good', 'neutral', 'poor', 'terrible')),
  symptoms TEXT,
  notes TEXT,
  sleep_hours DECIMAL(3,1) DEFAULT 0 CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  water_intake DECIMAL(4,1) DEFAULT 0 CHECK (water_intake >= 0),
  exercise_minutes INTEGER DEFAULT 0 CHECK (exercise_minutes >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_health_entries_user_id ON health_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_health_entries_entry_date ON health_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_health_entries_user_date ON health_entries(user_id, entry_date);

-- Enable Row Level Security (RLS)
ALTER TABLE health_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own entries
CREATE POLICY "Users can view own entries" ON health_entries
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can insert their own entries
CREATE POLICY "Users can insert own entries" ON health_entries
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own entries
CREATE POLICY "Users can update own entries" ON health_entries
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Users can delete their own entries
CREATE POLICY "Users can delete own entries" ON health_entries
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_health_entries_updated_at
  BEFORE UPDATE ON health_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
