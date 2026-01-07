'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen,
  FileText,
  GraduationCap,
  Target,
  Clock,
  TrendingUp,
  Calendar,
  ArrowRight,
  Flame,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatsCard } from '@/components/analytics/stats-card';
import { PerformanceChart } from '@/components/analytics/performance-chart';
import { useAuth } from '@/context/auth-context';

// Mock data
const weeklyData = [
  { date: 'Mon', accuracy: 65, questionsAnswered: 20 },
  { date: 'Tue', accuracy: 72, questionsAnswered: 25 },
  { date: 'Wed', accuracy: 68, questionsAnswered: 18 },
  { date: 'Thu', accuracy: 75, questionsAnswered: 30 },
  { date: 'Fri', accuracy: 71, questionsAnswered: 22 },
  { date: 'Sat', accuracy: 78, questionsAnswered: 28 },
  { date: 'Sun', accuracy: 74, questionsAnswered: 15 },
];

const topicData = [
  { name: 'Ethics', accuracy: 82, attempts: 150 },
  { name: 'Quantitative Methods', accuracy: 68, attempts: 120 },
  { name: 'Economics', accuracy: 71, attempts: 90 },
  { name: 'Financial Reporting', accuracy: 58, attempts: 200 },
  { name: 'Corporate Issuers', accuracy: 75, attempts: 80 },
  { name: 'Equity Investments', accuracy: 65, attempts: 100 },
  { name: 'Fixed Income', accuracy: 52, attempts: 85 },
  { name: 'Derivatives', accuracy: 48, attempts: 60 },
];

const quickActions = [
  {
    title: 'Practice Quiz',
    description: 'Random questions from all topics',
    icon: BookOpen,
    href: '/quiz',
    color: 'from-indigo-600 to-violet-600',
  },
  {
    title: 'Item Set',
    description: 'Vignette-style questions',
    icon: FileText,
    href: '/item-sets',
    color: 'from-purple-600 to-pink-600',
  },
  {
    title: 'Essay Practice',
    description: 'Level III constructed response',
    icon: GraduationCap,
    href: '/essays',
    color: 'from-amber-600 to-orange-600',
  },
];

const recentActivity = [
  { type: 'quiz', topic: 'Ethics', score: 80, date: '2 hours ago' },
  { type: 'item-set', topic: 'Fixed Income', score: 67, date: '5 hours ago' },
  { type: 'quiz', topic: 'Derivatives', score: 55, date: 'Yesterday' },
  { type: 'essay', topic: 'Portfolio Management', score: 72, date: 'Yesterday' },
];

const weakTopics = [
  { name: 'Derivatives', accuracy: 48, trend: -5 },
  { name: 'Fixed Income', accuracy: 52, trend: 2 },
  { name: 'Financial Reporting', accuracy: 58, trend: 8 },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const displayName = user?.displayName?.split(' ')[0] || 'Scholar';
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div className="flex-1">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-extrabold text-white tracking-tight"
          >
            Welcome Back, {displayName} 👋
          </motion.h1>
          <p className="text-slate-400 mt-2 text-lg">
            It&apos;s <span className="text-indigo-400 font-semibold">87 days</span> until your Feb 2025 exam
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-3" data-onboarding="score-cards">
          <div className="flex flex-col items-center sm:items-start gap-1 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50 min-w-[140px]">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                <Flame className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Streak</span>
            </div>
            <div className="text-2xl font-bold text-white">5 Days</div>
          </div>

          <div className="flex flex-col items-center sm:items-start gap-1 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50 min-w-[140px]">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                <Award className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Level</span>
            </div>
            <div className="text-2xl font-bold text-white">Level I</div>
          </div>
        </div>
      </div>

      {/* Stats Cards Section - Replaced with more compact layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Questions Today"
          value="12"
          subtitle="18 remaining"
          icon={Target}
          color="indigo"
          delay={0}
        />
        <StatsCard
          title="Weekly Accuracy"
          value="72%"
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
          color="emerald"
          delay={0.1}
        />
        <StatsCard
          title="Study Time"
          value="2.5h"
          subtitle="This week"
          icon={Clock}
          color="amber"
          delay={0.2}
        />
        <StatsCard
          title="Average Score"
          value="68%"
          subtitle="Top 15%"
          icon={Award}
          color="purple"
          delay={0.3}
        />
      </div>

      {/* Quick Actions (Bento Row) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Link href={action.href}>
                <Card className="group relative overflow-hidden cursor-pointer hover:border-indigo-500/50 transition-all duration-300 bg-slate-900/40 border-slate-800/50 rounded-2xl">
                  {/* Subtle background gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                  <CardContent className="p-8">
                    <div
                      className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${action.color} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {action.title}
                    </h3>
                    <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                      {action.description}
                    </p>
                    <div className="flex items-center text-indigo-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2">
          <Card className="h-full bg-slate-900/40 border-slate-800/50 rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-800/50 p-6">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <PerformanceChart weeklyData={weeklyData} topicData={topicData} />
            </CardContent>
          </Card>
        </div>

        {/* Focus Areas (Weak Topics) */}
        <Card className="bg-slate-900/40 border-slate-800/50 rounded-2xl overflow-hidden flex flex-col">
          <CardHeader className="border-b border-slate-800/50 p-6 text-sm">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Target className="h-5 w-5 text-red-400" />
              </div>
              Focus Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5 flex-1 overflow-y-auto">
            {weakTopics.map((topic, index) => (
              <motion.div
                key={topic.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="group cursor-default"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-white group-hover:text-indigo-400 transition-colors uppercase text-xs tracking-wider">{topic.name}</span>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${topic.trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}
                    >
                      {topic.trend > 0 ? '↑' : '↓'} {Math.abs(topic.trend)}%
                    </span>
                    <span className="text-slate-200 font-mono font-bold text-sm tracking-tighter">{topic.accuracy}%</span>
                  </div>
                </div>
                <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${topic.accuracy}%` }}
                    transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                    className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${topic.accuracy >= 60
                      ? 'from-amber-500 to-orange-500'
                      : 'from-red-500 to-rose-500'
                      }`}
                  />
                </div>
              </motion.div>
            ))}
          </CardContent>
          <div className="p-6 pt-0 mt-auto">
            <Link href="/quiz?topics=weak" className="block w-full">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl transition-all shadow-lg shadow-indigo-500/20">
                Sharpen Weak Topics
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-slate-900/40 border-slate-800/50 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-800/50 p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Recent History</CardTitle>
            <Link href="/analytics">
              <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5 font-bold uppercase tracking-widest text-xs">
                View Reports
                <ArrowRight className="h-3 w-3 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="group relative p-6 rounded-2xl bg-slate-950/40 border border-slate-800/50 hover:border-indigo-500/30 transition-all cursor-default"
              >
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-slate-800 text-slate-300 border-slate-700 uppercase font-extrabold text-[10px] tracking-widest px-2 py-0.5">
                    {activity.type}
                  </Badge>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{activity.date}</span>
                </div>
                <p className="font-bold text-white text-lg mb-4 truncate group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{activity.topic}</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${activity.score}%` }}
                      transition={{ duration: 1, delay: 1 + index * 0.1 }}
                      className={`h-full rounded-full ${activity.score >= 70
                        ? 'bg-emerald-500'
                        : activity.score >= 50
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                        }`}
                    />
                  </div>
                  <span
                    className={`text-sm font-black font-mono ${activity.score >= 70
                      ? 'text-emerald-400'
                      : activity.score >= 50
                        ? 'text-amber-400'
                        : 'text-red-400'
                      }`}
                  >
                    {activity.score}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


