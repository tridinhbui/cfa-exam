import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Fetch most recently practiced topics
        const recentTopics = await prisma.topicPerformance.findMany({
            where: {
                userId,
                lastPracticed: { not: null } // Only fetch topics that have been practiced
            },
            orderBy: { lastPracticed: 'desc' },
            take: 4,
            include: {
                topic: true
            }
        });

        const activities = recentTopics.map(tp => {
            return {
                type: 'Topic',
                topic: tp.topic.name,
                score: Math.round(tp.accuracy),
                date: tp.lastPracticed ? formatDistanceToNow(new Date(tp.lastPracticed), { addSuffix: true }) : '',
            };
        });

        return NextResponse.json(activities);

    } catch (error) {
        console.error('Error fetching recent activity:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
