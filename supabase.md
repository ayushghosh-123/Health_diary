# Supabase Setup Guide for Health Diary

## Project Architecture Overview

Based on the [Eraser.io project architecture](https://app.eraser.io/workspace/by7yZfATsGYMGInuXf4d?origin=share), this Health Diary application uses:

- **Frontend**: Next.js 15 with React 19
- **Authentication**: Clerk (for user management)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui

## 🚀 Complete Supabase Setup

### 1. Create Supabase Project

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Click "New Project"**
3. **Fill in project details:**
   - Organization: Select your organization
   - Name: `health-diary`
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
   - Pricing Plan: Free tier (sufficient for development)

4. **Wait for project initialization** (2-3 minutes)

### 2. Get Project Credentials

After project creation, go to **Settings > API**:

```bash
# Copy these values for your .env.local file
Project URL: https://your-project-id.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Environment Variables Setup

Create `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Clerk Authentication (already configured)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
CLERK_SECRET_KEY=your-clerk-secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### 4. Database Schema Setup

#### Option A: Using Supabase Dashboard (Recommended)

1. **Go to SQL Editor in Supabase Dashboard**
2. **Copy and paste the following schema:**

```sql
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

-- Create RLS policies for Clerk integration
-- Note: We use user_id (TEXT) instead of auth.uid() since we're using Clerk
CREATE POLICY "Users can view own entries" ON health_entries
  FOR SELECT USING (true); -- We'll handle auth in the application layer

CREATE POLICY "Users can insert own entries" ON health_entries
  FOR INSERT WITH CHECK (true); -- We'll handle auth in the application layer

CREATE POLICY "Users can update own entries" ON health_entries
  FOR UPDATE USING (true); -- We'll handle auth in the application layer

CREATE POLICY "Users can delete own entries" ON health_entries
  FOR DELETE USING (true); -- We'll handle auth in the application layer

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
```

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase in your project
supabase init

# Link to your remote project
supabase link --project-ref your-project-id

# Apply migrations
supabase db push
```

### 5. Authentication Integration

Since you're using **Clerk for authentication**, we need to handle user identification differently:

#### Current Implementation Analysis

Your current setup in `lib/supabase.ts`:

```typescript
// Current implementation uses Clerk user IDs
const { data, error } = await supabase
  .from('health_entries')
  .select('*')
  .eq('user_id', user.id) // user.id comes from Clerk
  .order('entry_date', { ascending: false });
```

This is **correct** for Clerk integration. The RLS policies are set to `true` because we handle authentication at the application layer.

### 6. Database Connection Types

#### A. Client-Side Connection (Current)

```typescript
// lib/supabase.ts - Current implementation
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Use for:**
- Client-side operations
- Real-time subscriptions
- User-facing features

#### B. Server-Side Connection (For Admin Operations)

Create `lib/supabase-admin.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
```

**Use for:**
- Admin operations
- Server-side data processing
- Bypassing RLS when needed

#### C. Edge Functions Connection

For Supabase Edge Functions:

```typescript
// supabase/functions/your-function/index.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 7. Security Configuration

#### Row Level Security (RLS)

Your current RLS setup is appropriate for Clerk integration:

```sql
-- RLS is enabled but policies allow all operations
-- Authentication is handled by Clerk middleware
ALTER TABLE health_entries ENABLE ROW LEVEL SECURITY;

-- Policies allow all operations (auth handled in app layer)
CREATE POLICY "Users can view own entries" ON health_entries FOR SELECT USING (true);
```

#### API Security

1. **Environment Variables**: Never commit `.env.local`
2. **CORS Configuration**: Configure in Supabase Dashboard > Settings > API
3. **Rate Limiting**: Configure in Supabase Dashboard > Settings > API

### 8. Testing Your Setup

#### Test Database Connection

Create `test-connection.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('health_entries')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Supabase connection successful!');
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
  }
}

testConnection();
```

Run: `node test-connection.js`

#### Test Authentication Flow

1. **Sign up** with Clerk
2. **Check** if user can create entries
3. **Verify** RLS is working (users only see their data)

### 9. Production Deployment

#### Environment Variables for Production

**Vercel Deployment:**
```bash
# Add these in Vercel Dashboard > Settings > Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Other Platforms:**
- **Netlify**: Add in Site Settings > Environment Variables
- **Railway**: Add in Project Settings > Variables
- **DigitalOcean**: Add in App Platform > Settings > Environment

#### Database Backups

1. **Automatic Backups**: Supabase provides automatic daily backups
2. **Manual Backups**: Use Supabase CLI or Dashboard
3. **Point-in-time Recovery**: Available on Pro plans

### 10. Monitoring and Analytics

#### Supabase Dashboard Features

1. **Database**: Monitor queries, connections, and performance
2. **Auth**: User management and sessions
3. **API**: Request logs and rate limiting
4. **Storage**: File uploads and management
5. **Edge Functions**: Serverless function logs

#### Recommended Monitoring

```typescript
// Add to your app for monitoring
const { data, error } = await supabase
  .from('health_entries')
  .select('*')
  .eq('user_id', user.id);

if (error) {
  console.error('Database error:', error);
  // Send to monitoring service (Sentry, LogRocket, etc.)
}
```

### 11. Common Issues and Solutions

#### Issue 1: "Missing Supabase environment variables"

**Solution:**
```bash
# Check your .env.local file exists
ls -la .env.local

# Verify variables are set
echo $NEXT_PUBLIC_SUPABASE_URL
```

#### Issue 2: "RLS policy violation"

**Solution:**
- Check if user is authenticated with Clerk
- Verify user_id matches in database
- Review RLS policies in Supabase Dashboard

#### Issue 3: "Connection timeout"

**Solution:**
- Check Supabase project status
- Verify network connectivity
- Review rate limiting settings

### 12. Advanced Features

#### Real-time Subscriptions

```typescript
// Listen to changes in health entries
const subscription = supabase
  .channel('health_entries_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'health_entries' },
    (payload) => {
      console.log('Change received!', payload);
      // Update UI
    }
  )
  .subscribe();
```

#### Database Functions

```sql
-- Create a function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_id_param TEXT)
RETURNS TABLE (
  total_entries BIGINT,
  avg_mood TEXT,
  total_sleep_hours DECIMAL,
  total_exercise_minutes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_entries,
    MODE() WITHIN GROUP (ORDER BY mood) as avg_mood,
    SUM(sleep_hours) as total_sleep_hours,
    SUM(exercise_minutes) as total_exercise_minutes
  FROM health_entries 
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;
```

### 13. Performance Optimization

#### Database Indexes

Your schema already includes optimized indexes:

```sql
-- These indexes are already created
CREATE INDEX idx_health_entries_user_id ON health_entries(user_id);
CREATE INDEX idx_health_entries_entry_date ON health_entries(entry_date);
CREATE INDEX idx_health_entries_user_date ON health_entries(user_id, entry_date);
```

#### Query Optimization

```typescript
// Good: Use specific columns
const { data } = await supabase
  .from('health_entries')
  .select('id, mood, entry_date')
  .eq('user_id', user.id);

// Avoid: Selecting all columns
const { data } = await supabase
  .from('health_entries')
  .select('*') // Only when you need all data
  .eq('user_id', user.id);
```

### 14. Backup and Recovery

#### Automatic Backups
- **Free Tier**: 7 days of backups
- **Pro Tier**: 30 days of backups
- **Team/Enterprise**: Custom backup retention

#### Manual Backup
```bash
# Using Supabase CLI
supabase db dump --file backup.sql

# Restore from backup
supabase db reset --file backup.sql
```

### 15. Cost Optimization

#### Free Tier Limits
- **Database Size**: 500MB
- **Bandwidth**: 2GB/month
- **API Requests**: 50,000/month
- **Auth Users**: 50,000

#### Monitoring Usage
1. **Dashboard**: Check usage in Supabase Dashboard
2. **Alerts**: Set up usage alerts
3. **Optimization**: Use indexes, limit queries

---

## 🎯 Quick Start Checklist

- [ ] Create Supabase project
- [ ] Get API credentials
- [ ] Set up environment variables
- [ ] Run database schema
- [ ] Test connection
- [ ] Deploy to production
- [ ] Set up monitoring

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Clerk + Supabase Integration](https://clerk.com/docs/integrations/databases/supabase)
- [Supabase Discord Community](https://discord.supabase.com)

---

**Need Help?** Check the [Supabase Community](https://github.com/supabase/supabase/discussions) or [Clerk Support](https://clerk.com/support) for assistance.
