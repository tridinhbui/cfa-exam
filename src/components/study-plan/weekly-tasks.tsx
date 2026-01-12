'use client';

import { motion } from 'framer-motion';
import {
  Check,
  Clock,
  ChevronRight,
  BookOpen,
  FileText,
  GraduationCap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn, formatDate } from '@/lib/utils';

export interface WeeklyTask {
  id: string;
  topic: string;
  topicId: string;
  type: 'quiz' | 'item-set' | 'review';
  targetDate: Date;
  isCompleted: boolean;
  estimatedTime: number; // minutes
}

interface WeeklyTasksProps {
  weekNumber: number;
  tasks: WeeklyTask[];
  onTaskComplete: (taskId: string) => void;
  onStartTask: (task: WeeklyTask) => void;
}

const taskTypeConfig = {
  quiz: {
    icon: BookOpen,
    color: 'text-indigo-600',
    bg: 'bg-indigo-500/10',
    label: 'Quiz',
  },
  'item-set': {
    icon: FileText,
    color: 'text-purple-600',
    bg: 'bg-purple-500/10',
    label: 'Item Set',
  },
  review: {
    icon: Clock,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    label: 'Review',
  },
};

export function WeeklyTasks({
  weekNumber,
  tasks,
  onTaskComplete,
  onStartTask,
}: WeeklyTasksProps) {
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const progress = (completedCount / tasks.length) * 100;
  const totalTime = tasks.reduce((sum, t) => sum + t.estimatedTime, 0);

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="mb-1">Week {weekNumber} Tasks</CardTitle>
            <p className="text-sm text-muted-foreground">
              {completedCount} of {tasks.length} completed • ~{totalTime} min total
            </p>
          </div>
          <Badge
            variant={progress === 100 ? 'success' : progress > 0 ? 'warning' : 'secondary'}
          >
            {Math.round(progress)}%
          </Badge>
        </div>
        <Progress value={progress} className="mt-3" />
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {tasks.map((task, index) => {
            const config = taskTypeConfig[task.type];
            const Icon = config.icon;

            return (
              <motion.li
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'flex items-center gap-4 p-4 transition-colors',
                  task.isCompleted
                    ? 'bg-muted/30'
                    : 'hover:bg-muted/50'
                )}
              >
                {/* Checkbox - Manual toggle disabled */}
                <div
                  className={cn(
                    'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-not-allowed opacity-80',
                    task.isCompleted
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-border'
                  )}
                  title="Complete the quiz with 24/30 to mark as finished"
                >
                  {task.isCompleted && <Check className="h-3 w-3 text-white" />}
                </div>

                {/* Task Type Icon */}
                <div className={cn('p-2 rounded-lg', config.bg)}>
                  <Icon className={cn('h-4 w-4', config.color)} />
                </div>

                {/* Task Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p
                      className={cn(
                        'font-medium truncate',
                        task.isCompleted
                          ? 'text-muted-foreground/60 line-through'
                          : 'text-foreground'
                      )}
                    >
                      {task.topic}
                    </p>
                    {(!task.isCompleted && new Date(task.targetDate) < new Date(new Date().setHours(0, 0, 0, 0))) && (
                      <Badge variant="destructive" className="text-[9px] h-4 px-1.5 animate-pulse">
                        Overdue
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-[10px]">
                      {config.label}
                    </Badge>
                    <span>•</span>
                    <span className={cn(
                      (!task.isCompleted && new Date(task.targetDate) < new Date(new Date().setHours(0, 0, 0, 0))) && "text-red-400 font-semibold"
                    )}>
                      {formatDate(task.targetDate)}
                    </span>
                    <span>•</span>
                    <span>{task.estimatedTime} min</span>
                    {!task.isCompleted && (
                      <>
                        <span>•</span>
                        <Badge variant="secondary" className="text-[9px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-bold">
                          Pass: 21/30 Correct
                        </Badge>
                      </>
                    )}
                  </div>
                </div>

                {/* Start Button */}
                {!task.isCompleted && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onStartTask(task)}
                    className="flex-shrink-0"
                  >
                    Start
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </motion.li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

