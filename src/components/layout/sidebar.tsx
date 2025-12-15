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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 border-r border-slate-800 bg-slate-950 hidden lg:block overflow-y-auto">
      <div className="flex flex-col h-full p-4">
        {/* Daily Progress */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-indigo-600/10 to-violet-600/10 border border-indigo-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-300">Daily Progress</span>
            <span className="text-sm text-indigo-400">12/30</span>
          </div>
          <Progress value={40} className="h-2" />
          <p className="text-xs text-slate-500 mt-2">18 questions remaining today</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <Target className="h-4 w-4" />
              <span className="text-xs">Accuracy</span>
            </div>
            <p className="text-lg font-bold text-white">68%</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Streak</span>
            </div>
            <p className="text-lg font-bold text-white">5 days</p>
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
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
        <div className="my-4 p-4 rounded-xl bg-gradient-to-br from-amber-600/10 to-orange-600/10 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">Exam Countdown</span>
          </div>
          <p className="text-2xl font-bold text-white">87 days</p>
          <p className="text-xs text-slate-400 mt-1">February 2025 Exam</p>
        </div>

        {/* Bottom Navigation */}
        <div className="pt-4 border-t border-slate-800 space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
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


