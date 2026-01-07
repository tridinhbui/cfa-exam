import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const topics = searchParams.get('topics');
    const count = parseInt(searchParams.get('count') || '10');

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

        const questions = await prisma.question.findMany({
            where,
            take: count,
            include: {
                topic: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            orderBy: {
                id: 'asc' // or random
            }
        });

        return NextResponse.json(questions);
    } catch (error) {
        console.error('Failed to fetch questions:', error);
        return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }
}
