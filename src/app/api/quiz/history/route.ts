import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { verifyAuth, authErrorResponse } from '@/lib/server-auth-utils';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        const authResult = await verifyAuth(req, userId);
        if (authResult.error) return authErrorResponse(authResult);

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const attempts = await prisma.quizAttempt.findMany({
            where: {
                userId,
                completedAt: { not: null }
            },
            orderBy: { completedAt: 'desc' },
            take: 5,
        });

        const history = attempts.map(attempt => {
            // Determine "Started at" - approximate using completedAt - (questions * time per question?)
            // Actually we store `startedAt` in DB now (if newly created).
            // For old records without startedAt, use completedAt.

            return {
                id: attempt.id,
                mode: attempt.mode, // 'PRACTICE', 'TIMED'
                startedAt: attempt.startedAt ? format(new Date(attempt.startedAt), 'hh:mm a') : 'Unknown',
                completedAt: attempt.completedAt ? format(new Date(attempt.completedAt), 'hh:mm a') : 'Unknown', // e.g. "10:30 PM"
                totalQuestions: attempt.totalQuestions,
                score: Math.round(attempt.score || 0)
            };
        });

        return NextResponse.json(history);

    } catch (error) {
        console.error('Error fetching quiz history:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
