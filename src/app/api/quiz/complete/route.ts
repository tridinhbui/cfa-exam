import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay, subDays, isSameDay } from 'date-fns';

export async function POST(req: Request) {
    try {
        const { userId, correctAnswers, totalQuestions, timeSpent, topics } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // 1. Get user to check current streak and lastActiveAt
        const user = await (prisma.user.findUnique as any)({
            where: { id: userId },
            select: {
                id: true,
                currentStreak: true,
                longestStreak: true,
                lastActiveAt: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const now = new Date();
        const today = startOfDay(now);
        let newStreak = (user as any).currentStreak;

        // 2. Logic to update Streak
        if (!(user as any).lastActiveAt) {
            // First time ever
            newStreak = 1;
        } else {
            const lastActiveDate = startOfDay(new Date((user as any).lastActiveAt));

            if (isSameDay(today, lastActiveDate)) {
                // Already active today, streak stays the same
                newStreak = (user as any).currentStreak;
            } else {
                const yesterday = startOfDay(subDays(today, 1));
                if (isSameDay(lastActiveDate, yesterday)) {
                    // Active yesterday, increment streak
                    newStreak = (user as any).currentStreak + 1;
                } else if (lastActiveDate < yesterday) {
                    // Missed a day or more, reset to 1
                    newStreak = 1;
                }
            }
        }

        const newLongestStreak = Math.max(newStreak, (user as any).longestStreak);

        // 3. Update User and DailyProgress in a transaction
        await prisma.$transaction([
            // Update User streaks
            (prisma.user.update as any)({
                where: { id: userId },
                data: {
                    currentStreak: newStreak,
                    longestStreak: newLongestStreak,
                    lastActiveAt: now,
                }
            }),
            // Upsert DailyProgress
            prisma.dailyProgress.upsert({
                where: {
                    userId_date: {
                        userId,
                        date: today,
                    }
                },
                update: {
                    questionsAnswered: { increment: totalQuestions },
                    correctAnswers: { increment: correctAnswers },
                    timeSpent: { increment: timeSpent || 0 },
                    sessionsCount: { increment: 1 },
                },
                create: {
                    userId,
                    date: today,
                    questionsAnswered: totalQuestions,
                    correctAnswers: correctAnswers,
                    timeSpent: timeSpent || 0,
                    sessionsCount: 1,
                }
            })
        ]);

        return NextResponse.json({
            success: true,
            currentStreak: newStreak,
            longestStreak: newLongestStreak
        });

    } catch (error) {
        console.error('Error completing quiz:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
