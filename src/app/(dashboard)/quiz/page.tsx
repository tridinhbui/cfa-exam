'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  Shuffle,
  Play,
  Filter,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthenticatedSWR } from '@/hooks/use-authenticated-swr';
import { useUserStore } from '@/store/user-store';
import { useQuizStore } from '@/store/quiz-store';
import { Lock, RotateCcw, PlayCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const quizModes = [
  {
    id: 'practice',
    name: 'Practice Mode',
    description: 'No time limit, see explanations after each question',
    icon: BookOpen,
    color: 'from-indigo-600 to-violet-600',
  },
  {
    id: 'timed',
    name: 'Timed Mode',
    description: '90 seconds per question, simulates exam pressure',
    icon: Clock,
    color: 'from-amber-600 to-orange-600',
  },
];

interface Topic {
  id: string;
  name: string;
  questions: number;
  accuracy: number | null;
}

interface QuizHistoryItem {
  id: string;
  mode: string;
  startedAt: string;
  completedAt: string;
  totalQuestions: number;
  score: number;
}

export default function QuizPage() {
  const { user } = useAuth();
  const userProfile = useUserStore((state) => state.user);
  const isFreeUser = userProfile?.subscription === 'FREE';
  const [isMounted, setIsMounted] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState('practice');
  const [questionCount, setQuestionCount] = useState('10');
  const [difficulty, setDifficulty] = useState('all');

  const {
    isActive: hasActiveQuiz,
    mode: activeMode,
    resetQuiz,
    savedExamSession,
    resumeExamSession,
    clearSavedExam
  } = useQuizStore();
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [pendingQuizUrl, setPendingQuizUrl] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use SWR for fetching data
  const { data: topics, isLoading: topicsLoading } = useAuthenticatedSWR<Topic[]>(
    user ? `/api/quiz/topics?userId=${user.uid}` : null
  );

  const { data: recentQuizzes, isLoading: historyLoading } = useAuthenticatedSWR<QuizHistoryItem[]>(
    user ? `/api/quiz/history?userId=${user.uid}` : null
  );

  const isLoading = topicsLoading || historyLoading;

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const selectAllTopics = () => {
    if (!topics) return;
    if (selectedTopics.length === topics.length) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics(topics.map((t) => t.id));
    }
  };

  const handleQuizStart = (url: string, isExamRequest: boolean = false) => {
    // We only show the CONTINUE dialog if the user is explicitly trying to start/access an EXAM
    // AND we have either an active exam or a saved background exam.
    const hasExistingExam = (hasActiveQuiz && activeMode === 'EXAM') || savedExamSession !== null;

    if (isExamRequest && hasExistingExam) {
      setPendingQuizUrl(url);
      setShowContinueDialog(true);
    } else {
      // For practice/timed sessions, we just go there.
      // The store's startQuiz will automatically back up any active exam into savedExamSession.
      window.location.href = url;
    }
  };

  const startQuiz = () => {
    if (selectedTopics.length === 0) return;
    const isExamSelected = selectedMode === 'exam';
    const url = `/quiz/session?topics=${selectedTopics.join(',')}&mode=${selectedMode}&count=${questionCount}&difficulty=${difficulty}&v=${Date.now()}`;
    handleQuizStart(url, isExamSelected);
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black text-foreground tracking-tight"
        >
          Practice Quiz
        </motion.h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Select topics and mode to start your personalized practice session
        </p>
      </div>

      <div className="grid lg:grid-cols-1 gap-8">
        {/* Quiz Mode Selection */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            1. Select Mode
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {quizModes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.id;
              return (
                <Card
                  key={mode.id}
                  className={`group relative overflow-hidden cursor-pointer transition-all duration-300 rounded-2xl border-2 ${isSelected
                    ? 'border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/10'
                    : 'border-border bg-card hover:border-indigo-500/30'
                    }`}
                  onClick={() => setSelectedMode(mode.id)}
                >
                  <CardContent className="p-6">
                    <div
                      className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${mode.color} mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{mode.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{mode.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Topic Selection */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              2. Select Topics
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={selectAllTopics}
              className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5 font-bold uppercase tracking-wider text-xs"
            >
              {topics && selectedTopics.length === topics.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {isLoading ? (
              Array(10).fill(0).map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-muted/20 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                </div>
              ))
            ) : topics?.map((topic, index) => {
              const isSelected = selectedTopics.includes(topic.id);
              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-200 rounded-xl border-2 ${isSelected
                      ? 'border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-500/5'
                      : 'border-border bg-card'
                      }`}
                    onClick={() => toggleTopic(topic.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected
                              ? 'bg-indigo-500 border-indigo-500'
                              : 'border-border bg-muted/30'
                              }`}
                          >
                            {isSelected && (
                              <motion.svg
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-3.5 h-3.5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={4}
                                  d="M5 13l4 4L19 7"
                                />
                              </motion.svg>
                            )}
                          </div>
                          <span className="font-bold text-foreground text-sm uppercase tracking-tight">{topic.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">
                            {topic.questions} Qs
                          </span>
                          <Badge
                            variant={topic.accuracy === null ? "default" : topic.accuracy >= 70 ? "success" : topic.accuracy >= 50 ? "warning" : "destructive"}
                            className="text-[10px] font-black font-mono min-w-[45px] justify-center"
                          >
                            {topic.accuracy !== null ? `${topic.accuracy}%` : 'N/A'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Quiz Options */}
        <section>
          <Card className="rounded-2xl border-border bg-card overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/20">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Filter className="h-5 w-5 text-indigo-400" />
                3. Session Options
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Questions Count
                  </label>
                  <Select value={questionCount} onValueChange={setQuestionCount}>
                    <SelectTrigger className="h-12 bg-muted/50 border-border rounded-xl font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="20" disabled={isFreeUser}>
                        <div className="flex items-center justify-between w-full gap-2">
                          <span>20 Questions</span>
                          {isFreeUser && <Badge variant="secondary" className="bg-slate-800 text-slate-400 text-[8px] h-4 px-1 border-slate-700 ml-auto">PRO</Badge>}
                        </div>
                      </SelectItem>
                      <SelectItem value="30" disabled={isFreeUser}>
                        <div className="flex items-center justify-between w-full gap-2">
                          <span>30 Questions</span>
                          {isFreeUser && <Badge variant="secondary" className="bg-slate-800 text-slate-400 text-[8px] h-4 px-1 border-slate-700 ml-auto">PRO</Badge>}
                        </div>
                      </SelectItem>
                      <SelectItem value="50" disabled={isFreeUser}>
                        <div className="flex items-center justify-between w-full gap-2">
                          <span>50 Questions</span>
                          {isFreeUser && <Badge variant="secondary" className="bg-slate-800 text-slate-400 text-[8px] h-4 px-1 border-slate-700 ml-auto">PRO</Badge>}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Difficulty Level
                  </label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="h-12 bg-muted/50 border-border rounded-xl font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Mixed Difficulty</SelectItem>
                      <SelectItem value="easy">Level: Easy</SelectItem>
                      <SelectItem value="medium">Level: Medium</SelectItem>
                      <SelectItem value="hard">Level: Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Start Button Area */}
              <div className="flex flex-col gap-6 pt-6 border-t border-border/50">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-500/20"
                    onClick={startQuiz}
                    disabled={selectedTopics.length === 0}
                  >
                    <Play className="h-6 w-6 mr-3 fill-white" />
                    START SESSION ({selectedTopics.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 border-border hover:bg-muted font-bold rounded-2xl px-8"
                    onClick={() => {
                      if (!topics) return;
                      const allTopicIds = topics.map((t) => t.id);
                      handleQuizStart(`/quiz/session?topics=${allTopicIds.join(',')}&mode=${selectedMode}&count=${questionCount}&difficulty=${difficulty}&v=${Date.now()}`, selectedMode === 'exam');
                    }}
                  >
                    <Shuffle className="h-5 w-5 mr-3" />
                    RANDOM MIX
                  </Button>
                </div>

                {/* Mock Exam Promo */}
                <div className={`relative group p-[2px] rounded-3xl bg-gradient-to-r ${isFreeUser ? 'from-slate-700 to-slate-800' : 'from-red-600 via-rose-500 to-red-600'}`}>
                  <Button
                    size="lg"
                    className={`relative w-full bg-slate-950 hover:bg-slate-900 text-white border-none h-20 rounded-[22px] transition-all ${isFreeUser ? 'opacity-70 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      if (isFreeUser) return;
                      if (!topics) return;
                      const allTopicIds = topics.map((t) => t.id);
                      handleQuizStart(`/quiz/session?topics=${allTopicIds.join(',')}&mode=exam&count=180&difficulty=all`, true);
                    }}
                    disabled={isFreeUser}
                  >
                    <div className="flex items-center justify-between w-full px-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${isFreeUser ? 'bg-slate-800' : 'bg-red-500/10'}`}>
                          {isFreeUser ? (
                            <Lock className="h-6 w-6 text-slate-500" />
                          ) : (
                            <Zap className="h-6 w-6 text-red-500 fill-red-500" />
                          )}
                        </div>
                        <div className="text-left">
                          <div className={`text-xl font-black tracking-tight leading-none mb-1 uppercase ${isFreeUser ? 'text-slate-500' : 'text-white'}`}>Full Mock Exam</div>
                          <div className="text-xs text-muted-foreground font-medium">180 Questions • All Topics • Exam Setting</div>
                        </div>
                      </div>
                      <Badge className={`${isFreeUser ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-red-500/20 text-red-400 border-red-500/30'} font-black`}>PRO</Badge>
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Recent History */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-500" />
              Recent History
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))
            ) : recentQuizzes && recentQuizzes.length > 0 ? (
              recentQuizzes.slice(0, 5).map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-indigo-500/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${quiz.mode === 'EXAM' ? 'bg-red-500/10' : 'bg-indigo-500/10'}`}>
                      {quiz.mode === 'EXAM' ? <Zap className="h-4 w-4 text-red-500" /> : <BookOpen className="h-4 w-4 text-indigo-500" />}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm uppercase">
                          {quiz.totalQuestions} Questions
                        </span>
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 uppercase font-black bg-muted text-muted-foreground">
                          {quiz.mode}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                        {quiz.completedAt}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={quiz.score >= 70 ? "success" : quiz.score >= 50 ? "warning" : "destructive"}
                    className="text-sm font-black font-mono min-w-[50px] justify-center"
                  >
                    {quiz.score}%
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-12 rounded-2xl border-2 border-dashed border-border mb-8">
                <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">No recent sessions found. Time to practice!</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Continue Dialog */}
      <Dialog open={showContinueDialog} onOpenChange={setShowContinueDialog}>
        <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white flex items-center gap-2">
              <PlayCircle className="h-6 w-6 text-indigo-500" />
              IN-PROGRESS SESSION
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">
              You have an active quiz session. Would you like to continue where you left off or start a new one?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20"
              onClick={() => {
                // If the exam is already the active one, just go there.
                // If it was stashed in savedExamSession, restore it first.
                if (savedExamSession) {
                  resumeExamSession();
                }
                window.location.href = '/quiz/session?mode=exam';
              }}
            >
              <PlayCircle className="h-6 w-6 fill-white" />
              CONTINUE SESSION
            </Button>
            <Button
              variant="outline"
              className="w-full h-14 border-slate-800 hover:bg-slate-900 text-slate-300 font-bold rounded-2xl flex items-center justify-center gap-3"
              onClick={() => {
                // To restart: wipe both active and saved exam state
                resetQuiz();
                clearSavedExam();
                if (pendingQuizUrl) {
                  window.location.href = pendingQuizUrl;
                }
              }}
            >
              <RotateCcw className="h-5 w-5" />
              RESTART FRESH
            </Button>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="ghost"
              className="text-slate-500 font-bold hover:text-slate-300 hover:bg-transparent"
              onClick={() => setShowContinueDialog(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
