'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { HealthChatbot } from '@/components/health-chatbot';
import { dbHelpers, type HealthEntry } from '@/lib/supabase';
import { useToast } from '@/components/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ChatbotPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [entries, setEntries] = useState<HealthEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      loadEntries();
    }
  }, [isLoaded, user]);

  const loadEntries = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await dbHelpers.getUserHealthEntries(user.id);
      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load health entries.',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">AI Health Assistant</h1>
                <p className="text-slate-600">Get personalized health insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading your health data...</p>
              </div>
            </div>
          ) : (
            <HealthChatbot entries={entries} />
          )}
        </div>
      </div>
    </div>
  );
}
