import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        // --- Security Check: Verify Firebase ID Token ---
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split('Bearer ')[1];
        try {
            const decodedToken = await adminAuth.verifyIdToken(token);
            if (decodedToken.uid !== userId) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        } catch (error) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

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
