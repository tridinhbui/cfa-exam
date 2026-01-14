'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useQuizStore } from '@/store/quiz-store';

export function QuizProgress() {
  const { questions, currentIndex, answers, isCompleted, flaggedQuestions } = useQuizStore();

  return (
    <div className="flex items-center gap-1.5 flex-wrap justify-center">
      {questions.map((q, index) => {
        const isAnswered = answers[q.id] !== undefined;
        const isCurrent = index === currentIndex;
        const isCorrect = isCompleted && answers[q.id] === q.correctAnswer;
        const isWrong = isCompleted && answers[q.id] && answers[q.id] !== q.correctAnswer;
        const isFlagged = flaggedQuestions.includes(q.id);

        return (
          <div key={q.id} className="relative group">
            <motion.button
              onClick={() => useQuizStore.getState().goToQuestion(index)}
              className={cn(
                'w-8 h-8 rounded-lg text-[10px] font-black transition-all relative flex items-center justify-center',
                isCurrent && !isCompleted
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/20'
                  : isCorrect
                    ? 'bg-emerald-500 text-white'
                    : isWrong
                      ? 'bg-red-500 text-white'
                      : isAnswered
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : 'bg-slate-800 text-slate-500 border border-slate-700/50 hover:bg-slate-700 hover:text-slate-300',
                isFlagged && !isCurrent && !isCompleted && !isAnswered && 'ring-1 ring-amber-500'
              )}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className={cn(isAnswered && !isCurrent && !isCompleted ? 'opacity-0' : 'opacity-100')}>
                {index + 1}
              </span>

              {isAnswered && !isCurrent && !isCompleted && (
                <Check className="w-3.5 h-3.5 absolute text-indigo-400 stroke-[4px]" />
              )}

              {isFlagged && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-slate-950" />
              )}
            </motion.button>
          </div>
        );
      })}
    </div>
  );
}


