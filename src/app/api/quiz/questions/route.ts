import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, authErrorResponse } from '@/lib/server-auth-utils';
import { rateLimit, getIP } from '@/lib/rate-limit';

export async function GET(request: Request) {
    // 1. Auth Check
    const authResult = await verifyAuth(request);
    if (authResult.error) return authErrorResponse(authResult);

    const { searchParams } = new URL(request.url);
    const topics = searchParams.get('topics');
    const requestedCount = parseInt(searchParams.get('count') || '10');
    const difficulty = searchParams.get('difficulty');
    const mode = searchParams.get('mode');
    const examIndex = parseInt(searchParams.get('examIndex') || '1');
    const questionId = searchParams.get('questionId');

    // --- Subscription Check ---
    const user = await prisma.user.findUnique({
        where: { id: authResult.uid },
        select: { subscription: true }
    });

    const isFree = !user || user.subscription === 'FREE';

    // --- Access Control Logic ---
    if (isFree) {
        // 1. Block Mock Exam 2 and 3 for free users
        if (mode === 'EXAM' && examIndex > 1) {
            return NextResponse.json({ error: 'Mock Exam 2 and 3 are only available for PRO users' }, { status: 403 });
        }
        // 2. Limit PRACTICE/TIMED to 5 questions (but allow 180 for EXAM 1)
        // Exempt: Single question requests (Daily Quiz) and Mistakes review
        const isExemptMode = mode === 'EXAM' || mode === 'exam' || mode === 'MISTAKES' || mode === 'mistakes';
        if (!questionId && requestedCount > 5 && !isExemptMode) {
            return NextResponse.json({ error: 'FREE users are limited to 5 questions per session' }, { status: 403 });
        }
    }

    const count = requestedCount;

    try {
        // --- SINGLE QUESTION MODE ---
        if (questionId) {
            const question = await prisma.question.findUnique({
                where: { id: questionId },
                include: {
                    topic: { select: { id: true, name: true } }
                }
            });
            return NextResponse.json(question ? [question] : []);
        }

        // --- MISTAKES MODE ---
        if (mode === 'MISTAKES' || mode === 'mistakes') {
            const wrongEntries = await (prisma as any).wrongQuestion.findMany({
                where: { userId: authResult.uid },
                include: {
                    question: {
                        include: {
                            topic: { select: { id: true, name: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: count
            });
            const mistakes = wrongEntries.map((e: any) => e.question);
            return NextResponse.json(mistakes);
        }

        // EXAM MODE LOGIC (Weighted Distribution)
        if (mode === 'EXAM' && count >= 170) {
            const weights: Record<string, number> = {
                'ethics': 32,
                'quant': 18,
                'economics': 18,
                'fra': 27,
                'corporate': 18,
                'equity': 20,
                'fixed-income': 20,
                'derivatives': 9,
                'alts': 9,
                'pm': 9
            };

            const promises = Object.entries(weights).map(async ([topicId, targetCount]) => {
                const where: any = { topic: { id: topicId } };
                const skipCount = (examIndex - 1) * targetCount;

                const questions = await prisma.question.findMany({
                    where,
                    include: {
                        topic: { select: { id: true, name: true } }
                    },
                    orderBy: {
                        id: 'asc'
                    },
                    skip: skipCount,
                    take: targetCount
                });

                return questions;
            });

            const results = await Promise.all(promises);
            const flatResults = results.flat();

            return NextResponse.json(flatResults);
        }

        // STANDARD / PRACTICE MODE LOGIC (Random Selection)
        let where: any = {};

        if (topics && topics !== 'all') {
            const topicSlugs = topics.split(',');
            where.topic = {
                id: {
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

        // Shuffle the results in memory
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
