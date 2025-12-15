'use client';

import { motion } from 'framer-motion';
import {
  Award,
  CheckCircle,
  XCircle,
  Lightbulb,
  Star,
  ArrowRight,
  RefreshCw,
  Home,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface EssayFeedbackProps {
  score: number;
  maxScore: number;
  feedback: string;
  strengths: string[];
  missingPoints: string[];
  improvements: string[];
  modelAnswer: string;
  userResponse: string;
  onRetry: () => void;
}

export function EssayFeedback({
  score,
  maxScore,
  feedback,
  strengths,
  missingPoints,
  improvements,
  modelAnswer,
  userResponse,
  onRetry,
}: EssayFeedbackProps) {
  const percentage = Math.round((score / maxScore) * 100);
  const isPassing = percentage >= 70;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Score Card */}
      <Card className="overflow-hidden">
        <div
          className={cn(
            'p-8 text-center',
            isPassing
              ? 'bg-gradient-to-br from-emerald-600 to-teal-600'
              : 'bg-gradient-to-br from-amber-600 to-orange-600'
          )}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 mb-4"
          >
            <Award className="h-12 w-12 text-white" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-5xl font-bold text-white mb-2">
              {score}/{maxScore}
            </h2>
            <p className="text-white/80 text-lg">
              {isPassing ? 'Great Performance!' : 'Room for Improvement'}
            </p>
          </motion.div>
        </div>

        <CardContent className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">Score</span>
              <span className={cn('font-semibold', isPassing ? 'text-emerald-400' : 'text-amber-400')}>
                {percentage}%
              </span>
            </div>
            <Progress
              value={percentage}
              indicatorClassName={
                isPassing
                  ? 'from-emerald-600 to-teal-600'
                  : 'from-amber-600 to-orange-600'
              }
            />
          </div>

          {/* Feedback */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <h4 className="font-semibold text-white mb-2">AI Feedback</h4>
            <p className="text-slate-300 leading-relaxed">{feedback}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {strengths.map((strength, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <Star className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{strength}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Missing Points */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <XCircle className="h-5 w-5 text-red-400" />
              Missing Points
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {missingPoints.map((point, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-red-400 text-xs">!</span>
                  </div>
                  <span className="text-slate-300 text-sm">{point}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Improvement Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-amber-400" />
            Suggestions for Improvement
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3">
            {improvements.map((improvement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
              >
                <ArrowRight className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300 text-sm">{improvement}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Answer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-indigo-400" />
            Model Answer
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <p className="text-slate-300 leading-relaxed whitespace-pre-line">
              {modelAnswer}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Your Response */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Response</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <p className="text-slate-300 leading-relaxed whitespace-pre-line">
              {userResponse}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Button onClick={onRetry} className="flex-1">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Another Essay
        </Button>
        <Link href="/essays" className="flex-1">
          <Button variant="secondary" className="w-full">
            Browse Essays
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

