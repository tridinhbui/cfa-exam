'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Flag,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QuizCard } from '@/components/quiz/quiz-card';
import { QuizTimer } from '@/components/quiz/quiz-timer';
import { QuizProgress } from '@/components/quiz/quiz-progress';
import { QuizResults } from '@/components/quiz/quiz-results';
import { useQuizStore, QuizQuestion } from '@/store/quiz-store';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

function QuizContent() {
  const [isLoading, setIsLoading] = useState(true);
  const {
    questions,
    currentIndex,
    answers,
    isCompleted,
    showExplanation,
    startQuiz,
    setAnswer,
    nextQuestion,
    prevQuestion,
    submitQuiz,
    toggleExplanation,
  } = useQuizStore();

  const searchParams = useSearchParams();
  const topics = searchParams.get('topics') || 'all';
  const rawMode = searchParams.get('mode')?.toUpperCase() || 'PRACTICE';
  const mode = (rawMode as 'PRACTICE' | 'TIMED' | 'EXAM');
  const count = searchParams.get('count') || '10';
  const difficulty = searchParams.get('difficulty') || 'all';

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/quiz/questions?topics=${topics}&count=${count}&difficulty=${difficulty}`);
        const data = await response.json();

        if (data.error) throw new Error(data.error);

        const quizId = `session-${topics}-${mode}-${count}-${difficulty}`;
        startQuiz(quizId, data, mode);
      } catch (error) {
        console.error('Failed to load questions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [topics, mode, count, difficulty, startQuiz]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-4 flex-col">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
        <p className="text-slate-400 font-medium animate-pulse">Loading quiz...</p>
      </div>
    );
  }

  if (isCompleted) {
    return <QuizResults />;
  }

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers[currentQuestion?.id] || null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/quiz">
          <Button variant="ghost" size="icon" className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1 px-4">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            {mode === 'EXAM' ? 'Exam Mode' : mode === 'TIMED' ? 'Timed Quiz' : 'Practice Quiz'}
          </h2>
          <h1 className="text-xl font-black text-foreground">
            Topic: {topics.charAt(0).toUpperCase() + topics.slice(1).replace('_', ' ')}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <QuizTimer />
          <Button variant="outline" size="sm" className="hidden sm:flex border-border/50 font-bold">
            <Flag className="h-4 w-4 mr-2" />
            Flag
          </Button>
        </div>
      </div>

      {/* Navigation & Progress Hub */}
      <div className="mb-8 space-y-4 bg-card/30 backdrop-blur-md p-6 rounded-3xl border border-border/50 shadow-xl shadow-indigo-500/5">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevQuestion}
            disabled={currentIndex === 0}
            className="font-bold rounded-xl h-10 px-4 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Prev
          </Button>

          <div className="flex-1 flex justify-center">
            <QuizProgress />
          </div>

          {currentIndex === questions.length - 1 ? (
            <Button
              size="sm"
              onClick={submitQuiz}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-10 px-6 shadow-lg shadow-indigo-500/20"
            >
              Finish
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={nextQuestion}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-10 px-6 shadow-lg shadow-indigo-500/20"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
            <span>Quiz Progress</span>
            <span className="text-primary">{Object.keys(answers).length} / {questions.length} Answered</span>
          </div>
          <Progress
            value={questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0}
            className="h-2 bg-muted shadow-inner rounded-full"
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        {currentQuestion && (
          <QuizCard
            key={currentQuestion.id}
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={(answer) => setAnswer(currentQuestion.id, answer)}
            showResult={selectedAnswer !== null}
            showExplanation={showExplanation}
            onToggleExplanation={toggleExplanation}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function QuizSessionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Preparing Quiz Session...</p>
        </div>
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}

