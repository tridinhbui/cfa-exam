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
  MessageSquare,
  HelpCircle,
  TrendingUp,
  Target,
  Clock,
  Coins,
  Library,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useExamStore } from '@/store/exam-store';
import { FeedbackModal } from '@/components/feedback-modal';
import { useAuthenticatedSWR } from '@/hooks/use-authenticated-swr';
import { useUiStore } from '@/store/ui-store';

const mainNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3, id: 'tour-dashboard' },
  { href: '/lessons', label: 'Lessons', icon: Library, id: 'tour-lessons' },
  { href: '/mistakes', label: 'Mistakes Bank', icon: Target, id: 'tour-mistakes' },
  { href: '/quiz', label: 'Practice Quiz', icon: BookOpen, id: 'tour-quiz' },
  { href: '/item-sets', label: 'Item Sets', icon: FileText, id: 'tour-item-sets' },
  { href: '/analytics', label: 'Analytics', icon: TrendingUp, id: 'tour-analytics' },
  { href: '/study-plan', label: 'Study Plan', icon: Calendar, id: 'tour-study-plan' },
];

const bottomNavItems = [
  { id: 'btn-feedback', label: 'Feedback', icon: MessageSquare, href: '#' },
  { id: 'btn-support', label: 'Help & Support', icon: HelpCircle, href: '#' },
];

import { useAuth } from '@/context/auth-context';
import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/user-store';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { date: examDate, label: examLabel, daysRemaining } = useExamStore();
  const daysLeft = daysRemaining();

  const localDate = new Date().toLocaleDateString('en-CA');
  const { data: statsData } = useAuthenticatedSWR<any>(
    user ? `/api/user/stats?userId=${user.uid}&date=${localDate}` : null
  );

  const stats = statsData || {
    currentStreak: 0,
    questionsToday: 0,
    correctToday: 0,
    coins: 0,
  };

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const setSupportModalOpen = useUiStore((state) => state.setSupportModalOpen);
  const dbUser = useUserStore((state) => state.user);

  // Fetch unread support messages count for Admin
  const { data: unreadSupport } = useAuthenticatedSWR<{ count: number }>(
    dbUser?.role === 'ADMIN' ? '/api/admin/support/unread-count' : null,
    { refreshInterval: 10000 }
  );

  // Fetch unread support messages count for User
  const { data: userUnreadSupport } = useAuthenticatedSWR<{ count: number }>(
    dbUser?.role !== 'ADMIN' ? '/api/support/unread-count' : null,
    { refreshInterval: 10000 }
  );

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
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="p-2 rounded-lg bg-card border border-border">
            <div className="flex flex-col items-center gap-1 text-emerald-500 mb-1">
              <Target className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Accuracy</span>
            </div>
            <p className="text-sm font-bold text-foreground text-center">
              {stats.questionsToday > 0
                ? `${Math.round((stats.correctToday / stats.questionsToday) * 100)}%`
                : '0%'}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-card border border-border">
            <div className="flex flex-col items-center gap-1 text-amber-500 mb-1">
              <Flame className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Streak</span>
            </div>
            <p className="text-sm font-bold text-foreground text-center">{stats.currentStreak}d</p>
          </div>
          <div className="p-2 rounded-lg bg-card border border-border flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-1 text-amber-500 mb-1">
              <div className="w-6 h-6 flex items-center justify-center rounded-full overflow-hidden">
                <img src="/images/coin-icon.png" alt="Coins" className="w-full h-full object-cover scale-150" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tighter">Coins</span>
            </div>
            <p className="text-sm font-bold text-foreground text-center">{dbUser?.coins || 0}</p>
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
                  id={item.id}
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

          {/* Admin Only Section */}
          {dbUser?.role === 'ADMIN' && (
            <div className="pt-4 mt-4 border-t border-border">
              <span className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Admin Ops</span>
              <Link href="/admin/feedback">
                <motion.div
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                    pathname === '/admin/feedback'
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/25'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <TrendingUp className="h-5 w-5" />
                  Admin Feedback
                </motion.div>
              </Link>
              <Link href="/admin/support">
                <motion.div
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all mt-1',
                    pathname === '/admin/support'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5" />
                    Admin Support
                  </div>
                  {unreadSupport && unreadSupport.count > 0 && (
                    <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold shadow-sm">
                      {unreadSupport.count}
                    </span>
                  )}
                </motion.div>
              </Link>
            </div>
          )}
        </nav>

        {/* Exam Countdown */}
        {examDate && (
          <div className="my-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-600">Exam Countdown</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{daysLeft} days</p>
            <p className="text-xs text-muted-foreground mt-1">{examLabel}</p>
          </div>
        )}

        {/* Bottom Navigation - Hidden on admin pages for cleaner focus */}
        {dbUser?.role !== 'ADMIN' && (
          <div className="pt-4 border-t border-border space-y-1">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;

              if (item.id === 'btn-feedback') {
                return (
                  <motion.div
                    key={item.label}
                    onClick={() => setIsFeedbackOpen(true)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all cursor-pointer"
                    whileHover={{ x: 4 }}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </motion.div>
                );
              }

              if (item.id === 'btn-support') {
                return (
                  <motion.div
                    key={item.label}
                    onClick={() => setSupportModalOpen(true)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all cursor-pointer"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Icon className="h-4 w-4" />
                      {item.label}
                      {userUnreadSupport && userUnreadSupport.count > 0 && (
                        <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold shadow-sm ml-auto">
                          {userUnreadSupport.count}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              }

              return (
                <Link key={item.label} href={item.href || '#'}>
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
        )}
      </div>

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </aside>
  );
}


