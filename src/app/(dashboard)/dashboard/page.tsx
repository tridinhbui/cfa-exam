'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen,
  FileText,
  Target,
  Clock,
  TrendingUp,
  ArrowRight,
  Flame,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/analytics/stats-card';
import { useAuth } from '@/context/auth-context';
import { useExamStore } from '@/store/exam-store';
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAuthenticatedSWR } from '@/hooks/use-authenticated-swr';
import { Skeleton } from '@/components/ui/skeleton';
import { Leaderboard } from '@/components/dashboard/leaderboard';

const PerformanceChart = dynamic(() => import('@/components/analytics/performance-chart').then(mod => mod.PerformanceChart), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-slate-900/10 animate-pulse rounded-xl border border-white/5" />
});

interface TopicData {
  name: string;
  accuracy: number | null;
  attempts: number;
}

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
    color: 'from-indigo-600 to-violet-600',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { label: examLabel, daysRemaining } = useExamStore();
  const daysLeft = daysRemaining();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const localDate = useMemo(() => new Date().toLocaleDateString('en-CA'), []);

  // Use SWR for data fetching
  const { data: stats, isLoading: statsLoading } = useAuthenticatedSWR<any>(
    user ? `/api/user/stats?userId=${user.uid}&date=${localDate}` : null
  );

  const { data: topicsData, isLoading: topicsLoading } = useAuthenticatedSWR<any[]>(
    user ? `/api/quiz/topics?userId=${user.uid}` : null
  );

  const { data: recentActivity, isLoading: activityLoading } = useAuthenticatedSWR<any[]>(
    user ? `/api/user/activity?userId=${user.uid}` : null
  );

  const isLoading = statsLoading || topicsLoading || activityLoading;

  // Transform topic data
  const transformedTopics = useMemo(() => {
    if (!topicsData || !Array.isArray(topicsData)) return [];
    return topicsData.map((topic: any) => ({
      name: topic.name,
      accuracy: topic.accuracy,
      attempts: topic.questions
    }));
  }, [topicsData]);

  const weakTopics = useMemo(() => {
    return transformedTopics
      .filter(t => t.accuracy !== null && t.accuracy < 50)
      .sort((a, b) => (a.accuracy || 0) - (b.accuracy || 0));
  }, [transformedTopics]);

  const displayName = stats?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Scholar';
  const weeklyData = stats?.chartData || [];

  const formatStudyTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = (seconds / 3600).toFixed(1);
    return `${hours}h`;
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div className="flex-1">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-extrabold text-foreground tracking-tight"
          >
            Welcome Back, {isLoading ? <Skeleton className="inline-block h-10 w-48 align-middle rounded-lg" /> : displayName} 👋
          </motion.h1>
          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-6 w-64 rounded-md" />
            ) : (
              <p className="text-muted-foreground text-lg">
                It&apos;s <span className="text-indigo-400 font-semibold">{daysLeft} days</span> until {examLabel === 'My Custom Study Plan' || examLabel === 'Select Date' ? 'your exam' : examLabel}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-3">
          {/* Streak Card */}
          <div className="flex flex-col items-center sm:items-start gap-1 p-4 rounded-2xl bg-card border border-border min-w-[160px]">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                <Flame className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Streak</span>
            </div>
            {isLoading ? (
              <div className="space-y-1.5">
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-sm" />
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-foreground">{stats?.currentStreak || 0} Days</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Best: {stats?.longestStreak || 0}</div>
              </div>
            )}
          </div>

          {/* Level Card */}
          <div className="flex flex-col items-center sm:items-start gap-1 p-4 rounded-2xl bg-card border border-border min-w-[140px]">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                <Award className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Level</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-24 rounded-md" />
            ) : (
              <div className="text-2xl font-bold text-foreground">{(stats?.cfaLevel || 'LEVEL_1').replace('_', ' ')}</div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Questions Today", value: (stats?.questionsToday || 0).toString(), subtitle: `${stats?.correctToday || 0} correct`, icon: Target },
          { title: "Weekly Accuracy", value: `${stats?.weeklyAccuracy || 0}%`, subtitle: `${(stats?.weeklyTrend || 0) >= 0 ? '+' : '-'}${Math.abs(stats?.weeklyTrend || 0)}% vs last week`, icon: TrendingUp, trend: { value: Math.abs(stats?.weeklyTrend || 0), isPositive: (stats?.weeklyTrend || 0) >= 0 } },
          { title: "Study Time", value: formatStudyTime(stats?.timeSpentToday || 0), subtitle: "Today", icon: Clock },
          { title: "Average Score", value: `${stats?.averageScore || 0}%`, subtitle: `${stats?.totalQuestions || 0} questions total`, icon: Award }
        ].map((item, i) => (
          isLoading ? (
            <Card key={i} className="border border-indigo-500/20 bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <Skeleton className="h-9 w-20 rounded-lg" />
                    <Skeleton className="h-3 w-32 rounded-sm" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <StatsCard
              key={i}
              title={item.title}
              value={item.value}
              subtitle={item.subtitle}
              icon={item.icon}
              trend={item.trend}
              color="indigo"
              delay={0.1 * i}
            />
          )
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Card className="group relative overflow-hidden cursor-pointer hover:border-indigo-500/50 transition-all duration-300 bg-card border-border rounded-2xl">
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  <CardContent className="p-8">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${action.color} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{action.description}</p>
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
          <Card className="h-full bg-card border-border rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-border p-6">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <PerformanceChart weeklyData={weeklyData} topicData={transformedTopics} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Focus Areas & Leaderboard */}
        <div className="space-y-6">
          {/* Focus Areas */}
          <Card className="bg-card border-border rounded-2xl overflow-hidden flex flex-col">
            <CardHeader className="border-b border-border p-6 text-sm">
              <CardTitle className="text-xl font-bold flex items-center gap-3 text-foreground">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Target className="h-5 w-5 text-red-400" />
                </div>
                Focus Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5 flex-1 overflow-y-auto max-h-[300px]">
              {weakTopics.length > 0 ? (
                weakTopics.map((topic, index) => (
                  <motion.div
                    key={topic.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="group cursor-default"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-foreground group-hover:text-indigo-400 transition-colors uppercase text-xs tracking-wider">{topic.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-foreground font-mono font-bold text-sm tracking-tighter">{topic.accuracy}%</span>
                      </div>
                    </div>
                    <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${topic.accuracy}%` }}
                        transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                        className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${(topic.accuracy || 0) >= 60
                          ? 'from-amber-500 to-orange-500'
                          : 'from-red-500 to-rose-500'
                          }`}
                      />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="p-3 rounded-full bg-emerald-500/10 mb-3">
                    <Award className="h-6 w-6 text-emerald-500" />
                  </div>
                  <p className="text-foreground font-medium mb-1">No Weak Areas!</p>
                  <p className="text-sm text-muted-foreground">You&apos;re maintaining &gt;50% accuracy across all practiced topics.</p>
                </div>
              )}
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

          {/* Leaderboard Widget */}
          <Leaderboard />
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card border-border rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border p-6 text-foreground">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-foreground">Recent History</CardTitle>
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
            {(recentActivity || []).length > 0 ? (
              (recentActivity || []).map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="group relative p-6 rounded-2xl bg-muted/40 border border-border hover:border-indigo-500/30 transition-all cursor-default"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-muted text-muted-foreground border-border uppercase font-extrabold text-[10px] tracking-widest px-2 py-0.5">
                      {activity.type}
                    </Badge>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{activity.date}</span>
                  </div>
                  <p className="font-bold text-foreground text-lg mb-4 truncate group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{activity.topic}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
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
                          : 'text-rose-400'
                        }`}
                    >
                      {activity.score}%
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <p className="text-muted-foreground">Complete a quiz to see your history here!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
