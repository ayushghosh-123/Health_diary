'use client';

import { useUser, UserButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { HealthEntry } from '@/lib/supabase';
import { EntryDialog } from '@/components/entry-dialog';
import { EntryList } from '@/components/entry-list';
import { StatsOverview } from '@/components/stats-overview';
import { useToast } from '@/components/hooks/use-toast';

export default function Home() {
  const { user, isLoaded } = useUser();
  const [entries, setEntries] = useState<HealthEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<HealthEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

// Load entries after user is loaded
  useEffect(() => {
    if (!isLoaded && !user) {
      loadEntries();
    }
  }, [isLoaded, user]);

  // --- Load all entries for the current user ---
  const loadEntries = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('health_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading entries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load entries.'
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Save or Update Entry ---
  const handleSaveEntry = async (entry: Partial<HealthEntry>) => {
    if (!user?.id) return;

    try {
      if (selectedEntry) {
        const { error } = await supabase
          .from('health_entries')
          .update({ ...entry, updated_at: new Date().toISOString() })
          .eq('id', selectedEntry.id);

        if (error) throw error;
        toast({ title: 'Updated', description: 'Entry updated successfully.' });
      } else {
        const { error } = await supabase
          .from('health_entries')
          .insert([{ ...entry, user_id: user.id }]);

        if (error) throw error;
        toast({ title: 'Created', description: 'New entry added successfully.' });
      }

      await loadEntries();
      setIsDialogOpen(false);
      setSelectedEntry(null);
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to save entry.'
      });
    }
  };

  // --- Delete Entry ---
  const handleDeleteEntry = async (id: string) => {
    try {
      const { error } = await supabase.from('health_entries').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Entry deleted successfully.' });
      await loadEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete entry.'
      });
    }
  };

  // --- Edit Entry ---
  const handleEditEntry = (entry: HealthEntry) => {
    setSelectedEntry(entry);
    setIsDialogOpen(true);
  };

  // --- Loading or user not ready ---
  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  const displayName =
    user?.firstName ??
    user?.emailAddresses?.[0]?.emailAddress ??
    'Anonymous User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500" />
            <h1 className="text-2xl font-bold text-slate-800">Health Diary</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{displayName}</span>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              Your Health Journey
            </h2>
            <p className="text-slate-600 mt-1">
              Track your daily wellness and progress
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedEntry(null);
              setIsDialogOpen(true);
            }}
            size="lg"
            className="bg-rose-500 hover:bg-rose-600"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Entry
          </Button>
        </div>

        <StatsOverview entries={entries} />

        <EntryList entries={entries} onEdit={handleEditEntry} onDelete={handleDeleteEntry} />
      </main>

      <EntryDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedEntry(null);
        }}
        entry={selectedEntry}
        onSave={handleSaveEntry}
      />
      
    </div>
  );
}
