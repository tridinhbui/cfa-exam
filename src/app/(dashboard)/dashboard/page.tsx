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




interface TopicData {
  name: string;
  accuracy: number | null;
  attempts: number;
}

import { useExamStore } from '@/store/exam-store';

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


import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { label: examLabel, daysRemaining } = useExamStore();
  const daysLeft = daysRemaining();

  const [stats, setStats] = useState({
    name: '',
    currentStreak: 0,
    longestStreak: 0,
    questionsToday: 0,
    correctToday: 0,
    timeSpentToday: 0,
    averageScore: 0,
    totalQuestions: 0,
    weeklyAccuracy: 0,
    weeklyTrend: 0,
    cfaLevel: 'LEVEL_1',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [topicData, setTopicData] = useState<TopicData[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  // Filter topics with accuracy < 50% (excluding N/A) for Focus Areas
  const weakTopics = topicData
    .filter(t => t.accuracy !== null && t.accuracy < 50)
    .sort((a, b) => (a.accuracy || 0) - (b.accuracy || 0));

  const displayName = stats.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Scholar';

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        console.log('No user found in DashboardPage');
        return;
      }

      try {
        console.log('Fetching ID token for user:', user.uid);
        const token = await user.getIdToken(true);
        console.log('Token successfully fetched (length):', token?.length);

        // --- Lệnh bí mật để bro test ---
        (window as any).getToken = async () => {
          const t = await user.getIdToken(true);
          console.log("CHÌA KHÓA (TOKEN) CỦA BRO ĐÂY:");
          console.log(t);
          return t;
        };
        console.log("💡 Gõ 'await getToken()' vào console để lấy token!");
        // ------------------------------

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Get local date string
        const localDate = new Date().toLocaleDateString('en-CA');

        // Parallel fetch for better performance
        const [statsRes, topicsRes, activityRes] = await Promise.all([
          fetch(`/api/user/stats?userId=${user.uid}&date=${localDate}`, { headers }),
          fetch(`/api/quiz/topics?userId=${user.uid}`, { headers }),
          fetch(`/api/user/activity?userId=${user.uid}`, { headers })
        ]);

        const statsData = await statsRes.json();
        if (statsRes.ok) {
          setStats(statsData);
          if (statsData.chartData) setWeeklyData(statsData.chartData);
        } else {
          console.error('Stats fetch failed:', statsData.error);
        }

        const topicsData = await topicsRes.json();
        if (topicsRes.ok && Array.isArray(topicsData)) {
          const transformedTopics = topicsData.map((topic: any) => ({
            name: topic.name,
            accuracy: topic.accuracy,
            attempts: topic.questions
          }));
          setTopicData(transformedTopics);
        } else {
          console.error('Topics fetch failed:', topicsData.error);
        }

        const activityData = await activityRes.json();
        if (activityRes.ok && Array.isArray(activityData)) {
          setRecentActivity(activityData);
        } else {
          console.error('Activity fetch failed:', activityData.error);
        }

      } catch (err) {
        console.error('Critical error in fetchStats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const formatStudyTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = (seconds / 3600).toFixed(1);
    return `${hours}h`;
  };

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
            Welcome Back, {displayName} 👋
          </motion.h1>
          <p className="text-muted-foreground mt-2 text-lg">
            It&apos;s <span className="text-indigo-400 font-semibold">{daysLeft} days</span> until your {examLabel}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-3" data-onboarding="score-cards">
          <div className="flex flex-col items-center sm:items-start gap-1 p-4 rounded-2xl bg-card border border-border min-w-[160px]">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                <Flame className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Streak</span>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-foreground">{stats.currentStreak} Days</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Best: {stats.longestStreak}</div>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-start gap-1 p-4 rounded-2xl bg-card border border-border min-w-[140px]">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                <Award className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Level</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.cfaLevel.replace('_', ' ')}</div>
          </div>
        </div>
      </div>

      {/* Stats Cards Section - Replaced with more compact layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Questions Today"
          value={stats.questionsToday.toString()}
          subtitle={`${stats.correctToday} correct`}
          icon={Target}
          color="indigo" // Keep indigo
          delay={0}
        />
        <StatsCard
          title="Weekly Accuracy"
          value={`${stats.weeklyAccuracy}%`}
          icon={TrendingUp}
          trend={{ value: Math.abs(stats.weeklyTrend), isPositive: stats.weeklyTrend >= 0 }}
          subtitle={`${stats.weeklyTrend >= 0 ? '+' : '-'}${Math.abs(stats.weeklyTrend)}% vs last week`}
          color="indigo" // Changed from emerald to indigo
          delay={0.1}
        />
        <StatsCard
          title="Study Time"
          value={formatStudyTime(stats.timeSpentToday || 0)}
          subtitle="Today"
          icon={Clock}
          color="indigo" // Changed from amber to indigo
          delay={0.2}
        />
        <StatsCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          subtitle={`${stats.totalQuestions} questions total`}
          icon={Award}
          color="indigo" // Changed from purple to indigo
          delay={0.3}
        />
      </div>

      {/* Quick Actions (Bento Row) */}
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
                  {/* Subtle background gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                  <CardContent className="p-8">
                    <div
                      className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${action.color} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
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
          <Card className="h-full bg-card border-border rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-border p-6">
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
        <Card className="bg-card border-border rounded-2xl overflow-hidden flex flex-col">
          <CardHeader className="border-b border-border p-6 text-sm">
            <CardTitle className="text-xl font-bold flex items-center gap-3 text-foreground">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Target className="h-5 w-5 text-red-400" />
              </div>
              Focus Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5 flex-1 overflow-y-auto">
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
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
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
                          : 'text-red-400'
                        }`}
                    >
                      {activity.score}%
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <p className="font-medium">No recent activity</p>
                <p className="text-sm">Complete quizzes to see your history here.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


