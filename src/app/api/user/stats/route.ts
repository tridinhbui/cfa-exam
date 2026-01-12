import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay, startOfWeek, endOfWeek, subWeeks, subDays, addDays, format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const clientDate = searchParams.get('date'); // YYYY-MM-DD

        // --- Security Check: Verify Firebase ID Token ---
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        try {
            const decodedToken = await adminAuth.verifyIdToken(token);
            // Protect against IDOR: Ensure the token UID matches the requested userId
            if (decodedToken.uid !== userId) {
                return NextResponse.json({ error: 'Forbidden: You can only access your own stats' }, { status: 403 });
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
        }
        // ------------------------------------------------

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

        // 1. Run independent basic stats in parallel
        const [
            dailyProgress,
            totalProgress,
            monthProgress,
            lastMonthProgress,
            currentWeekStats,
            lastWeekStats,
            last7DaysProgress
        ] = await Promise.all([
            prisma.dailyProgress.findUnique({
                where: { userId_date: { userId, date: today } }
            }),
            prisma.dailyProgress.aggregate({
                where: { userId },
                _sum: { questionsAnswered: true, correctAnswers: true }
            }),
            prisma.dailyProgress.aggregate({
                where: { userId, date: { gte: startOfMonth(now), lte: endOfMonth(now) } },
                _sum: { timeSpent: true }
            }),
            prisma.dailyProgress.aggregate({
                where: { userId, date: { gte: startOfMonth(subMonths(now, 1)), lte: endOfMonth(subMonths(now, 1)) } },
                _sum: { timeSpent: true }
            }),
            prisma.dailyProgress.aggregate({
                where: { userId, date: { gte: startOfWeek(now, { weekStartsOn: 1 }), lte: endOfWeek(now, { weekStartsOn: 1 }) } },
                _sum: { questionsAnswered: true, correctAnswers: true }
            }),
            prisma.dailyProgress.aggregate({
                where: { userId, date: { gte: subWeeks(startOfWeek(now, { weekStartsOn: 1 }), 1), lte: subWeeks(endOfWeek(now, { weekStartsOn: 1 }), 1) } },
                _sum: { questionsAnswered: true, correctAnswers: true }
            }),
            prisma.dailyProgress.findMany({
                where: { userId, date: { gte: subDays(startOfDay(now), 6) } },
                orderBy: { date: 'asc' }
            })
        ]);

        // 2. Fetch Recent Mistakes only (Optimized for scale - last 50 mistakes)
        const [quizMistakes, itemSetMistakes] = await Promise.all([
            prisma.quizQuestion.findMany({
                where: { quizAttempt: { userId }, isCorrect: false },
                take: 50,
                orderBy: { answeredAt: 'desc' },
                include: { question: { select: { content: true, explanation: true, optionA: true, optionB: true, optionC: true } } }
            }),
            prisma.itemSetAnswer.findMany({
                where: { attempt: { userId }, isCorrect: false },
                take: 50,
                orderBy: { answeredAt: 'desc' },
                include: { question: { select: { content: true, explanation: true, optionA: true, optionB: true, optionC: true } } }
            })
        ]);

        const totalQuestions = totalProgress._sum.questionsAnswered || 0;
        const totalCorrect = totalProgress._sum.correctAnswers || 0;
        const averageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

        const timeSpentThisMonth = monthProgress._sum.timeSpent || 0;
        const timeSpentLastMonth = lastMonthProgress._sum.timeSpent || 0;
        let monthlyTimeTrend = timeSpentLastMonth > 0 ? Math.round(((timeSpentThisMonth - timeSpentLastMonth) / timeSpentLastMonth) * 100) : (timeSpentThisMonth > 0 ? 100 : 0);

        const curWeekTotal = currentWeekStats._sum.questionsAnswered || 0;
        const curWeekCorrect = currentWeekStats._sum.correctAnswers || 0;
        const weeklyAccuracy = curWeekTotal > 0 ? Math.round((curWeekCorrect / curWeekTotal) * 100) : 0;

        const lastWeekTotal = lastWeekStats._sum.questionsAnswered || 0;
        const lastWeekCorrect = lastWeekStats._sum.correctAnswers || 0;
        const lastWeekAccuracy = lastWeekTotal > 0 ? Math.round((lastWeekCorrect / lastWeekTotal) * 100) : 0;
        const weeklyTrend = weeklyAccuracy - lastWeekAccuracy;

        // Chart Data (Last 7 Days)
        const sevenDaysAgo = subDays(startOfDay(now), 6);
        const chartData = Array.from({ length: 7 }).map((_, i) => {
            const d = addDays(sevenDaysAgo, i);
            const dateStr = format(d, 'yyyy-MM-dd');
            const dayStats = last7DaysProgress.find(p => p.date.toISOString().split('T')[0] === dateStr);
            return {
                date: format(d, 'EEE'),
                accuracy: dayStats && dayStats.questionsAnswered > 0 ? Math.round((dayStats.correctAnswers / dayStats.questionsAnswered) * 100) : 0,
                questionsAnswered: dayStats?.questionsAnswered || 0
            };
        });

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

        // Optimized Error Analysis
        let calcErrors = 0;
        let conceptErrors = 0;

        const analyzeMistake = (q: any) => {
            if (!q) return;
            const combinedText = [q.content, q.explanation, q.optionA, q.optionB, q.optionC].join(' ').toLowerCase();
            const isCalculation = combinedText.includes('calculate') ||
                combinedText.includes('compute') ||
                combinedText.includes('value of') ||
                combinedText.includes('closest to') ||
                combinedText.includes('$') ||
                combinedText.includes('\\') ||
                combinedText.includes('%') ||
                /[0-9]/.test(q.content);

            if (isCalculation) calcErrors++; else conceptErrors++;
        };

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
