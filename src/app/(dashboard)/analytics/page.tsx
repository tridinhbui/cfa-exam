'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';

import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  BookOpen,
  Award,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatsCard } from '@/components/analytics/stats-card';
import { PerformanceChart } from '@/components/analytics/performance-chart';
import Link from 'next/link';

// Mock data
const weeklyData = [
  { date: 'Week 1', accuracy: 58, questionsAnswered: 150 },
  { date: 'Week 2', accuracy: 62, questionsAnswered: 180 },
  { date: 'Week 3', accuracy: 65, questionsAnswered: 200 },
  { date: 'Week 4', accuracy: 68, questionsAnswered: 175 },
  { date: 'Week 5', accuracy: 72, questionsAnswered: 220 },
  { date: 'Week 6', accuracy: 71, questionsAnswered: 195 },
  { date: 'Week 7', accuracy: 75, questionsAnswered: 210 },
  { date: 'Week 8', accuracy: 78, questionsAnswered: 230 },
];


interface TopicData {
  name: string;
  accuracy: number | null;
  attempts: number; // Mapping 'questions' from API to 'attempts' for UI consistency
}

const errorTypes = [
  { type: 'Conceptual Error', count: 45, percentage: 35 },
  { type: 'Calculation Mistake', count: 32, percentage: 25 },
  { type: 'Misread Question', count: 26, percentage: 20 },
  { type: 'Time Pressure', count: 18, percentage: 14 },
  { type: 'Careless Error', count: 8, percentage: 6 },
];

const recommendations = [
  {
    topic: 'Derivatives',
    message: 'Your accuracy is below 50%. Review options pricing and hedging strategies.',
    priority: 'high',
  },
  {
    topic: 'Fixed Income',
    message: 'Focus on duration and convexity calculations. Practice more bond valuation problems.',
    priority: 'high',
  },
  {
    topic: 'Financial Reporting',
    message: 'Strong improvement this week! Keep practicing revenue recognition standards.',
    priority: 'medium',
  },
  {
    topic: 'Quantitative Methods',
    message: 'Review hypothesis testing and regression analysis concepts.',
    priority: 'medium',
  },
];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [topicData, setTopicData] = useState<TopicData[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      if (!user) return;
      try {
        const response = await fetch(`/api/quiz/topics?userId=${user.uid}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          // Transform API data to match component needs
          const transformedData = data.map((item: any) => ({
            name: item.name,
            accuracy: item.accuracy,
            attempts: item.questions, // 'questions' field from API represents total questions/attempts
          }));
          setTopicData(transformedData);
        }
      } catch (error) {
        console.error('Failed to fetch topics for analytics:', error);
      }
    };

    fetchTopics();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-foreground"
          >
            Analytics
          </motion.h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and identify areas for improvement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-1">
            <Calendar className="h-3 w-3" />
            Last 8 Weeks
          </Badge>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Questions"
          value="1,560"
          subtitle="All time"
          icon={BookOpen}
          color="indigo"
          delay={0}
        />
        <StatsCard
          title="Overall Accuracy"
          value="68%"
          icon={Target}
          trend={{ value: 8, isPositive: true }}
          color="emerald"
          delay={0.1}
        />
        <StatsCard
          title="Study Hours"
          value="47.5"
          subtitle="This month"
          icon={Clock}
          color="amber"
          delay={0.2}
        />
        <StatsCard
          title="Topics Mastered"
          value="3/10"
          subtitle=">70% accuracy"
          icon={Award}
          color="purple"
          delay={0.3}
        />
      </div>

      {/* Performance Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <PerformanceChart weeklyData={weeklyData} topicData={topicData} />
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Error Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-400" />
                Error Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorTypes.map((error) => (
                <div key={error.type} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{error.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground/60">{error.count} errors</span>
                      <span className="text-foreground font-medium">{error.percentage}%</span>
                    </div>
                  </div>
                  <Progress
                    value={error.percentage}
                    indicatorClassName={
                      error.percentage >= 30
                        ? 'from-red-600 to-rose-600'
                        : error.percentage >= 20
                          ? 'from-amber-600 to-orange-600'
                          : 'from-slate-600 to-slate-500'
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border ${rec.priority === 'high'
                    ? 'bg-red-500/10 border-red-500/20'
                    : 'bg-muted/50 border-border'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{rec.topic}</span>
                    <Badge
                      variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.message}</p>
                </div>
              ))}
              <Link href="/quiz?topics=weak">
                <Button className="w-full mt-2">
                  Practice Weak Areas
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Topic Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Topic Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {topicData.map((topic, idx) => (
                <motion.div
                  key={topic.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + idx * 0.05 }}
                  className="p-4 rounded-xl bg-muted/50 border border-border hover:border-indigo-500/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-2xl font-bold ${topic.accuracy === null
                          ? 'text-slate-500' // Gray for N/A
                          : topic.accuracy >= 70
                            ? 'text-emerald-400'
                            : topic.accuracy >= 50
                              ? 'text-amber-400'
                              : 'text-red-400'
                        }`}
                    >
                      {topic.accuracy !== null ? `${topic.accuracy}%` : 'N/A'}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {topic.attempts}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium truncate">
                    {topic.name}
                  </p>
                  <Progress
                    value={topic.accuracy || 0}
                    className="mt-2 h-1.5"
                    indicatorClassName={
                      topic.accuracy === null
                        ? 'bg-slate-700'
                        : topic.accuracy >= 70
                          ? 'from-emerald-600 to-teal-600'
                          : topic.accuracy >= 50
                            ? 'from-amber-600 to-orange-600'
                            : 'from-red-600 to-rose-600'
                    }
                  />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

