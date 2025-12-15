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
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white"
          >
            Welcome back! 👋
          </motion.h1>
          <p className="text-slate-400 mt-1">
            You&apos;re on a 5-day streak. Keep it up!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="level1" className="gap-1">
            <Award className="h-3 w-3" />
            Level I
          </Badge>
          <Badge className="gap-1 bg-amber-500/20 text-amber-300 border-amber-500/30">
            <Flame className="h-3 w-3" />
            5 Day Streak
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
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
          title="Days to Exam"
          value="87"
          subtitle="Feb 2025"
          icon={Calendar}
          color="purple"
          delay={0.3}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
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
                <Card className="group cursor-pointer hover:border-indigo-500/50 transition-all">
                  <CardContent className="p-6">
                    <div
                      className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.color} mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {action.title}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                      {action.description}
                    </p>
                    <div className="flex items-center text-indigo-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                      Start Now
                      <ArrowRight className="h-4 w-4 ml-1" />
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
          <PerformanceChart weeklyData={weeklyData} topicData={topicData} />
        </div>

        {/* Weak Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-red-400" />
              Focus Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {weakTopics.map((topic, index) => (
              <motion.div
                key={topic.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="p-4 rounded-xl bg-slate-800/50 border border-slate-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{topic.name}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm ${
                        topic.trend > 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {topic.trend > 0 ? '+' : ''}{topic.trend}%
                    </span>
                    <span className="text-slate-400">{topic.accuracy}%</span>
                  </div>
                </div>
                <Progress
                  value={topic.accuracy}
                  indicatorClassName={
                    topic.accuracy >= 60
                      ? 'from-amber-600 to-orange-600'
                      : 'from-red-600 to-rose-600'
                  }
                />
              </motion.div>
            ))}
            <Link href="/quiz?topics=weak">
              <Button className="w-full mt-2">
                Practice Weak Topics
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <Link href="/analytics">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="p-4 rounded-xl bg-slate-800/50 border border-slate-700"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {activity.type}
                  </Badge>
                  <span className="text-xs text-slate-500">{activity.date}</span>
                </div>
                <p className="font-medium text-white mb-1">{activity.topic}</p>
                <div className="flex items-center gap-2">
                  <Progress value={activity.score} className="flex-1" />
                  <span
                    className={`text-sm font-semibold ${
                      activity.score >= 70
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


