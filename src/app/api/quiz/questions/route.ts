import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const topics = searchParams.get('topics');
    const count = parseInt(searchParams.get('count') || '10');
    const difficulty = searchParams.get('difficulty');
    const mode = searchParams.get('mode');

    try {
        // EXAM MODE LOGIC (Weighted Distribution)
        // Aim for 180 questions with CFA Level 1 weights
        if (mode === 'EXAM' && count >= 170) {
            const weights: Record<string, number> = {
                'ethics': 32,        // 15-20%
                'quant': 18,         // 8-12%
                'economics': 18,     // 8-12%
                'fra': 27,           // 13-17%
                'corporate': 18,     // 8-12%
                'equity': 20,        // 10-12%
                'fixed-income': 20,  // 10-12%
                'derivatives': 9,    // 5-8%
                'alts': 9,           // 5-8%
                'pm': 9              // 5-8%
            };

            const promises = Object.entries(weights).map(async ([topicId, targetCount]) => {
                // Determine difficulty filter for this topic if needed
                // For Exam mode, usually 'all' difficulties are included
                const where: any = {
                    topic: {
                        // We assume the frontend passes slug-like IDs or we match by topic ID
                        // Based on our seed, ID is 'ethics', 'quant', etc.
                        id: topicId
                    }
                };

                // Fetch random questions for this topic
                // Since Prisma doesn't support RAND() natively in easy way, we fetch more and shuffle
                // Or fetch all valid IDs and sample properties
                // For simplicity/performance on small DB: Fetch 'all' (or up to reasonable limit) then shuffle
                const questions = await prisma.question.findMany({
                    where,
                    include: {
                        topic: { select: { id: true, name: true } }
                    }
                    // take: targetCount * 2 // Fetch slightly more to ensure randomness if possible, but taking 'all' is safer for true random if DB is small
                });

                // Shuffle and slice
                for (let i = questions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [questions[i], questions[j]] = [questions[j], questions[i]];
                }

                return questions.slice(0, targetCount);
            });

            const results = await Promise.all(promises);
            const flatResults = results.flat();

            // Final shuffle of the combined set
            for (let i = flatResults.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [flatResults[i], flatResults[j]] = [flatResults[j], flatResults[i]];
            }

            return NextResponse.json(flatResults);
        }

        // STANDARD / PRACTICE MODE LOGIC (Random Selection)
        let where: any = {};

        if (topics && topics !== 'all') {
            const topicSlugs = topics.split(',');
            where.topic = {
                id: { // Changed from slug to id to match 'ethics', 'quant' etc system
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
