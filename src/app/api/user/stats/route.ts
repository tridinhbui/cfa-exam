import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfDay } from 'date-fns';

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
        const today = startOfDay(new Date());
        const dailyProgress = await prisma.dailyProgress.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: today,
                }
            }
        });

        // Get some stats or history if needed
        const stats = {
            name: user.name,
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            cfaLevel: user.cfaLevel,
            questionsToday: dailyProgress?.questionsAnswered || 0,
            correctToday: dailyProgress?.correctAnswers || 0,
            timeSpentToday: dailyProgress?.timeSpent || 0,
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
