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
import { QuizCard } from '@/components/quiz/quiz-card';
import { QuizTimer } from '@/components/quiz/quiz-timer';
import { QuizProgress } from '@/components/quiz/quiz-progress';
import { QuizResults } from '@/components/quiz/quiz-results';
import { useQuizStore, QuizQuestion } from '@/store/quiz-store';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Mock questions removed, now fetching from API

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

        startQuiz(data, mode);
      } catch (error) {
        console.error('Failed to load questions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [topics, mode, count, startQuiz]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading quiz...</p>
        </motion.div>
      </div>
    );
  }

  if (isCompleted) {
    return <QuizResults />;
  }

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers[currentQuestion?.id] || null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/quiz">
          <Button variant="ghost" size="sm">
            <X className="h-4 w-4 mr-2" />
            Exit Quiz
          </Button>
        </Link>
        <QuizTimer />
        <Button variant="ghost" size="sm">
          <Flag className="h-4 w-4 mr-2" />
          Flag
        </Button>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <QuizProgress />
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

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={prevQuestion}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <span className="text-sm text-muted-foreground font-medium">
          {Object.keys(answers).length} of {questions.length} answered
        </span>

        {currentIndex === questions.length - 1 ? (
          <Button onClick={submitQuiz} variant="success">
            Submit Quiz
          </Button>
        ) : (
          <Button onClick={nextQuestion}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
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

