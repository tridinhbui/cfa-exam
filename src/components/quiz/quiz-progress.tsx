'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useQuizStore } from '@/store/quiz-store';

export function QuizProgress() {
  const { questions, currentIndex, answers, isCompleted } = useQuizStore();

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {questions.map((q, index) => {
        const isAnswered = answers[q.id] !== undefined;
        const isCurrent = index === currentIndex;
        const isCorrect = isCompleted && answers[q.id] === q.correctAnswer;
        const isWrong = isCompleted && answers[q.id] && answers[q.id] !== q.correctAnswer;

        return (
          <motion.button
            key={q.id}
            onClick={() => useQuizStore.getState().goToQuestion(index)}
            className={cn(
              'w-8 h-8 rounded-lg text-xs font-semibold transition-all',
              isCurrent && !isCompleted
                ? 'bg-indigo-500 text-white ring-2 ring-indigo-500/50'
                : isCorrect
                ? 'bg-emerald-500 text-white'
                : isWrong
                ? 'bg-red-500 text-white'
                : isAnswered
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {index + 1}
          </motion.button>
        );
      })}
    </div>
  );
}


