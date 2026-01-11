import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const topics = await prisma.topic.findMany({
            include: {
                _count: {
                    select: { questions: true }
                },
                topicPerformances: {
                    where: { userId: userId },
                    select: { accuracy: true }
                }
            },
            orderBy: { order: 'asc' }
        });

        const formattedTopics = topics.map(topic => ({
            id: topic.slug,
            name: topic.name,
            questions: topic._count.questions,
            accuracy: topic.topicPerformances.length > 0
                ? Math.round(topic.topicPerformances[0].accuracy)
                : null
        }));

        return NextResponse.json(formattedTopics);
    } catch (error) {
        console.error('Error fetching topics:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
