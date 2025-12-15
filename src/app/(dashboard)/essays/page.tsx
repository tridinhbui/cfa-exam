'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  GraduationCap,
  Clock,
  Star,
  ChevronRight,
  Search,
  Award,
  Target,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const essayQuestions = [
  {
    id: '1',
    title: 'Individual Investor IPS Construction',
    topic: 'Portfolio Management',
    maxScore: 12,
    timeLimit: 25,
    difficulty: 'Medium',
    completed: true,
    score: 9,
  },
  {
    id: '2',
    title: 'Institutional Investor Asset Allocation',
    topic: 'Portfolio Management',
    maxScore: 15,
    timeLimit: 30,
    difficulty: 'Hard',
    completed: true,
    score: 11,
  },
  {
    id: '3',
    title: 'Risk Management and Hedging Strategies',
    topic: 'Derivatives',
    maxScore: 10,
    timeLimit: 20,
    difficulty: 'Hard',
    completed: false,
    score: null,
  },
  {
    id: '4',
    title: 'Fixed Income Portfolio Management',
    topic: 'Fixed Income',
    maxScore: 12,
    timeLimit: 25,
    difficulty: 'Medium',
    completed: false,
    score: null,
  },
  {
    id: '5',
    title: 'Ethics Case Study: Conflicts of Interest',
    topic: 'Ethics',
    maxScore: 10,
    timeLimit: 20,
    difficulty: 'Medium',
    completed: true,
    score: 8,
  },
  {
    id: '6',
    title: 'Equity Valuation and Analysis',
    topic: 'Equity Investments',
    maxScore: 15,
    timeLimit: 30,
    difficulty: 'Hard',
    completed: false,
    score: null,
  },
];

const difficultyColors = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'destructive',
} as const;

export default function EssaysPage() {
  const completedEssays = essayQuestions.filter((e) => e.completed);
  const avgScore = completedEssays.length > 0
    ? Math.round(
        completedEssays.reduce((sum, e) => sum + (e.score! / e.maxScore) * 100, 0) /
          completedEssays.length
      )
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-2"
        >
          <Badge variant="level3" className="gap-1">
            <GraduationCap className="h-3 w-3" />
            Level III
          </Badge>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white"
        >
          Essay Practice
        </motion.h1>
        <p className="text-slate-400 mt-1">
          Practice constructed response questions with AI-powered scoring and feedback
        </p>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Target className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{completedEssays.length}</p>
                <p className="text-sm text-slate-400">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Award className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{avgScore}%</p>
                <p className="text-sm text-slate-400">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">75 min</p>
                <p className="text-sm text-slate-400">Est. Time Left</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Star className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">28</p>
                <p className="text-sm text-slate-400">Total Points Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input placeholder="Search essay questions..." className="pl-10" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  <SelectItem value="pm">Portfolio Management</SelectItem>
                  <SelectItem value="ethics">Ethics</SelectItem>
                  <SelectItem value="equity">Equity Investments</SelectItem>
                  <SelectItem value="fixed-income">Fixed Income</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Not Started</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Essay Questions Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {essayQuestions.map((essay, index) => (
          <motion.div
            key={essay.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
          >
            <Card className="h-full hover:border-indigo-500/50 transition-all group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <GraduationCap className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                        {essay.title}
                      </h3>
                      <p className="text-sm text-slate-500">{essay.topic}</p>
                    </div>
                  </div>
                  <Badge variant={difficultyColors[essay.difficulty as keyof typeof difficultyColors]}>
                    {essay.difficulty}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    <span>Max {essay.maxScore} pts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{essay.timeLimit} min</span>
                  </div>
                </div>

                {essay.completed && essay.score !== null ? (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-400">Your Score</span>
                      <span className="text-white">
                        <span
                          className={
                            (essay.score / essay.maxScore) * 100 >= 70
                              ? 'text-emerald-400'
                              : (essay.score / essay.maxScore) * 100 >= 50
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }
                        >
                          {essay.score}
                        </span>
                        <span className="text-slate-500">/{essay.maxScore}</span>
                      </span>
                    </div>
                    <Progress value={(essay.score / essay.maxScore) * 100} />
                  </div>
                ) : (
                  <div className="mb-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                    <p className="text-sm text-slate-400">Not attempted yet</p>
                  </div>
                )}

                <Link href={`/essays/${essay.id}`}>
                  <Button className="w-full" variant={essay.completed ? 'outline' : 'default'}>
                    {essay.completed ? 'Review Response' : 'Start Essay'}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Scoring Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-indigo-600/10 to-violet-600/10 border-indigo-500/30">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-500/20">
                <Star className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">
                  AI-Powered Essay Scoring
                </h3>
                <p className="text-slate-400 text-sm">
                  Your essays are scored using advanced AI that evaluates based on CFA Institute 
                  rubrics. Get instant feedback on missing points, strengths, and improvement suggestions.
                </p>
              </div>
              <Button variant="secondary">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

