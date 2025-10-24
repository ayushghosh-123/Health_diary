'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Moon, 
  Droplets, 
  Brain, 
  Heart,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Target
} from 'lucide-react';
import type { HealthEntry } from '@/lib/supabase';

interface AdvancedStatsProps {
  entries: HealthEntry[];
}

export function AdvancedStats({ entries }: AdvancedStatsProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-slate-400 mb-4" />
          <p className="text-slate-500 text-lg mb-2">No data to analyze yet</p>
          <p className="text-slate-400 text-sm">Start tracking your health to see insights</p>
        </CardContent>
      </Card>
    );
  }

  const last30Days = entries.slice(0, 30);
  const last7Days = entries.slice(0, 7);

  // Calculate trends
  const calculateTrend = (values: number[]) => {
    if (values.length < 2) return 0;
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    return ((secondAvg - firstAvg) / firstAvg) * 100;
  };

  // Mood analysis
  const moodValues = { excellent: 5, good: 4, neutral: 3, poor: 2, terrible: 1 };
  const moodScores = last30Days.map(entry => moodValues[entry.mood as keyof typeof moodValues] || 3);
  const moodTrend = calculateTrend(moodScores);
  const avgMood = moodScores.reduce((a, b) => a + b, 0) / moodScores.length;

  // Sleep analysis
  const sleepHours = last30Days.map(entry => entry.sleep_hours);
  const sleepTrend = calculateTrend(sleepHours);
  const avgSleep = sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length;

  // Exercise analysis
  const exerciseMinutes = last30Days.map(entry => entry.exercise_minutes);
  const exerciseTrend = calculateTrend(exerciseMinutes);
  const totalExercise = exerciseMinutes.reduce((a, b) => a + b, 0);

  // Water intake analysis
  const waterIntake = last30Days.map(entry => entry.water_intake);
  const waterTrend = calculateTrend(waterIntake);
  const avgWater = waterIntake.reduce((a, b) => a + b, 0) / waterIntake.length;

  // Health score calculation
  const healthScore = Math.round(
    (avgMood / 5) * 30 + 
    (Math.min(avgSleep / 8, 1)) * 25 + 
    (Math.min(totalExercise / 1500, 1)) * 25 + 
    (Math.min(avgWater / 8, 1)) * 20
  );

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < -5) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-slate-500" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 5) return 'text-green-600';
    if (trend < -5) return 'text-red-600';
    return 'text-slate-600';
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6">
      {/* Health Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-600" />
            Overall Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`text-4xl font-bold ${getHealthScoreColor(healthScore).split(' ')[0]}`}>
                {healthScore}
              </div>
              <div>
                <div className={`text-lg font-semibold ${getHealthScoreColor(healthScore).split(' ')[0]}`}>
                  {getHealthScoreLabel(healthScore)}
                </div>
                <div className="text-sm text-slate-600">
                  Based on mood, sleep, exercise, and nutrition
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-800">{entries.length}</div>
              <div className="text-sm text-slate-600">Total Entries</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mood Analysis */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Mood Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-slate-800">
                {avgMood.toFixed(1)}
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(moodTrend)}
                <span className={`text-sm ${getTrendColor(moodTrend)}`}>
                  {moodTrend > 0 ? '+' : ''}{moodTrend.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Average over {last30Days.length} days
            </div>
          </CardContent>
        </Card>

        {/* Sleep Analysis */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Sleep Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-slate-800">
                {avgSleep.toFixed(1)}h
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(sleepTrend)}
                <span className={`text-sm ${getTrendColor(sleepTrend)}`}>
                  {sleepTrend > 0 ? '+' : ''}{sleepTrend.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              {avgSleep >= 7 ? 'Good sleep duration' : 'Consider more sleep'}
            </div>
          </CardContent>
        </Card>

        {/* Exercise Analysis */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-slate-800">
                {Math.round(totalExercise / 30)}m
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(exerciseTrend)}
                <span className={`text-sm ${getTrendColor(exerciseTrend)}`}>
                  {exerciseTrend > 0 ? '+' : ''}{exerciseTrend.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Daily average
            </div>
          </CardContent>
        </Card>

        {/* Water Intake Analysis */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              Hydration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-slate-800">
                {avgWater.toFixed(1)}
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(waterTrend)}
                <span className={`text-sm ${getTrendColor(waterTrend)}`}>
                  {waterTrend > 0 ? '+' : ''}{waterTrend.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Glasses per day
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-rose-600" />
            This Week's Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-800 mb-1">
                {last7Days.length}
              </div>
              <div className="text-sm text-slate-600">Days Tracked</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-800 mb-1">
                {last7Days.reduce((sum, entry) => sum + entry.exercise_minutes, 0)}
              </div>
              <div className="text-sm text-slate-600">Total Exercise (min)</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-800 mb-1">
                {last7Days.reduce((sum, entry) => sum + entry.water_intake, 0)}
              </div>
              <div className="text-sm text-slate-600">Total Water (glasses)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-rose-600" />
            Personalized Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {moodTrend > 10 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-green-800">Great mood improvement!</div>
                  <div className="text-sm text-green-700">Your mood has been trending upward. Keep up the great work!</div>
                </div>
              </div>
            )}
            
            {avgSleep < 6 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <Moon className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-800">Sleep needs attention</div>
                  <div className="text-sm text-yellow-700">Consider improving your sleep routine for better health.</div>
                </div>
              </div>
            )}
            
            {totalExercise < 150 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-800">More activity recommended</div>
                  <div className="text-sm text-blue-700">Try to increase your daily physical activity for better health.</div>
                </div>
              </div>
            )}
            
            {avgWater < 6 && (
              <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-lg">
                <Droplets className="h-5 w-5 text-cyan-600 mt-0.5" />
                <div>
                  <div className="font-medium text-cyan-800">Stay hydrated</div>
                  <div className="text-sm text-cyan-700">Aim for 8 glasses of water daily for optimal health.</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
