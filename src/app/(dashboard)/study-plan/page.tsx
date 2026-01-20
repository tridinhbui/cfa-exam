'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  ChevronRight,
  Settings,
  Bell,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StudyCalendar } from '@/components/study-plan/study-calendar';
import { WeeklyTasks, WeeklyTask } from '@/components/study-plan/weekly-tasks';
import { addDays, differenceInDays } from 'date-fns';
import { ExamWindowSelector } from '@/components/study-plan/exam-window-selector';
import { useExamStore } from '@/store/exam-store';
import { useAuth } from '@/context/auth-context';
import { updateStudyPlanExamDate, getActiveStudyPlan, toggleStudyItemCompletion } from '@/app/actions/study-plan';

export default function StudyPlanPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { date: storedExamDate, label: examLabel, setExam, daysRemaining } = useExamStore();
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any>(null);

  const fetchPlan = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const activePlan = await getActiveStudyPlan(user.uid);
      setPlan(activePlan);
      if (activePlan?.examDate) {
        setExam(user.uid, new Date(activePlan.examDate), activePlan.name);
      }
    } catch (err) {
      console.error('Failed to fetch plan:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, setExam]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  useEffect(() => {
    if (!loading && !plan && !storedExamDate) {
      setIsCustomizeOpen(true);
    }
  }, [loading, plan, storedExamDate]);

  const todayStr = new Date().toLocaleDateString('en-CA');
  const today = new Date(todayStr + 'T00:00:00Z');

  const daysLeft = plan?.examDate ? Math.round((new Date(new Date(plan.examDate).toLocaleDateString('en-CA') + 'T00:00:00Z').getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : daysRemaining();
  const weeksUntilExam = Math.max(Math.ceil(daysLeft / 7), 1);

  // Calculate current week (simple version: based on time passed since plan start)
  const startDateStr = plan?.startDate ? new Date(plan.startDate).toLocaleDateString('en-CA') : todayStr;
  const startDate = new Date(startDateStr + 'T00:00:00Z');
  const currentWeek = Math.min(Math.max(Math.round((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) / 7 + 1, 1), weeksUntilExam);

  // Map real data to component interfaces
  const allTasks = plan?.items.map((item: any) => ({
    id: item.id,
    topic: item.topic.name,
    topicId: item.topic.id,
    type: item.weekNumber === 1 ? 'review' : 'quiz',
    targetDate: new Date(item.targetDate),
    isCompleted: item.isCompleted,
    estimatedTime: 45,
    weekNumber: item.weekNumber,
  })) || [];

  // Filter: Show only current week tasks OR tasks from previous weeks that aren't completed
  const currentWeekNumber = Math.floor(currentWeek);
  const displayTasks = allTasks.filter((task: any) =>
    task.weekNumber === currentWeekNumber || (!task.isCompleted && task.weekNumber < currentWeekNumber)
  );

  const studyTasks = plan?.items.map((item: any) => ({
    id: item.id,
    date: new Date(item.targetDate),
    topic: item.topic.name,
    isCompleted: item.isCompleted,
  })) || [];

  // Overall progress
  const completedTasks = plan?.items.filter((i: any) => i.isCompleted).length || 0;
  const totalTasks = plan?.items.length || 1;
  const overallProgress = Math.round((completedTasks / totalTasks) * 100);

  const handleTaskComplete = async (taskId: string) => {
    // Manual completion is now blocked per user request
    // Users must achieve 24/30 in a quiz to complete
    console.log('Manual completion is disabled. Finish the quiz with 80%+ to complete.');
    return;
  };

  const handleStartTask = (task: WeeklyTask) => {
    // Navigate to quiz with 30 random questions for this topic
    // Pass studyPlanItemId to link results back
    router.push(`/quiz/session?topics=${task.topicId}&count=30&mode=practice&studyPlanItemId=${task.id}`);
  };

  const handleExamSelect = async (date: Date, label: string) => {
    if (user?.uid) {
      setExam(user.uid, date, label);
      setLoading(true);
      try {
        await updateStudyPlanExamDate(user.uid, date);
        await fetchPlan();
      } catch (error) {
        console.error('Failed to update study plan:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !plan) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            Your personalized roadmap to exam success
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Reminders
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsCustomizeOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </Button>
          <ExamWindowSelector
            open={isCustomizeOpen}
            onOpenChange={setIsCustomizeOpen}
            currentSelectedDate={plan?.examDate ? new Date(plan.examDate) : storedExamDate}
            onSelect={handleExamSelect}
          />
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
                    {daysLeft > 0 ? `${daysLeft} days` : 'Exam Day!'}
                  </p>
                  <p className="text-sm text-muted-foreground">{examLabel || 'Not set'}</p>
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
                  <p className="text-sm text-muted-foreground">Current Progress</p>
                  <p className="text-3xl font-bold text-foreground">Week {Math.floor(currentWeek)}</p>
                  <p className="text-sm text-muted-foreground">in your journey</p>
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
                  <p className="text-sm text-muted-foreground">Topics Mastered</p>
                  <p className="text-3xl font-bold text-foreground">{overallProgress}%</p>
                  <Progress value={overallProgress} className="mt-2 h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Tasks - Showing items from current week or next pending */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <WeeklyTasks
              weekNumber={Math.floor(currentWeek)}
              tasks={displayTasks}
              onTaskComplete={handleTaskComplete}
              onStartTask={handleStartTask}
            />
          </motion.div>
        </div>

        {/* Plan Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-400" />
                Key Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Ethics & Quant', week: 2, p: allTasks.slice(0, 2).filter((t: any) => t.isCompleted).length / 2 * 100 },
                { label: 'FRA & Corporate', week: 5, p: allTasks.slice(2, 5).filter((t: any) => t.isCompleted).length / 3 * 100 },
                { label: 'Final Review', week: weeksUntilExam - 2, p: 0 }
              ].map((milestone, index) => (
                <div key={index} className="p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">Target Week {milestone.week}</Badge>
                    <span className="text-sm font-semibold text-indigo-400">{Math.round(milestone.p)}%</span>
                  </div>
                  <p className="text-foreground font-medium mb-2">{milestone.label}</p>
                  <Progress value={milestone.p} className="h-2" />
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
          examDate={plan?.examDate ? new Date(plan.examDate) : (storedExamDate || new Date())}
          onTaskClick={(task) => console.log('Task clicked:', task)}
        />
      </motion.div>
    </div>
  );
}
