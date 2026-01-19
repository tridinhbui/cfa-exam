import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, authErrorResponse } from '@/lib/server-auth-utils';

export async function GET(request: Request) {
    const authResult = await verifyAuth(request);
    if (authResult.error) return authErrorResponse(authResult);

    try {
        // Get total questions count
        const totalQuestions = await prisma.question.count();

        if (totalQuestions === 0) {
            return NextResponse.json({ error: 'No questions found' }, { status: 404 });
        }

        // Use day of the year as a seed so it stays the same for 24h
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        // Simple deterministic random based on day
        const seed = dayOfYear + (totalQuestions % 7);
        const skip = seed % totalQuestions;

        const dailyQuestion = await prisma.question.findFirst({
            skip: skip,
            include: {
                topic: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!dailyQuestion) {
            return NextResponse.json({ error: 'Failed to pick daily question' }, { status: 500 });
        }

        // --- Check if user already did this today correctly ---
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const completion = await prisma.quizQuestion.findFirst({
            where: {
                questionId: dailyQuestion.id,
                isCorrect: true,
                quizAttempt: {
                    userId: authResult.uid,
                    completedAt: {
                        gte: startOfToday
                    }
                }
            }
        });

        return NextResponse.json({
            ...dailyQuestion,
            isCompleted: !!completion
        });
    } catch (error) {
        console.error('Failed to fetch daily question:', error);
        return NextResponse.json({ error: 'Failed to fetch daily question' }, { status: 500 });
    }
}
