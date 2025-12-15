'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FileText,
  Clock,
  BookOpen,
  ChevronRight,
  Search,
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

const itemSets = [
  {
    id: '1',
    title: 'Atlas Corporation Valuation',
    topic: 'Equity Investments',
    questions: 6,
    timeLimit: 18,
    difficulty: 'Medium',
    completed: true,
    score: 83,
  },
  {
    id: '2',
    title: 'Greenfield Industries Bond Analysis',
    topic: 'Fixed Income',
    questions: 6,
    timeLimit: 18,
    difficulty: 'Hard',
    completed: true,
    score: 67,
  },
  {
    id: '3',
    title: 'TechStart Inc. Financial Statements',
    topic: 'Financial Reporting',
    questions: 6,
    timeLimit: 18,
    difficulty: 'Medium',
    completed: false,
    score: null,
  },
  {
    id: '4',
    title: 'Derivative Strategies for Risk Management',
    topic: 'Derivatives',
    questions: 4,
    timeLimit: 12,
    difficulty: 'Hard',
    completed: false,
    score: null,
  },
  {
    id: '5',
    title: 'Morrison Portfolio Construction',
    topic: 'Portfolio Management',
    questions: 6,
    timeLimit: 18,
    difficulty: 'Medium',
    completed: false,
    score: null,
  },
  {
    id: '6',
    title: 'Macro Economic Indicators Analysis',
    topic: 'Economics',
    questions: 4,
    timeLimit: 12,
    difficulty: 'Easy',
    completed: true,
    score: 100,
  },
];

const difficultyColors = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'destructive',
} as const;

export default function ItemSetsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white"
        >
          Item Set Practice
        </motion.h1>
        <p className="text-slate-400 mt-1">
          Master Level II vignette-style questions with real exam simulations
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
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">3</p>
            <p className="text-sm text-slate-400">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">83%</p>
            <p className="text-sm text-slate-400">Avg Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">3</p>
            <p className="text-sm text-slate-400">Remaining</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">54 min</p>
            <p className="text-sm text-slate-400">Est. Time</p>
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
                <Input placeholder="Search item sets..." className="pl-10" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  <SelectItem value="equity">Equity Investments</SelectItem>
                  <SelectItem value="fixed-income">Fixed Income</SelectItem>
                  <SelectItem value="fra">Financial Reporting</SelectItem>
                  <SelectItem value="derivatives">Derivatives</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Item Sets Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {itemSets.map((itemSet, index) => (
          <motion.div
            key={itemSet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
          >
            <Card className="h-full hover:border-indigo-500/50 transition-all group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <FileText className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                        {itemSet.title}
                      </h3>
                      <p className="text-sm text-slate-500">{itemSet.topic}</p>
                    </div>
                  </div>
                  <Badge variant={difficultyColors[itemSet.difficulty as keyof typeof difficultyColors]}>
                    {itemSet.difficulty}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{itemSet.questions} questions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{itemSet.timeLimit} min</span>
                  </div>
                </div>

                {itemSet.completed ? (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-400">Your Score</span>
                      <span
                        className={
                          itemSet.score! >= 70
                            ? 'text-emerald-400'
                            : itemSet.score! >= 50
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }
                      >
                        {itemSet.score}%
                      </span>
                    </div>
                    <Progress value={itemSet.score!} />
                  </div>
                ) : (
                  <div className="mb-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                    <p className="text-sm text-slate-400">Not attempted yet</p>
                  </div>
                )}

                <Link href={`/item-sets/${itemSet.id}`}>
                  <Button className="w-full" variant={itemSet.completed ? 'outline' : 'default'}>
                    {itemSet.completed ? 'Review' : 'Start'}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <Button variant="outline">Load More Item Sets</Button>
      </motion.div>
    </div>
  );
}

