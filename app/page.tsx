'use client';

import { useUser, UserButton } from '@clerk/nextjs';
import { Heart, LogIn, UserPlus, Brain, Activity, CheckCircle, Smile, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { HealthEntry } from '@/lib/supabase';
import { useToast } from '@/components/hooks/use-toast';
import { StatsOverview } from '@/components/stats-overview';
import { EntryList } from '@/components/entry-list';
import { EntryDialog } from '@/components/entry-dialog';
import { ConfigCheck } from '@/components/config-check';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { motion } from 'framer-motion';

export default function Home() {
  const { user, isLoaded } = useUser();
  const [entries, setEntries] = useState<HealthEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<HealthEntry | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isLoaded && user) {
      loadEntries();
    }
  }, [isLoaded, user]);

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
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load your health entries.',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const Navbar = () => (
    <nav className="border-b bg-white/70 backdrop-blur-md sticky top-0 z-20">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-rose-500" />
          <span className="font-bold text-xl text-slate-800">Health Diary</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {user.firstName || user.emailAddresses[0].emailAddress}
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="outline">
                <LogIn className="h-4 w-4 mr-1" /> Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-rose-500 hover:bg-rose-600 text-white">
                <UserPlus className="h-4 w-4 mr-1" /> Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );

  // --- Landing Page ---
  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-slate-100">
      <Navbar />

      {/* Hero Section */}
      <section className="text-center px-6 py-20 sm:py-28">
        <motion.h1
          className="text-4xl sm:text-6xl font-bold text-slate-800 mb-6 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Take control of your <span className="text-rose-600">mental & physical health</span>
        </motion.h1>
        <motion.p
          className="text-slate-600 max-w-2xl mx-auto mb-10 text-lg sm:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Stress, anxiety, or burnout — they can quietly shape your life. 
          Health Diary helps you stay aware, reflect daily, and build a balanced lifestyle.
        </motion.p>

        <motion.div
          className="flex justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/sign-up">
            <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-white">
              Start Your Journey
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Mental Health Awareness Section */}
      <section className="bg-white py-20 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">Why Mental Health Matters</h2>
          <p className="text-slate-600 max-w-3xl mx-auto mb-10">
            Your mind affects everything — focus, relationships, sleep, and even your immune system.
            Ignoring mental well-being can lead to stress, fatigue, and poor health choices.
            Tracking how you feel every day helps you understand patterns and regain balance.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <AwarenessCard
              icon={<Brain className="text-rose-500 h-10 w-10 mb-4" />}
              title="Understand Yourself"
              desc="Reflect on your emotions and behaviors to uncover what truly drives your moods."
            />
            <AwarenessCard
              icon={<Smile className="text-rose-500 h-10 w-10 mb-4" />}
              title="Reduce Stress"
              desc="Daily journaling can lower anxiety and help you develop a more mindful routine."
            />
            <AwarenessCard
              icon={<Activity className="text-rose-500 h-10 w-10 mb-4" />}
              title="Improve Energy"
              desc="When you track sleep, movement, and nutrition — you see what actually makes you feel better."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-slate-50 to-rose-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-10">How Health Diary Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            <HowCard
              step="1"
              icon={<Calendar className="text-rose-500 h-10 w-10 mb-3" />}
              title="Log Your Day"
              desc="Record your mood, habits, meals, or thoughts in just a few taps."
            />
            <HowCard
              step="2"
              icon={<TrendingUp className="text-rose-500 h-10 w-10 mb-3" />}
              title="Track Progress"
              desc="See patterns in your wellness with beautiful charts and daily stats."
            />
            <HowCard
              step="3"
              icon={<CheckCircle className="text-rose-500 h-10 w-10 mb-3" />}
              title="Find Balance"
              desc="Identify triggers and make meaningful lifestyle changes for long-term health."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-6">
          Start improving your health today
        </h2>
        <p className="text-slate-600 mb-8 max-w-lg mx-auto">
          Every big change begins with a small step. Join Health Diary and start tracking what truly matters.
        </p>
        <Link href="/sign-up">
          <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-white">
            Join for Free
          </Button>
        </Link>
      </section>

      <footer className="bg-white py-6 border-t text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} Health Diary. All rights reserved.
      </footer>
    </div>
  );

  const AwarenessCard = ({ icon, title, desc }: any) => (
    <div className="bg-slate-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition text-center">
      {icon}
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm">{desc}</p>
    </div>
  );

  const HowCard = ({ step, icon, title, desc }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition">
      <div className="text-rose-500 font-bold text-2xl mb-2">{step}</div>
      {icon}
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm">{desc}</p>
    </div>
  );

  // Authenticated Dashboard (unchanged)
  const Dashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />
      {loading ? (
        <main className="container mx-auto px-4 py-8">
          <LoadingSkeleton />
        </main>
      ) : (
        <main className="container mx-auto px-4 py-8">
          <ConfigCheck />
          <StatsOverview entries={entries} />
          <EntryList entries={entries} onEdit={setSelectedEntry} onDelete={() => {}} />
        </main>
      )}
    </div>
  );

  if (!isLoaded) return null;
  return user ? <Dashboard /> : <LandingPage />;
}
