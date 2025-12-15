'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

interface StudyTask {
  id: string;
  date: Date;
  topic: string;
  isCompleted: boolean;
}

interface StudyCalendarProps {
  tasks: StudyTask[];
  examDate: Date;
  onTaskClick?: (task: StudyTask) => void;
}

export function StudyCalendar({
  tasks,
  examDate,
  onTaskClick,
}: StudyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDay = (date: Date) =>
    tasks.filter((task) => isSameDay(new Date(task.date), date));

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardHeader className="border-b border-slate-800">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            Study Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-white min-w-[140px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-slate-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isExamDay = isSameDay(day, examDate);

            return (
              <motion.div
                key={day.toISOString()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className={cn(
                  'min-h-[80px] p-2 rounded-lg border transition-all cursor-pointer hover:border-indigo-500/50',
                  isCurrentMonth
                    ? 'bg-slate-800/30 border-slate-800'
                    : 'bg-slate-900/30 border-slate-900',
                  isToday(day) && 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950',
                  isExamDay && 'bg-red-500/10 border-red-500/50'
                )}
                onClick={() => dayTasks[0] && onTaskClick?.(dayTasks[0])}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isCurrentMonth ? 'text-slate-300' : 'text-slate-600',
                      isToday(day) && 'text-indigo-400',
                      isExamDay && 'text-red-400 font-bold'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {isExamDay && (
                    <Badge variant="destructive" className="text-[10px] px-1.5">
                      EXAM
                    </Badge>
                  )}
                </div>

                {/* Task indicators */}
                {dayTasks.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          'flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded',
                          task.isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        )}
                      >
                        {task.isCompleted ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        <span className="truncate">{task.topic}</span>
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <span className="text-[10px] text-slate-500">
                        +{dayTasks.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-3 h-3 rounded bg-emerald-500/20" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-3 h-3 rounded bg-amber-500/20" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-3 h-3 rounded bg-red-500/20" />
            <span>Exam Day</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

