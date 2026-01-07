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

        const questions = await prisma.$queryRaw<any[]>`
            SELECT q.*, 
                   json_build_object('id', t.id, 'name', t.name) as topic
            FROM "Question" q
            LEFT JOIN "Topic" t ON q."topicId" = t.id
            WHERE (${where.topic ? `t.slug IN (${where.topic.slug.in.map((s: string) => `'${s}'`).join(',')})` : '1=1'})
            AND (${where.difficulty ? `q.difficulty = '${where.difficulty}'` : '1=1'})
            ORDER BY RANDOM()
            LIMIT ${count}
        `;

        return NextResponse.json(questions);
    } catch (error) {
        console.error('Failed to fetch questions:', error);
        return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }
}
