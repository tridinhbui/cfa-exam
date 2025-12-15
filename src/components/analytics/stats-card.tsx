'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'indigo' | 'emerald' | 'amber' | 'red' | 'purple';
  delay?: number;
}

const colorMap = {
  indigo: {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    icon: 'text-indigo-400',
    trend: 'text-indigo-400',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: 'text-emerald-400',
    trend: 'text-emerald-400',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: 'text-amber-400',
    trend: 'text-amber-400',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: 'text-red-400',
    trend: 'text-red-400',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    icon: 'text-purple-400',
    trend: 'text-purple-400',
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'indigo',
  delay = 0,
}: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card
        className={cn(
          'border transition-all hover:scale-[1.02]',
          colors.bg,
          colors.border
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">{title}</p>
              <p className="text-3xl font-bold text-white">{value}</p>
              {subtitle && (
                <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
              )}
              {trend && (
                <p
                  className={cn(
                    'text-sm mt-2 font-medium',
                    trend.isPositive ? 'text-emerald-400' : 'text-red-400'
                  )}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%{' '}
                  <span className="text-slate-500 font-normal">vs last week</span>
                </p>
              )}
            </div>
            <div className={cn('p-3 rounded-xl', colors.bg)}>
              <Icon className={cn('h-6 w-6', colors.icon)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


