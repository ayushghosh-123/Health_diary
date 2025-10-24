'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  BookOpen, 
  MessageSquare, 
  BarChart3, 
  User, 
  Plus,
  Menu,
  X,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AppNavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  entriesCount: number;
  className?: string;
}

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    description: 'Overview and quick stats',
    href: '/'
  },
  {
    id: 'diary',
    label: 'Diary',
    icon: BookOpen,
    description: 'Write and manage entries',
    href: '/diary'
  },
  {
    id: 'chatbot',
    label: 'AI Assistant',
    icon: MessageSquare,
    description: 'Get health insights',
    href: '/chatbot'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Detailed health data',
    href: '/analytics'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    description: 'Personal information',
    href: '/profile'
  }
];

export function AppNavigation({ 
  currentView, 
  onViewChange, 
  entriesCount,
  className 
}: AppNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white/90 backdrop-blur-sm"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-30 transform transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 lg:static lg:block",
        className
      )}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-rose-100 rounded-lg">
              <Heart className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Reflect & Connect</h2>
              <p className="text-sm text-slate-600">Your wellness companion</p>
            </div>
          </div>

          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 w-full p-4 rounded-lg transition-colors",
                    isActive 
                      ? "bg-rose-600 text-white" 
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                  onClick={() => {
                    onViewChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className={cn(
                      "text-xs",
                      isActive ? "text-rose-100" : "text-slate-500"
                    )}>
                      {item.description}
                    </div>
                  </div>
                  {item.id === 'diary' && entriesCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {entriesCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Add Button */}
          <div className="mt-8">
            <Link
              href="/diary"
              className="flex items-center justify-center w-full p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
              onClick={() => {
                onViewChange('diary');
                setIsMobileMenuOpen(false);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Link>
          </div>

          {/* Stats Summary */}
          <Card className="mt-8">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{entriesCount}</div>
                <div className="text-sm text-slate-600">Total Entries</div>
                <div className="text-xs text-slate-500 mt-1">
                  Keep up the great work!
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
