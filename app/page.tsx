'use client';

import { useUser } from '@clerk/nextjs';
import { LogIn, UserPlus, Brain, Activity, CheckCircle, Smile, Calendar, TrendingUp, Zap, Clock, Utensils, Moon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { dbHelpers } from '@/lib/supabase';
import type { HealthEntry } from '@/lib/supabase';
import { useToast } from '@/components/hooks/use-toast';
import { MainNavbar } from '@/components/main-navbar';
import { UnifiedDashboard } from '@/components/unified-dashboard';
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
      initializeUser();
    }
  }, [isLoaded, user]);

  const initializeUser = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Create or get user in our database (ignore errors for existing users)
      const userResult = await dbHelpers.createUser({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        full_name: user.fullName || '',
        username: user.username || user.firstName || '',
        avatar_url: user.imageUrl
      });
      
      if (userResult.error) {
        console.log('User creation result:', userResult.error);
        // Continue anyway - user might already exist
      }

      // Load health entries
      await loadEntries();
      
    } catch (err) {
      console.error('Initialize user error:', err);
      toast({
        title: 'Warning',
        description: 'Some features may not work properly. Please refresh the page.',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEntries = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await dbHelpers.getUserHealthEntries(user.id);
      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load your health entries.',
        variant: 'error'
      });
    }
  };

  const Navbar = () => (
    <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Brain className="h-7 w-7 text-rose-600" />
          <span className="font-extrabold text-xl text-slate-800 tracking-tight">MindCare</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 hidden sm:inline">
              Welcome, {user.firstName || user.emailAddresses[0].emailAddress}
            </span>
            <div className="flex items-center gap-2">
              <Link href="/diary">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Diary
                </Button>
              </Link>
              <Link href="/chatbot">
                <Button variant="outline" size="sm">
                  <Brain className="h-4 w-4 mr-2" />
                  AI Chat
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-slate-600 hover:text-rose-600">
                <LogIn className="h-4 w-4 mr-2" /> Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200/50">
                <UserPlus className="h-4 w-4 mr-2" /> Start for Free
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );

  // --- Components for Landing Page ---

  const AwarenessCard = ({ icon, title, desc }: any) => (
    <motion.div
      className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100/80 transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-[1.02] text-center"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ type: "spring", stiffness: 100, damping: 10 }}
    >
      <div className="flex justify-center mb-4">
         <div className="p-3 bg-rose-100 rounded-xl">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
      <p className="text-slate-600 text-base">{desc}</p>
    </motion.div>
  );

  const HowCard = ({ step, icon, title, desc }: any) => (
    <motion.div
      className="bg-white rounded-3xl p-8 shadow-lg border border-rose-100 hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ type: "spring", stiffness: 100, damping: 10 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="text-rose-600 font-extrabold text-3xl">{step}</div>
        <div className="h-8 w-px bg-slate-200"></div>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
      <p className="text-slate-600 text-base">{desc}</p>
    </motion.div>
  );
  
  // NEW Component: Feature Card
  const FeatureCard = ({ icon, title, desc }: any) => (
      <motion.div
        className="flex items-start p-4 bg-white rounded-xl shadow-md border border-slate-100"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
          <div className="p-3 bg-rose-50 rounded-lg mr-4 flex-shrink-0">
              {icon}
          </div>
          <div>
              <h4 className="text-lg font-semibold text-slate-800">{title}</h4>
              <p className="text-sm text-slate-600">{desc}</p>
          </div>
      </motion.div>
  );

  // NEW Component: Testimonial Card
  const TestimonialCard = ({ quote, name, title }: any) => (
    <motion.div 
      className="bg-white p-8 rounded-3xl shadow-xl border border-rose-100 flex flex-col h-full"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ type: "spring", stiffness: 80, damping: 10 }}
    >
      <p className="text-2xl font-serif text-slate-700 italic mb-6 flex-grow">
        "{quote}"
      </p>
      <div className="pt-4 border-t border-slate-100">
        <p className="font-bold text-rose-600">{name}</p>
        <p className="text-sm text-slate-500">{title}</p>
      </div>
    </motion.div>
  );

  // --- Landing Page ---
  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-white via-rose-50 to-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="text-center px-6 pt-24 pb-32 sm:pt-32 sm:pb-48 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-96 w-96 bg-rose-200/20 rounded-full blur-3xl z-0 transform translate-x-1/2 -translate-y-1/4 hidden lg:block"></div>

        <div className="relative z-10">
          <motion.h1
            className="text-4xl sm:text-7xl font-extrabold text-slate-900 mb-6 leading-tight max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            A Smarter Way to Track Your <span className="text-rose-600">Well-being</span>
          </motion.h1>
          <motion.p
            className="text-slate-600 max-w-3xl mx-auto mb-12 text-lg sm:text-xl font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Stress, sleep, or nutrition — Reflect & Connect helps you connect the dots between your daily actions and your long-term health, building a truly balanced life.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto text-base py-7 px-8 bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-300/60 transition-all duration-300">
                Start Tracking Today
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base py-7 px-8 border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50 transition-all duration-300">
                <LogIn className="h-5 w-5 mr-2" /> Existing User?
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* NEW SECTION: Key Features */}
      <section className="py-24 px-6 bg-slate-100/70">
          <div className="container mx-auto">
              <div className="text-center mb-16">
                  <p className="text-sm font-semibold text-rose-600 uppercase tracking-widest mb-2">Detailed Tracking</p>
                  <h2 className="text-4xl font-bold text-slate-800 mb-4">Track What Truly Matters</h2>
                  <p className="text-slate-600 max-w-4xl mx-auto text-lg">
                      Log a wide range of metrics in one place to understand how everything affects your overall well-being.
                  </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  <FeatureCard 
                      icon={<Brain className="text-rose-600 h-6 w-6" />} 
                      title="Mental Health Score" 
                      desc="Daily mood, anxiety level, and general stress rating." 
                  />
                  <FeatureCard 
                      icon={<Moon className="text-rose-600 h-6 w-6" />} 
                      title="Sleep Quality" 
                      desc="Track hours slept, perceived quality, and wakefulness." 
                  />
                  <FeatureCard 
                      icon={<Utensils className="text-rose-600 h-6 w-6" />} 
                      title="Nutrition & Diet" 
                      desc="Log meals, cravings, and track food-related reactions." 
                  />
                  <FeatureCard 
                      icon={<Activity className="text-rose-600 h-6 w-6" />} 
                      title="Physical Activity" 
                      desc="Record workouts, intensity, and duration for better insights." 
                  />
                  <FeatureCard 
                      icon={<Zap className="text-rose-600 h-6 w-6" />} 
                      title="Energy Levels" 
                      desc="Monitor fatigue throughout the day to find peak performance times." 
                  />
                  <FeatureCard 
                      icon={<Clock className="text-rose-600 h-6 w-6" />} 
                      title="Custom Notes" 
                      desc="Add detailed journal entries for context around your data." 
                  />
              </div>
          </div>
      </section>

      {/* Mental Health Awareness Section */}
      <section className="bg-slate-50/70 py-24 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-rose-600 uppercase tracking-widest mb-2">The Foundation</p>
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Why Tracking Your Wellness Works</h2>
            <p className="text-slate-600 max-w-4xl mx-auto text-lg">
              Reflect & Connect moves beyond simple notes. It turns reflection into actionable insight, helping you preempt stress and cultivate lasting well-being.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <AwarenessCard
              icon={<Brain className="text-rose-600 h-6 w-6" />}
              title="Understand Yourself"
              desc="Uncover the hidden correlations between your habits, environment, and emotional state."
            />
            <AwarenessCard
              icon={<Smile className="text-rose-600 h-6 w-6" />}
              title="Increase Resilience"
              desc="Reduce the intensity of stress and anxiety by identifying and mitigating personal triggers."
            />
            <AwarenessCard
              icon={<Activity className="text-rose-600 h-6 w-6" />}
              title="Optimize Energy"
              desc="Track sleep, movement, and nutrition to find the specific routine that maximizes your vitality."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-rose-600 uppercase tracking-widest mb-2">Simple Steps</p>
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Your Journey to Balance in 3 Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            <HowCard
              step="1"
              icon={<Calendar className="text-rose-600 h-6 w-6" />}
              title="Daily Check-In"
              desc="Log your mood, physical symptoms, meals, and thoughts in a simple, guided format."
            />
            <HowCard
              step="2"
              icon={<TrendingUp className="text-rose-600 h-6 w-6" />}
              title="Review Insights"
              desc="Our dashboard visualizes your data, revealing trends and patterns you might have missed."
            />
            <HowCard
              step="3"
              icon={<CheckCircle className="text-rose-600 h-6 w-6" />}
              title="Take Action"
              desc="Use your insights to make informed, positive adjustments to your lifestyle and routine."
            />
          </div>
        </div>
      </section>
      
      {/* NEW SECTION: Testimonials */}
      <section className="py-24 px-6 bg-rose-50/70">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-rose-600 uppercase tracking-widest mb-2">Trusted By Users</p>
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Real Results, Real People</h2>
            <p className="text-slate-600 max-w-4xl mx-auto text-lg">
                See what others are saying about finding clarity and balance with Reflect & Connect.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <TestimonialCard 
              quote="I finally saw the link between my poor sleep and my anxiety levels. This diary is simple, but the insights are game-changing."
              name="Sarah L."
              title="Marketing Manager"
            />
            <TestimonialCard 
              quote="The best self-help tool I've used. Seeing my mood score trending up over a month has been incredibly motivating."
              name="Michael T."
              title="Software Developer"
            />
            <TestimonialCard 
              quote="It helped me track my triggers without feeling overwhelmed. It's a supportive, non-judgmental way to manage stress."
              name="Jessica M."
              title="Student & Freelancer"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-rose-500/10">
        <div className="container mx-auto text-center rounded-2xl p-10 bg-white shadow-2xl max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-4">
            Ready to Find Your Balance?
          </h2>
          <p className="text-slate-600 mb-10 max-w-2xl mx-auto text-lg">
            Start a healthier journey today. It takes less than a minute to sign up and begin your first entry.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-rose-600 hover:bg-rose-700 text-white text-lg py-8 px-12 shadow-xl shadow-rose-300/60 transition-all duration-300">
              Start Your Free Health Diary
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-slate-800 py-8 border-t text-center text-slate-400 text-sm">
        <p className="mb-2">
           A modern tool for mental and physical well-being.
        </p>
        © {new Date().getFullYear()} Reflect & Connect. All rights reserved.
      </footer>
    </div>
  );

  // Authenticated Dashboard
  const Dashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <MainNavbar currentPath="/" entriesCount={entries.length} />
      {loading ? (
        <main className="container mx-auto px-4 py-8">
          <LoadingSkeleton />
        </main>
      ) : (
        <main className="container mx-auto px-4 py-8">
          <UnifiedDashboard userId={user?.id || ''} />
        </main>
      )}
    </div>
  );

  if (!isLoaded) return null;
  return user ? <Dashboard /> : <LandingPage />;
}