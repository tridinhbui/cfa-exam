'use client';


import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  ChevronRight,
  Settings,
  Bell,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StudyCalendar } from '@/components/study-plan/study-calendar';
import { WeeklyTasks, WeeklyTask } from '@/components/study-plan/weekly-tasks';
import { addDays } from 'date-fns';

// Mock task data (keep existing tasks for now)
const today = new Date();

const studyTasks = [
  { id: '1', date: today, topic: 'Ethics - Standards I-VII', isCompleted: true },
  { id: '2', date: today, topic: 'Quantitative Methods Review', isCompleted: false },
  { id: '3', date: addDays(today, 1), topic: 'Economics - GDP & Inflation', isCompleted: false },
  { id: '4', date: addDays(today, 2), topic: 'Fixed Income - Duration', isCompleted: false },
  { id: '5', date: addDays(today, 3), topic: 'Equity - DDM Model', isCompleted: false },
  { id: '6', date: addDays(today, 4), topic: 'Derivatives - Options Basics', isCompleted: false },
  { id: '7', date: addDays(today, 5), topic: 'Portfolio Management', isCompleted: false },
  { id: '8', date: addDays(today, 6), topic: 'Weekly Review Quiz', isCompleted: false },
];

const weeklyTasks: WeeklyTask[] = [
  { id: 'w1', topic: 'Ethics Standards Review', type: 'quiz', targetDate: today, isCompleted: true, estimatedTime: 30 },
  { id: 'w2', topic: 'Quantitative Methods - Probability', type: 'quiz', targetDate: today, isCompleted: false, estimatedTime: 25 },
  { id: 'w3', topic: 'Economics Case Study', type: 'item-set', targetDate: addDays(today, 1), isCompleted: false, estimatedTime: 20 },
  { id: 'w4', topic: 'Financial Reporting Analysis', type: 'item-set', targetDate: addDays(today, 2), isCompleted: false, estimatedTime: 25 },
  { id: 'w5', topic: 'Fixed Income Practice', type: 'quiz', targetDate: addDays(today, 3), isCompleted: false, estimatedTime: 30 },
  { id: 'w6', topic: 'Weekly Comprehensive Review', type: 'review', targetDate: addDays(today, 6), isCompleted: false, estimatedTime: 45 },
];

const milestones = [
  { week: 4, title: 'Complete Ethics & Quant', target: 100, current: 85 },
  { week: 8, title: 'Complete FRA & Corporate', target: 100, current: 45 },
  { week: 12, title: 'Full Exam Simulation', target: 100, current: 0 },
];

export default function StudyPlanPage() {
  const [currentWeek] = useState(1);
  const [examInfo, setExamInfo] = useState<{ date: Date | null; label: string; daysRemaining: number }>({
    date: null,
    label: 'Loading...',
    daysRemaining: 0,
  });

  useEffect(() => {
    const fetchExamDate = async () => {
      try {
        const res = await fetch('/api/exam-date');
        if (res.ok) {
          const data = await res.json();
          const examDate = new Date(data.date); // API returns ISO string
          const now = new Date();
          const diffTime = examDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          setExamInfo({
            date: examDate,
            label: data.label,
            daysRemaining: diffDays > 0 ? diffDays : 0
          });
        }
      } catch (error) {
        console.error("Failed to fetch exam date", error);
        // Fallback or error state could go here
        setExamInfo({
          date: new Date('2026-02-17'),
          label: 'Feb 17, 2026 (Est)',
          daysRemaining: 0
        });
      }
    };

    fetchExamDate();
  }, []);

  // Use state values or defaults
  const weeksUntilExam = Math.ceil((examInfo.daysRemaining) / 7);

  const handleTaskComplete = (taskId: string) => {
    console.log('Task completed:', taskId);
  };

  const handleStartTask = (task: WeeklyTask) => {
    console.log('Starting task:', task);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-foreground"
          >
            Study Plan
          </motion.h1>
          <p className="text-muted-foreground mt-1">
            Your personalized 12-week roadmap to exam success
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Reminders
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </Button>
        </div>
      </div>

      {/* Exam Countdown & Progress */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-amber-600/10 to-orange-600/10 border-amber-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-500/20">
                  <Calendar className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-amber-600 font-medium">Exam Date</p>
                  <p className="text-3xl font-bold text-foreground">
                    {examInfo.date ? `${examInfo.daysRemaining} days` : '...'}
                  </p>
                  <p className="text-sm text-muted-foreground">{examInfo.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-500/20">
                  <Target className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Week</p>
                  <p className="text-3xl font-bold text-foreground">Week {currentWeek}</p>
                  <p className="text-sm text-muted-foreground">of {weeksUntilExam} weeks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/20">
                  <TrendingUp className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                  <p className="text-3xl font-bold text-foreground">35%</p>
                  <Progress value={35} className="mt-2 h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Tasks */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <WeeklyTasks
              weekNumber={currentWeek}
              tasks={weeklyTasks}
              onTaskComplete={handleTaskComplete}
              onStartTask={handleStartTask}
            />
          </motion.div>
        </div>

        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-400" />
                Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-muted/50 border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">Week {milestone.week}</Badge>
                    <span
                      className={`text-sm font-semibold ${milestone.current >= milestone.target
                        ? 'text-emerald-400'
                        : milestone.current > 0
                          ? 'text-amber-400'
                          : 'text-slate-500'
                        }`}
                    >
                      {milestone.current}%
                    </span>
                  </div>
                  <p className="text-foreground font-medium mb-2">{milestone.title}</p>
                  <Progress value={milestone.current} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <StudyCalendar
          tasks={studyTasks}
          examDate={examInfo.date || new Date()}
          onTaskClick={(task) => console.log('Task clicked:', task)}
        />
      </motion.div>

      {/* Study Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-gradient-to-r from-indigo-600/10 to-violet-600/10 border-indigo-500/30">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-500/20">
                <Clock className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  Study Tip of the Day
                </h3>
                <p className="text-muted-foreground text-sm">
                  Focus on weak topics first. Your analytics show you need more practice on
                  Derivatives and Fixed Income. Consider spending extra time on these areas this week.
                </p>
              </div>
              <Button>
                Practice Now
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

