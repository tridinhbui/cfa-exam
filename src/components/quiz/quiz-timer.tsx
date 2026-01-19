'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Pause, Play } from 'lucide-react';
import { formatTime, cn } from '@/lib/utils';
import { useQuizStore } from '@/store/quiz-store';
import { Button } from '@/components/ui/button';

export function QuizTimer() {
  const {
    timeRemaining,
    isTimerRunning,
    mode,
    tick,
    pauseTimer,
    resumeTimer
  } = useQuizStore();

  useEffect(() => {
    if (!isTimerRunning || mode === 'PRACTICE' || mode === 'MISTAKES') return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, mode, tick]);

  if (mode === 'PRACTICE' || mode === 'MISTAKES') {
    return null;
  }

  const isLowTime = timeRemaining <= 60;
  const isCritical = timeRemaining <= 30;

  return (
    <motion.div
      className={cn(
        'flex items-center gap-3 px-4 py-2 rounded-xl border transition-colors',
        isCritical
          ? 'bg-red-500/10 border-red-500/30'
          : isLowTime
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-muted/50 border-border'
      )}
      animate={isCritical ? { scale: [1, 1.02, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1 }}
    >
      <Clock
        className={cn(
          'h-5 w-5',
          isCritical
            ? 'text-red-400'
            : isLowTime
              ? 'text-amber-500'
              : 'text-muted-foreground'
        )}
      />
      <span
        className={cn(
          'font-mono text-lg font-bold',
          isCritical
            ? 'text-red-600 dark:text-red-400'
            : isLowTime
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-foreground'
        )}
      >
        {formatTime(timeRemaining)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => (isTimerRunning ? pauseTimer() : resumeTimer())}
      >
        {isTimerRunning ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
    </motion.div>
  );
}


