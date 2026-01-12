import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay, startOfWeek, endOfWeek, subWeeks, subDays, addDays, format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const clientDate = searchParams.get('date'); // YYYY-MM-DD

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const user = await (prisma.user as any).findUnique({
            where: { id: userId },
            select: {
                currentStreak: true,
                longestStreak: true,
                cfaLevel: true,
                lastActiveAt: true,
                name: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Use client date if provided to align with user's timezone
        const now = clientDate ? new Date(clientDate) : new Date();
        const today = startOfDay(now);
        const dailyProgress = await prisma.dailyProgress.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: today,
                }
            }
        });

        // Get total progress for Average Score
        const totalProgress = await prisma.dailyProgress.aggregate({
            where: { userId },
            _sum: {
                questionsAnswered: true,
                correctAnswers: true,
            }
        });

        const totalQuestions = totalProgress._sum.questionsAnswered || 0;
        const totalCorrect = totalProgress._sum.correctAnswers || 0;
        const averageScore = totalQuestions > 0
            ? Math.round((totalCorrect / totalQuestions) * 100)
            : 0;

        // Current Month Study Time
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        const monthProgress = await prisma.dailyProgress.aggregate({
            where: {
                userId,
                date: { gte: monthStart, lte: monthEnd }
            },
            _sum: { timeSpent: true }
        });
        const timeSpentThisMonth = monthProgress._sum.timeSpent || 0;

        // Last Month Study Time (for Trend)
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));
        const lastMonthProgress = await prisma.dailyProgress.aggregate({
            where: {
                userId,
                date: { gte: lastMonthStart, lte: lastMonthEnd }
            },
            _sum: { timeSpent: true }
        });
        const timeSpentLastMonth = lastMonthProgress._sum.timeSpent || 0;

        // Calculate Trend %
        let monthlyTimeTrend = 0;
        if (timeSpentLastMonth > 0) {
            monthlyTimeTrend = Math.round(((timeSpentThisMonth - timeSpentLastMonth) / timeSpentLastMonth) * 100);
        } else if (timeSpentThisMonth > 0) {
            monthlyTimeTrend = 100; // 100% growth if started from 0
        }

        // Weekly Accuracy Logic
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const lastWeekStart = subWeeks(weekStart, 1);
        const lastWeekEnd = subWeeks(weekEnd, 1);

        const currentWeekStats = await prisma.dailyProgress.aggregate({
            where: {
                userId,
                date: { gte: weekStart, lte: weekEnd }
            },
            _sum: { questionsAnswered: true, correctAnswers: true }
        });

        const lastWeekStats = await prisma.dailyProgress.aggregate({
            where: {
                userId,
                date: { gte: lastWeekStart, lte: lastWeekEnd }
            },
            _sum: { questionsAnswered: true, correctAnswers: true }
        });

        const curWeekTotal = currentWeekStats._sum.questionsAnswered || 0;
        const curWeekCorrect = currentWeekStats._sum.correctAnswers || 0;
        const weeklyAccuracy = curWeekTotal > 0 ? Math.round((curWeekCorrect / curWeekTotal) * 100) : 0;

        const lastWeekTotal = lastWeekStats._sum.questionsAnswered || 0;
        const lastWeekCorrect = lastWeekStats._sum.correctAnswers || 0;
        const lastWeekAccuracy = lastWeekTotal > 0 ? Math.round((lastWeekCorrect / lastWeekTotal) * 100) : 0;

        const weeklyTrend = weeklyAccuracy - lastWeekAccuracy;

        // Chart Data (Last 7 Days)
        const sevenDaysAgo = subDays(startOfDay(now), 6);
        const last7DaysProgress = await prisma.dailyProgress.findMany({
            where: {
                userId,
                date: { gte: sevenDaysAgo }
            },
            orderBy: { date: 'asc' }
        });

        const chartData = [];
        for (let i = 0; i < 7; i++) {
            const d = addDays(sevenDaysAgo, i);
            const dayName = format(d, 'EEE'); // "Mon", "Tue", etc.
            const dateStr = format(d, 'yyyy-MM-dd'); // "2026-01-10" in local time

            // Find stats for this day
            // We compare the YYYY-MM-DD string part. 
            // Prisma returns UTC dates for @db.Date. 
            // We want "2026-01-10" from DB to match "2026-01-10" from chart iteration.
            const dayStats = last7DaysProgress.find(p => {
                const dbDateStr = p.date.toISOString().split('T')[0];
                return dbDateStr === dateStr;
            });

            const acc = dayStats && dayStats.questionsAnswered > 0
                ? Math.round((dayStats.correctAnswers / dayStats.questionsAnswered) * 100)
                : 0;

            chartData.push({
                date: dayName,
                accuracy: acc,
                questionsAnswered: dayStats?.questionsAnswered || 0
            });
        }

        // Get some stats or history if needed
        const stats = {
            name: user.name,
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            cfaLevel: user.cfaLevel,
            questionsToday: dailyProgress?.questionsAnswered || 0,
            correctToday: dailyProgress?.correctAnswers || 0,
            timeSpentToday: dailyProgress?.timeSpent || 0,
            timeSpentThisMonth,
            monthlyTimeTrend,
            averageScore,
            totalQuestions,
            weeklyAccuracy,
            weeklyTrend,
            chartData
        };

        // Error Analysis Logic
        // 1. Fetch Quiz Mistakes
        const quizMistakes = await prisma.quizQuestion.findMany({
            where: {
                quizAttempt: { userId },
                isCorrect: false,
            },
            include: { question: true }
        });

        // 2. Fetch Item Set Mistakes
        const itemSetMistakes = await prisma.itemSetAnswer.findMany({
            where: {
                attempt: { userId },
                isCorrect: false,
            },
            include: { question: true }
        });

        let calcErrors = 0;
        let conceptErrors = 0;

        // Helper to analyze a question
        const analyzeMistake = (q: any) => {
            if (!q) return;
            const content = q.content.toLowerCase();

            // Check explanation and options too for stronger signal
            const combinedText = [
                q.content,
                q.explanation,
                q.optionA,
                q.optionB,
                q.optionC
            ].join(' ').toLowerCase();

            // Heuristic: If question contains math keywords/symbols, assume Calculation Mistake
            const isCalculation =
                content.includes('calculate') ||
                content.includes('compute') ||
                content.includes('value of') ||
                content.includes('closest to') ||
                combinedText.includes('$') ||
                combinedText.includes('\\') || // LaTeX
                combinedText.includes('%') ||
                /[0-9]/.test(content);    // Contains numbers in prompt

            if (isCalculation) {
                calcErrors++;
            } else {
                conceptErrors++;
            }
        };

        // Analyze both sources
        quizMistakes.forEach(m => analyzeMistake(m.question));
        itemSetMistakes.forEach(m => analyzeMistake(m.question));

        const totalMistakes = calcErrors + conceptErrors;
        const errorAnalysis = [
            {
                type: 'Conceptual Error',
                count: conceptErrors,
                percentage: totalMistakes > 0 ? Math.round((conceptErrors / totalMistakes) * 100) : 0
            },
            {
                type: 'Calculation Mistake',
                count: calcErrors,
                percentage: totalMistakes > 0 ? Math.round((calcErrors / totalMistakes) * 100) : 0
            }
        ];

        return NextResponse.json({ ...stats, errorAnalysis });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
