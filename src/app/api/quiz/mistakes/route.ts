import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

        const mistakes = await (prisma as any).wrongQuestion.findMany({
            where: { userId },
            include: {
                question: {
                    include: {
                        topic: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Format for the UI
        const formattedMistakes = mistakes.map((m: any) => ({
            id: m.question.id,
            content: m.question.content,
            optionA: m.question.optionA,
            optionB: m.question.optionB,
            optionC: m.question.optionC,
            correctAnswer: m.question.correctAnswer,
            explanation: m.question.explanation,
            topic: m.question.topic?.name || 'Uncategorized',
            difficulty: m.question.difficulty,
            createdAt: m.createdAt,
        }));

        return NextResponse.json(formattedMistakes);
    } catch (error) {
        console.error('Error fetching mistakes:', error);
        return NextResponse.json({ error: 'Failed to fetch mistakes' }, { status: 500 });
    }
}
