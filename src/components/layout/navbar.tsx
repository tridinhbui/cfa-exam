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
  Menu,
  X,
  User,
  LogOut,
  Crown,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/quiz', label: 'Quiz', icon: BookOpen },
  { href: '/item-sets', label: 'Item Sets', icon: FileText },
  { href: '/essays', label: 'Essays', icon: GraduationCap },
  { href: '/study-plan', label: 'Study Plan', icon: Calendar },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white">CFA Practice</h1>
              <p className="text-xs text-slate-400">Master Your Exam</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600/20 to-violet-600/20 text-white border border-indigo-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Badge variant="level1" className="hidden sm:flex">
              Level I
            </Badge>
            
            <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
              <Crown className="h-4 w-4 text-amber-400" />
              Upgrade
            </Button>

            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 transition-colors">
              <User className="h-5 w-5 text-slate-300" />
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-white" />
              ) : (
                <Menu className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-t border-slate-800 bg-slate-950"
        >
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600/20 to-violet-600/20 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
            
            <div className="pt-4 border-t border-slate-800 mt-4">
              <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 w-full">
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}


