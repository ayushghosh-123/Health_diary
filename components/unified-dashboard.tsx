'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  BookOpen, 
  MessageSquare, 
  BarChart3, 
  User, 
  Plus,
  Activity,
  Brain,
  Calendar,
  TrendingUp,
  Clock,
  Target,
  Award,
  Zap,
  Moon,
  Droplets,
  Brain as BrainIcon
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { dbHelpers, type HealthEntry, type Journal, type JournalEntry } from '@/lib/supabase';
import { useToast } from '@/components/hooks/use-toast';

interface UnifiedDashboardProps {
  userId: string;
  className?: string;
}

export function UnifiedDashboard({ userId, className }: UnifiedDashboardProps) {
  const [healthEntries, setHealthEntries] = useState<HealthEntry[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHealthEntries: 0,
    totalJournals: 0,
    totalJournalEntries: 0,
    streakDays: 0,
    avgMood: 0,
    avgSleep: 0,
    totalExercise: 0,
    healthScore: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadAllData();
  }, [userId]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel with error handling
      const [healthData, journalsData, userStats] = await Promise.all([
        dbHelpers.getUserHealthEntries(userId).catch(err => ({ data: [], error: err })),
        dbHelpers.getUserJournals(userId).catch(err => ({ data: [], error: err })),
        dbHelpers.getUserStats(userId).catch(err => ({ data: [], error: err }))
      ]);

      // Log errors but continue with empty data
      if (healthData.error) console.warn('Health entries error:', healthData.error);
      if (journalsData.error) console.warn('Journals error:', journalsData.error);
      if (userStats.error) console.warn('User stats error:', userStats.error);

      setHealthEntries(healthData.data || []);
      setJournals(journalsData.data || []);

      // Load recent journal entries from all journals
      const allEntries = [];
      for (const journal of journalsData.data || []) {
        const { data: entries } = await dbHelpers.getJournalEntries(journal.id);
        if (entries) {
          allEntries.push(...entries.slice(0, 3)); // Get 3 most recent from each journal
        }
      }
      setRecentEntries(allEntries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5));

      // Calculate stats with proper error handling
      const healthEntries = healthData.data || [];
      const totalHealthEntries = healthEntries.length;
      const totalJournals = journalsData.data?.length || 0;
      const totalJournalEntries = allEntries.length;
      
      // Calculate streak (simplified)
      const streakDays = Math.min(totalHealthEntries, 30);
      
      // Calculate average mood with fallback
      const moodValues = { excellent: 5, good: 4, neutral: 3, poor: 2, terrible: 1 };
      const avgMood = healthEntries.length > 0 
        ? healthEntries.reduce((sum, entry) => sum + (moodValues[entry.mood as keyof typeof moodValues] || 3), 0) / healthEntries.length
        : 3;
      
      // Calculate average sleep with fallback
      const avgSleep = healthEntries.length > 0
        ? healthEntries.reduce((sum, entry) => sum + (entry.sleep_hours || 0), 0) / healthEntries.length
        : 0;
      
      // Calculate total exercise with fallback
      const totalExercise = healthEntries.reduce((sum, entry) => sum + (entry.exercise_minutes || 0), 0);
      
      // Calculate health score with proper fallbacks
      const avgWater = healthEntries.length > 0
        ? healthEntries.reduce((sum, entry) => sum + (entry.water_intake || 0), 0) / healthEntries.length
        : 0;
      
      const healthScore = Math.round(
        (avgMood / 5) * 30 + 
        (Math.min(avgSleep / 8, 1)) * 25 + 
        (Math.min(totalExercise / 1500, 1)) * 25 + 
        (Math.min(avgWater / 8, 1)) * 20
      );

      setStats({
        totalHealthEntries,
        totalJournals,
        totalJournalEntries,
        streakDays,
        avgMood,
        avgSleep,
        totalExercise,
        healthScore
      });

    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data.',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getMoodColor = (mood: string) => {
    const colors = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      neutral: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-orange-100 text-orange-800',
      terrible: 'bg-red-100 text-red-800'
    };
    return colors[mood as keyof typeof colors] || colors.neutral;
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-8 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to Your Health Journey</h2>
              <p className="text-slate-600">Track your wellness, reflect on your experiences, and connect with insights.</p>
            </div>
            <div className="hidden md:block">
              <div className={cn("text-4xl font-bold p-4 rounded-full", getHealthScoreColor(stats.healthScore))}>
                {stats.healthScore}
              </div>
              <p className="text-center text-sm text-slate-600 mt-1">Health Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Health Entries</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats.totalHealthEntries}</div>
            <p className="text-xs text-slate-500">Total tracked days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Journals</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats.totalJournals}</div>
            <p className="text-xs text-slate-500">Active journals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Journal Entries</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats.totalJournalEntries}</div>
            <p className="text-xs text-slate-500">Written entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Streak</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats.streakDays}</div>
            <p className="text-xs text-slate-500">Days in a row</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-rose-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/diary">
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-rose-200 hover:border-rose-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-100 rounded-lg">
                      <Plus className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">New Entry</h3>
                      <p className="text-sm text-slate-600">Write in your journal</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/chatbot">
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-blue-200 hover:border-blue-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Brain className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">AI Chat</h3>
                      <p className="text-sm text-slate-600">Get health insights</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/analytics">
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-green-200 hover:border-green-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Analytics</h3>
                      <p className="text-sm text-slate-600">View your trends</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Health Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Recent Health Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {healthEntries.length === 0 ? (
              <div className="text-center py-6">
                <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">No health entries yet</p>
                <p className="text-sm text-slate-400">Start tracking your health</p>
              </div>
            ) : (
              <div className="space-y-3">
                {healthEntries.slice(0, 3).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {new Date(entry.entry_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          {entry.sleep_hours}h sleep • {entry.exercise_minutes}m exercise
                        </p>
                      </div>
                    </div>
                    {entry.mood && (
                      <Badge className={getMoodColor(entry.mood)}>
                        {entry.mood}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Journal Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              Recent Journal Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentEntries.length === 0 ? (
              <div className="text-center py-6">
                <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">No journal entries yet</p>
                <p className="text-sm text-slate-400">Start writing your thoughts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEntries.slice(0, 3).map((entry) => (
                  <div key={entry.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-800">
                        {entry.title || 'Untitled Entry'}
                      </h4>
                      <span className="text-xs text-slate-500">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {entry.content.replace(/<[^>]*>/g, '')}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{entry.word_count} words</span>
                        <span>•</span>
                        <span>{entry.reading_time} min read</span>
                      </div>
                      {entry.mood && (
                        <Badge className={getMoodColor(entry.mood)}>
                          {entry.mood}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Health Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-rose-600" />
            Health Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <Moon className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">{isNaN(stats.avgSleep) ? '0.0' : stats.avgSleep.toFixed(1)}h</div>
              <div className="text-sm text-slate-600">Avg Sleep</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">{isNaN(stats.totalExercise) ? '0' : stats.totalExercise}m</div>
              <div className="text-sm text-slate-600">Total Exercise</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <BrainIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-slate-800">{isNaN(stats.avgMood) ? '3.0' : stats.avgMood.toFixed(1)}</div>
              <div className="text-sm text-slate-600">Avg Mood</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
