'use client';

import { useState, useEffect } from 'react';
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
  {
    id: 'exam',
    name: 'Exam Simulation',
    description: 'Full exam conditions with continuous timer',
    icon: Zap,
    color: 'from-red-600 to-rose-600',
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
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState('practice');
  const [questionCount, setQuestionCount] = useState('10');
  const [difficulty, setDifficulty] = useState('all');
  const [recentQuizzes, setRecentQuizzes] = useState<QuizHistoryItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // Fetch Topics
        const topicsRes = await fetch(`/api/quiz/topics?userId=${user.uid}`);
        const topicsData = await topicsRes.json();
        if (Array.isArray(topicsData)) {
          setTopics(topicsData);
        }

        // Fetch Recent Quizzes
        const historyRes = await fetch(`/api/quiz/history?userId=${user.uid}`);
        const historyData = await historyRes.json();
        if (Array.isArray(historyData)) {
          setRecentQuizzes(historyData);
        }

      } catch (error) {
        console.error('Failed to fetch quiz data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const selectAllTopics = () => {
    if (selectedTopics.length === topics.length) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics(topics.map((t) => t.id));
    }
  };

  const startQuiz = () => {
    // In a real app, this would navigate to the quiz with selected options
    window.location.href = `/quiz/session?topics=${selectedTopics.join(',')}&mode=${selectedMode}&count=${questionCount}&difficulty=${difficulty}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-foreground"
        >
          Practice Quiz
        </motion.h1>
        <p className="text-muted-foreground mt-1">
          Select topics and mode to start your practice session
        </p>
      </div>

      {/* Quiz Mode Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">Select Mode</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {quizModes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;
            return (
              <Card
                key={mode.id}
                className={`cursor-pointer transition-all ${isSelected
                  ? 'border-primary bg-primary/10'
                  : 'hover:border-border'
                  }`}
                onClick={() => setSelectedMode(mode.id)}
              >
                <CardContent className="p-5">
                  <div
                    className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${mode.color} mb-3`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{mode.name}</h3>
                  <p className="text-sm text-muted-foreground">{mode.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Topic Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Select Topics</h2>
          <Button variant="ghost" size="sm" onClick={selectAllTopics}>
            {selectedTopics.length === topics.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {topics.map((topic, index) => {
            const isSelected = selectedTopics.includes(topic.id);
            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + index * 0.03 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${isSelected
                    ? 'border-primary bg-primary/10'
                    : 'hover:border-border'
                    }`}
                  onClick={() => toggleTopic(topic.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected
                            ? 'bg-primary border-primary'
                            : 'border-border'
                            }`}
                        >
                          {isSelected && (
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </motion.svg>
                          )}
                        </div>
                        <span className="font-medium text-foreground">{topic.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {topic.questions} Qs
                        </span>
                        <Badge
                          variant={
                            topic.accuracy === null
                              ? 'secondary'
                              : topic.accuracy >= 70
                                ? 'success'
                                : topic.accuracy >= 50
                                  ? 'warning'
                                  : 'destructive'
                          }
                          className={topic.accuracy === null ? 'bg-slate-700 text-slate-300' : ''}
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
      </motion.div>

      {/* Quiz Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5 text-indigo-400" />
              Quiz Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Number of Questions
                </label>
                <Select value={questionCount} onValueChange={setQuestionCount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 Questions</SelectItem>
                    <SelectItem value="20">20 Questions</SelectItem>
                    <SelectItem value="30">30 Questions</SelectItem>
                    <SelectItem value="50">50 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Difficulty
                </label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Start Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
              <Button
                size="lg"
                className="flex-1"
                onClick={startQuiz}
                disabled={selectedTopics.length === 0}
              >
                <Play className="h-5 w-5 mr-2" />
                Start Quiz ({selectedTopics.length} topic{selectedTopics.length !== 1 ? 's' : ''})
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const allTopicIds = topics.map((t) => t.id);
                  window.location.href = `/quiz/session?topics=${allTopicIds.join(',')}&mode=${selectedMode}&count=${questionCount}&difficulty=${difficulty}`;
                }}
              >
                <Shuffle className="h-5 w-5 mr-2" />
                Quick Random Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Quizzes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentQuizzes.length > 0 ? (
                recentQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 uppercase tracking-wide">
                          {quiz.mode}
                        </Badge>
                        <span className="font-medium text-foreground text-sm">
                          {quiz.totalQuestions} Questions
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {quiz.startedAt} - {quiz.completedAt}
                      </p>
                    </div>
                    <Badge
                      variant={
                        quiz.score >= 70 ? 'success' : quiz.score >= 50 ? 'warning' : 'destructive'
                      }
                      className="text-sm px-3 py-1"
                    >
                      {quiz.score}%
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent quizzes. Start one above!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

