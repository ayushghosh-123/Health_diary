'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { HealthEntry } from '@/lib/supabase';

interface EntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: HealthEntry | null;
  onSave: (entry: Partial<HealthEntry>) => void;
}

export function EntryDialog({ open, onOpenChange, entry, onSave }: EntryDialogProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [mood, setMood] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [waterIntake, setWaterIntake] = useState('');
  const [exerciseMinutes, setExerciseMinutes] = useState('');

  useEffect(() => {
    if (entry) {
      setDate(new Date(entry.entry_date));
      setMood(entry.mood);
      setSymptoms(entry.symptoms);
      setNotes(entry.notes);
      setSleepHours(entry.sleep_hours.toString());
      setWaterIntake(entry.water_intake.toString());
      setExerciseMinutes(entry.exercise_minutes.toString());
    } else {
      resetForm();
    }
  }, [entry, open]);

  const resetForm = () => {
    setDate(new Date());
    setMood('');
    setSymptoms('');
    setNotes('');
    setSleepHours('');
    setWaterIntake('');
    setExerciseMinutes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!mood) {
      alert('Please select a mood');
      return;
    }
    
    if (parseFloat(sleepHours) < 0 || parseFloat(sleepHours) > 24) {
      alert('Sleep hours must be between 0 and 24');
      return;
    }
    
    if (parseFloat(waterIntake) < 0) {
      alert('Water intake cannot be negative');
      return;
    }
    
    if (parseFloat(exerciseMinutes) < 0) {
      alert('Exercise minutes cannot be negative');
      return;
    }
    
    onSave({
      entry_date: format(date, 'yyyy-MM-dd'),
      mood,
      symptoms: symptoms.trim(),
      notes: notes.trim(),
      sleep_hours: parseFloat(sleepHours) || 0,
      water_intake: parseFloat(waterIntake) || 0,
      exercise_minutes: parseFloat(exerciseMinutes) || 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry ? 'Edit Entry' : 'New Health Entry'}</DialogTitle>
          <DialogDescription>
            {entry ? 'Update your health entry' : 'Record your daily health information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mood">Mood</Label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger>
                <SelectValue placeholder="Select your mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
                <SelectItem value="terrible">Terrible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sleep">Sleep (hours)</Label>
              <Input
                id="sleep"
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                placeholder="8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="water">Water (glasses)</Label>
              <Input
                id="water"
                type="number"
                step="0.5"
                min="0"
                value={waterIntake}
                onChange={(e) => setWaterIntake(e.target.value)}
                placeholder="8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exercise">Exercise (minutes)</Label>
              <Input
                id="exercise"
                type="number"
                min="0"
                value={exerciseMinutes}
                onChange={(e) => setExerciseMinutes(e.target.value)}
                placeholder="30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptoms</Label>
            <Input
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., Headache, fatigue"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about your day..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-rose-500 hover:bg-rose-600">
              {entry ? 'Update' : 'Save'} Entry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
