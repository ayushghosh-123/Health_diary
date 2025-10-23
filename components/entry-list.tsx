'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Moon, Droplets, Activity, Smile, Meh, Frown } from 'lucide-react';
import { format } from 'date-fns';
import type { HealthEntry } from '@/lib/supabase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface EntryListProps {
  entries: HealthEntry[];
  onEdit: (entry: HealthEntry) => void;
  onDelete: (id: string) => void;
}

const moodIcons = {
  excellent: <Smile className="h-4 w-4 text-green-500" />,
  good: <Smile className="h-4 w-4 text-blue-500" />,
  neutral: <Meh className="h-4 w-4 text-yellow-500" />,
  poor: <Frown className="h-4 w-4 text-orange-500" />,
  terrible: <Frown className="h-4 w-4 text-red-500" />,
};

const moodColors = {
  excellent: 'bg-green-100 text-green-800 border-green-200',
  good: 'bg-blue-100 text-blue-800 border-blue-200',
  neutral: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  poor: 'bg-orange-100 text-orange-800 border-orange-200',
  terrible: 'bg-red-100 text-red-800 border-red-200',
};

export function EntryList({ entries, onEdit, onDelete }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <Card className="mt-8">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-slate-500 text-lg mb-2">No entries yet</p>
          <p className="text-slate-400 text-sm">Start tracking your health journey by creating your first entry</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-xl font-semibold text-slate-800">Recent Entries</h3>
      {entries.map((entry) => (
        <Card key={entry.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg">
                  {format(new Date(entry.entry_date), 'EEEE, MMMM d, yyyy')}
                </CardTitle>
                {entry.mood && (
                  <Badge variant="outline" className={moodColors[entry.mood as keyof typeof moodColors]}>
                    <span className="mr-1">{moodIcons[entry.mood as keyof typeof moodIcons]}</span>
                    {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(entry)}
                  className="hover:bg-blue-50 hover:text-blue-600"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this entry? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(entry.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Moon className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600">Sleep:</span>
                <span className="font-medium">{entry.sleep_hours}h</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Droplets className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600">Water:</span>
                <span className="font-medium">{entry.water_intake} glasses</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600">Exercise:</span>
                <span className="font-medium">{entry.exercise_minutes} min</span>
              </div>
            </div>

            {entry.symptoms && (
              <div className="mb-3">
                <span className="text-sm font-medium text-slate-700">Symptoms: </span>
                <span className="text-sm text-slate-600">{entry.symptoms}</span>
              </div>
            )}

            {entry.notes && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-sm text-slate-700">{entry.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}