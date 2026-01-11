'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useQuizStore } from '@/store/quiz-store';

export function QuizProgress() {
  const { questions, currentIndex, answers, isCompleted, flaggedQuestions } = useQuizStore();

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {questions.map((q, index) => {
        const isAnswered = answers[q.id] !== undefined;
        const isCurrent = index === currentIndex;
        const isCorrect = isCompleted && answers[q.id] === q.correctAnswer;
        const isWrong = isCompleted && answers[q.id] && answers[q.id] !== q.correctAnswer;
        const isFlagged = flaggedQuestions.includes(q.id);

        return (
          <div key={q.id} className="relative">
            <motion.button
              onClick={() => useQuizStore.getState().goToQuestion(index)}
              className={cn(
                'w-8 h-8 rounded-lg text-xs font-semibold transition-all relative overflow-hidden',
                isCurrent && !isCompleted
                  ? 'bg-indigo-500 text-white ring-2 ring-indigo-500/50'
                  : isCorrect
                    ? 'bg-emerald-500 text-white'
                    : isWrong
                      ? 'bg-red-500 text-white'
                      : isAnswered
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                isFlagged && !isCurrent && !isCompleted && !isAnswered && 'ring-1 ring-orange-400'
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {index + 1}
              {isFlagged && (
                <div className="absolute top-0 right-0 w-2 h-2">
                  <div className="absolute top-0 right-0 border-t-[8px] border-r-[8px] border-t-orange-500 border-r-transparent transform rotate-0" />
                </div>
              )}
            </motion.button>
          </div>
        );
      })}
    </div>
  );
}


