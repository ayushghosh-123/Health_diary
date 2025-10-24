import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Enhanced types for Reflect & Connect Journaling System
export type User = {
  id: string;
  username?: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type Journal = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  color: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type JournalEntry = {
  id: string;
  journal_id: string;
  user_id: string;
  title?: string;
  content: string;
  mood?: 'excellent' | 'good' | 'neutral' | 'poor' | 'terrible';
  tags?: string[];
  is_private: boolean;
  word_count: number;
  reading_time: number;
  created_at: string;
  updated_at: string;
};

export type Chat = {
  id: string;
  user_id: string;
  session_id: string;
  message: string;
  is_user_message: boolean;
  context_data?: any;
  created_at: string;
};

export type Avatar = {
  id: string;
  user_id: string;
  mood: 'happy' | 'sad' | 'excited' | 'calm' | 'anxious' | 'grateful' | 'frustrated' | 'peaceful';
  mood_intensity: number;
  notes?: string;
  created_at: string;
};

export type HealthEntry = {
  id: string;
  user_id: string;
  entry_date: string;
  mood?: 'excellent' | 'good' | 'neutral' | 'poor' | 'terrible';
  symptoms?: string;
  notes?: string;
  sleep_hours: number;
  water_intake: number;
  exercise_minutes: number;
  energy_level?: number;
  stress_level?: number;
  created_at: string;
  updated_at: string;
};

export type UserProfile = {
  id: string;
  user_id: string;
  age?: number;
  height?: number;
  weight?: number;
  health_goals?: string[];
  medical_conditions?: string[];
  medications?: string[];
  emergency_contact?: string;
  doctor_info?: string;
  additional_notes?: string;
  created_at: string;
  updated_at: string;
};

// Database helper functions
export const dbHelpers = {
  // User management
  async createUser(userData: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();
      
      if (error && error.code !== '23505') { // 23505 = unique violation
        throw error;
      }
      
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  // Journal management
  async createJournal(journalData: Partial<Journal>) {
    const { data, error } = await supabase
      .from('journals')
      .insert([journalData])
      .select()
      .single();
    return { data, error };
  },

  async getUserJournals(userId: string) {
    const { data, error } = await supabase
      .from('journals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Journal entries
  async createJournalEntry(entryData: Partial<JournalEntry>) {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([entryData])
      .select()
      .single();
    return { data, error };
  },

  async getJournalEntries(journalId: string) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('journal_id', journalId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Chat management
  async saveChatMessage(chatData: Partial<Chat>) {
    const { data, error } = await supabase
      .from('chats')
      .insert([chatData])
      .select()
      .single();
    return { data, error };
  },

  async getChatHistory(userId: string, sessionId?: string) {
    let query = supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Avatar mood tracking
  async saveAvatarMood(avatarData: Partial<Avatar>) {
    const { data, error } = await supabase
      .from('avatar')
      .insert([avatarData])
      .select()
      .single();
    return { data, error };
  },

  async getUserMoodHistory(userId: string) {
    const { data, error } = await supabase
      .from('avatar')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Health entries
  async createHealthEntry(entryData: Partial<HealthEntry>) {
    const { data, error } = await supabase
      .from('health_entries')
      .insert([entryData])
      .select()
      .single();
    return { data, error };
  },

  async getUserHealthEntries(userId: string) {
    const { data, error } = await supabase
      .from('health_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false });
    return { data, error };
  },

  // User profiles
  async createUserProfile(profileData: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profileData])
      .select()
      .single();
    return { data, error };
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  async updateUserProfile(userId: string, profileData: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('user_id', userId)
      .select()
      .single();
    return { data, error };
  },

  // Statistics
  async getUserStats(userId: string) {
    const { data, error } = await supabase
      .rpc('get_user_stats', { user_id_param: userId });
    return { data, error };
  },

  async getJournalInsights(journalId: string) {
    const { data, error } = await supabase
      .rpc('get_journal_insights', { journal_id_param: journalId });
    return { data, error };
  }
};