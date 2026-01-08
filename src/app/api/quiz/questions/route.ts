import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const topics = searchParams.get('topics');
    const count = parseInt(searchParams.get('count') || '10');
    const difficulty = searchParams.get('difficulty');

    try {
        let where: any = {};

        if (topics && topics !== 'all') {
            const topicSlugs = topics.split(',');
            where.topic = {
                slug: {
                    in: topicSlugs
                }
            };
        }

        if (difficulty && difficulty !== 'all') {
            where.difficulty = difficulty.toUpperCase();
        }

        // Get all matching questions first
        const allQuestions = await prisma.question.findMany({
            where,
            include: {
                topic: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        // Shuffle the results in memory using Fisher-Yates algorithm for O(M) complexity
        const shuffled = [...allQuestions];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const selected = shuffled.slice(0, count);

        return NextResponse.json(selected);
    } catch (error) {
        console.error('Failed to fetch questions:', error);
        return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }
}
