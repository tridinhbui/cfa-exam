'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  BarChart3,
  Calendar,
  FileText,
  GraduationCap,
  Settings,
  HelpCircle,
  TrendingUp,
  Target,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const mainNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/quiz', label: 'Practice Quiz', icon: BookOpen },
  { href: '/item-sets', label: 'Item Sets', icon: FileText },
  { href: '/essays', label: 'Essay Practice', icon: GraduationCap },
  { href: '/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/study-plan', label: 'Study Plan', icon: Calendar },
];

const bottomNavItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help & Support', icon: HelpCircle },
];

import { useAuth } from '@/context/auth-context';
import { useState, useEffect } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    currentStreak: 0,
    questionsToday: 0,
    correctToday: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/user/stats?userId=${user.uid}`);
        const data = await res.json();
        if (!data.error) {
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch sidebar stats:', err);
      }
    };
    fetchStats();
  }, [user]);

  const dailyGoal = 30;
  const progressValue = Math.min((stats.questionsToday / dailyGoal) * 100, 100);

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 border-r border-border bg-background hidden lg:block overflow-y-auto">
      <div className="flex flex-col h-full p-4">
        {/* Daily Progress */}
        <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Daily Progress</span>
            <span className="text-sm text-primary">{stats.questionsToday}/{dailyGoal}</span>
          </div>
          <Progress value={progressValue} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {Math.max(0, dailyGoal - stats.questionsToday)} questions remaining today
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-2 text-emerald-500 mb-1">
              <Target className="h-4 w-4" />
              <span className="text-xs">Accuracy</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {stats.questionsToday > 0
                ? `${Math.round((stats.correctToday / stats.questionsToday) * 100)}%`
                : '0%'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Streak</span>
            </div>
            <p className="text-lg font-bold text-foreground">{stats.currentStreak} days</p>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Exam Countdown */}
        <div className="my-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-600">Exam Countdown</span>
          </div>
          <p className="text-2xl font-bold text-foreground">87 days</p>
          <p className="text-xs text-muted-foreground mt-1">February 2025 Exam</p>
        </div>

        {/* Bottom Navigation */}
        <div className="pt-4 border-t border-border space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                  whileHover={{ x: 4 }}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}


