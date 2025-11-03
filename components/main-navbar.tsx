'use client';

import { useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  LogIn, 
  UserPlus, 
  Home, 
  BookOpen, 
  MessageSquare, 
  BarChart3, 
  User, 
  Menu, 
  X,
  Plus,
  Activity,
  Brain,
  Calendar,
  Settings,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MainNavbarProps {
  currentPath?: string;
  entriesCount?: number;
  className?: string;
}

export function MainNavbar({ currentPath = '/', entriesCount = 0, className }: MainNavbarProps) {
  const { user, isLoaded } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      href: '/',
      icon: Home,
      description: 'Dashboard & Overview'
    },
    {
      id: 'diary',
      label: 'Diary',
      href: '/diary',
      icon: BookOpen,
      description: 'Write & Manage Journals',
      badge: entriesCount > 0 ? entriesCount : undefined
    },
    {
      id: 'chatbot',
      label: 'AI Assistant',
      href: '/chatbot',
      icon: MessageSquare,
      description: 'Health Insights'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      description: 'Health Data & Trends'
    },
    {
      id: 'profile',
      label: 'Profile',
      href: '/profile',
      icon: User,
      description: 'Personal Information'
    }
  ];

  const quickActions = [
    {
      label: 'New Entry',
      href: '/diary',
      icon: Plus,
      color: 'bg-rose-600 hover:bg-rose-700'
    },
    {
      label: 'Health Check',
      href: '/analytics',
      icon: Activity,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      label: 'AI Chat',
      href: '/chatbot',
      icon: Brain,
      color: 'bg-green-600 hover:bg-green-700'
    }
  ];

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Navbar */}
      <nav className={cn(
        "bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-sm",
        className
      )}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <Link href="/" className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-lg">
                <Brain className="h-6 w-6 text-rose-600" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-slate-800">MindCare</h1>
                <p className="text-xs text-slate-600">Health Journal</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.href;
                
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative",
                      isActive 
                        ? "bg-rose-100 text-rose-700" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Quick Actions - Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={action.href}>
                    <Button
                      size="sm"
                      className={cn("text-white", action.color)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {action.label}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* User Section */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-slate-800">
                      {user.firstName || user.emailAddresses[0]?.emailAddress}
                    </p>
                    <p className="text-xs text-slate-500">Welcome back</p>
                  </div>
                  <UserButton afterSignOutUrl="/" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/sign-in">
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-rose-600">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={cn(
          "lg:hidden border-t border-slate-200 bg-white",
          isMobileMenuOpen ? "block" : "hidden"
        )}>
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Navigation Items */}
            <div className="space-y-2 mb-6">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.href;
                
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors",
                      isActive 
                        ? "bg-rose-50 text-rose-700 border border-rose-200" 
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-slate-500">{item.description}</div>
                    </div>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Quick Actions */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-600 mb-3">Quick Actions</h3>
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5 text-slate-600" />
                    <span className="font-medium text-slate-800">{action.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Stats */}
            {user && (
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">Your Progress</p>
                    <p className="text-xs text-slate-600">Keep up the great work!</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-rose-600">{entriesCount}</div>
                    <div className="text-xs text-slate-500">Entries</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
