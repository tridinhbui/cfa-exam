import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay, startOfWeek, endOfWeek, subWeeks } from 'date-fns';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

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

        // Get today's progress
        const now = new Date();
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

        // Get some stats or history if needed
        const stats = {
            name: user.name,
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            cfaLevel: user.cfaLevel,
            questionsToday: dailyProgress?.questionsAnswered || 0,
            correctToday: dailyProgress?.correctAnswers || 0,
            timeSpentToday: dailyProgress?.timeSpent || 0,
            averageScore,
            totalQuestions,
            weeklyAccuracy,
            weeklyTrend
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
