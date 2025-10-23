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
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { ConfigCheck } from '@/components/config-check';
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
    if (isLoaded && user) {
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

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading entries:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: 'Error',
        description: `Failed to load entries: ${errorMessage}`,
        variant: 'error'
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

        if (error) {
          console.error('Supabase update error:', error);
          throw new Error(`Update failed: ${error.message}`);
        }
        toast({ 
          title: 'Updated', 
          description: 'Entry updated successfully.',
          variant: 'success'
        });
      } else {
        const { error } = await supabase
          .from('health_entries')
          .insert([{ ...entry, user_id: user.id }]);

        if (error) {
          console.error('Supabase insert error:', error);
          throw new Error(`Insert failed: ${error.message}`);
        }
        toast({ 
          title: 'Created', 
          description: 'New entry added successfully.',
          variant: 'success'
        });
      }

      await loadEntries();
      setIsDialogOpen(false);
      setSelectedEntry(null);
    } catch (error) {
      console.error('Error saving entry:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: 'Error',
        description: `Failed to save entry: ${errorMessage}`,
        variant: 'error'
      });
    }
  };

  // --- Delete Entry ---
  const handleDeleteEntry = async (id: string) => {
    try {
      const { error } = await supabase.from('health_entries').delete().eq('id', id);
      if (error) {
        console.error('Supabase delete error:', error);
        throw new Error(`Delete failed: ${error.message}`);
      }
      toast({ 
        title: 'Deleted', 
        description: 'Entry deleted successfully.',
        variant: 'success'
      });
      await loadEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: 'Error',
        description: `Failed to delete entry: ${errorMessage}`,
        variant: 'error'
      });
    }
  };

  // --- Edit Entry ---
  const handleEditEntry = (entry: HealthEntry) => {
    setSelectedEntry(entry);
    setIsDialogOpen(true);
  };

  // --- Loading or user not ready ---
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  // --- Redirect to sign-in if not authenticated ---
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Heart className="h-16 w-16 text-rose-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome to Health Diary</h1>
          <p className="text-slate-600 mb-6">Please sign in to track your wellness journey</p>
          <Button 
            onClick={() => window.location.href = '/sign-in'}
            className="bg-rose-500 hover:bg-rose-600"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-rose-500" />
              <h1 className="text-2xl font-bold text-slate-800">Health Diary</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <LoadingSkeleton />
        </main>
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
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
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
            className="bg-rose-500 hover:bg-rose-600 w-full sm:w-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Entry
          </Button>
        </div>

        <ConfigCheck />

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
