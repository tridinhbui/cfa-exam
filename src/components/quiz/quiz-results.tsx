'use client';

import { motion } from 'framer-motion';
import {
  Trophy,
  Target,
  TrendingUp,
  RefreshCw,
  Home,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn, getGradeColor } from '@/lib/utils';
import { useQuizStore } from '@/store/quiz-store';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth-context';

export function QuizResults() {
  const { questions, answers, resetQuiz, timeSpent, mode } = useQuizStore();
  const { user } = useAuth();
  const syncRef = useRef(false);

  const correctCount = questions.filter(
    (q) => answers[q.id] === q.correctAnswer
  ).length;

  const topicPerformance = questions.reduce((acc, q) => {
    const topicId = q.topic.id;
    if (!acc[topicId]) {
      acc[topicId] = { correct: 0, total: 0 };
    }
    acc[topicId].total++;
    if (answers[q.id] === q.correctAnswer) {
      acc[topicId].correct++;
    }
    return acc;
  }, {} as Record<string, { correct: number; total: number }>);

  useEffect(() => {
    const syncResults = async () => {
      if (!user || syncRef.current) return;
      syncRef.current = true;

      try {
        await fetch('/api/quiz/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.uid,
            correctAnswers: correctCount,
            totalQuestions: questions.length,
            timeSpent: timeSpent,
            topics: Array.from(new Set(questions.map(q => q.topic.id))),
            topicPerformance,
            date: new Date().toLocaleDateString('en-CA'), // Sends YYYY-MM-DD in local time
            mode,
            questions, // Sent for shadow copy logic
            answers, // Add answers map for detailed analysis
          }),
        });
      } catch (error) {
        console.error('Failed to sync quiz results:', error);
      }
    };

    syncResults();
  }, [user, correctCount, questions, timeSpent, topicPerformance]);
  const totalQuestions = questions.length;
  const score = Math.round((correctCount / totalQuestions) * 100);

  // Group by topic
  const topicStats = questions.reduce((acc, q) => {
    const topic = q.topic.name;
    if (!acc[topic]) {
      acc[topic] = { correct: 0, total: 0 };
    }
    acc[topic].total++;
    if (answers[q.id] === q.correctAnswer) {
      acc[topic].correct++;
    }
    return acc;
  }, {} as Record<string, { correct: number; total: number }>);

  const getScoreEmoji = () => {
    if (score >= 90) return '🏆';
    if (score >= 70) return '🎉';
    if (score >= 50) return '💪';
    return '📚';
  };

  const getScoreMessage = () => {
    if (score >= 90) return "Outstanding! You're exam ready!";
    if (score >= 70) return "Great job! Keep up the good work!";
    if (score >= 50) return "Good effort! Room for improvement.";
    return "Keep practicing! You'll get there.";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      {/* Score Card */}
      <Card className="mb-6 overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-6xl mb-4"
          >
            {getScoreEmoji()}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-white mb-2"
          >
            {score}%
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-indigo-100"
          >
            {getScoreMessage()}
          </motion.p>
        </div>

        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center p-4 rounded-xl bg-slate-800/50"
            >
              <Target className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{correctCount}</p>
              <p className="text-xs text-slate-400">Correct</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center p-4 rounded-xl bg-slate-800/50"
            >
              <Trophy className="h-6 w-6 text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{totalQuestions}</p>
              <p className="text-xs text-slate-400">Total</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-center p-4 rounded-xl bg-slate-800/50"
            >
              <TrendingUp className="h-6 w-6 text-indigo-400 mx-auto mb-2" />
              <p className={cn('text-2xl font-bold', getGradeColor(score))}>
                {score >= 70 ? 'Pass' : 'Review'}
              </p>
              <p className="text-xs text-slate-400">Status</p>
            </motion.div>
          </div>

          {/* Topic Breakdown */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-400" />
              Performance by Topic
            </h3>
            {Object.entries(topicStats).map(([topic, stats], index) => {
              const topicScore = Math.round((stats.correct / stats.total) * 100);
              return (
                <motion.div
                  key={topic}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{topic}</span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          topicScore >= 70
                            ? 'success'
                            : topicScore >= 50
                              ? 'warning'
                              : 'destructive'
                        }
                      >
                        {stats.correct}/{stats.total}
                      </Badge>
                      <span className={cn('font-semibold', getGradeColor(topicScore))}>
                        {topicScore}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={topicScore}
                    indicatorClassName={cn(
                      topicScore >= 70
                        ? 'from-emerald-600 to-teal-600'
                        : topicScore >= 50
                          ? 'from-amber-600 to-orange-600'
                          : 'from-red-600 to-rose-600'
                    )}
                  />
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Button onClick={() => {
          resetQuiz();
          window.location.reload();
        }} className="flex-1">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        <Link href="/quiz" className="flex-1">
          <Button variant="secondary" className="w-full">
            <BookOpen className="h-4 w-4 mr-2" />
            New Quiz
          </Button>
        </Link>
        <Link href="/dashboard" className="flex-1">
          <Button variant="outline" className="w-full">
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}

