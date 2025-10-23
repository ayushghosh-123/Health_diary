'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Droplets, Activity, TrendingUp } from 'lucide-react';
import type { HealthEntry } from '@/lib/supabase';

interface StatsOverviewProps {
  entries: HealthEntry[];
}

export function StatsOverview({ entries }: StatsOverviewProps) {
  if (entries.length === 0) return null;

  const last7Days = entries.slice(0, 7);

  const avgSleep = last7Days.length > 0
    ? (last7Days.reduce((sum, e) => sum + Number(e.sleep_hours), 0) / last7Days.length).toFixed(1)
    : '0';

  const avgWater = last7Days.length > 0
    ? (last7Days.reduce((sum, e) => sum + Number(e.water_intake), 0) / last7Days.length).toFixed(1)
    : '0';

  const avgExercise = last7Days.length > 0
    ? Math.round(last7Days.reduce((sum, e) => sum + Number(e.exercise_minutes), 0) / last7Days.length)
    : 0;

  const totalEntries = entries.length;

  const stats = [
    {
      title: 'Avg Sleep',
      value: `${avgSleep}h`,
      icon: Moon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Avg Water',
      value: `${avgWater} glasses`,
      icon: Droplets,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    {
      title: 'Avg Exercise',
      value: `${avgExercise} min`,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Entries',
      value: totalEntries,
      icon: TrendingUp,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-slate-800">{stat.value}</div>
              <p className="text-xs text-slate-500 mt-1">Last 7 days average</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
