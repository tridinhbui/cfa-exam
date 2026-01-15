import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, authErrorResponse } from '@/lib/server-auth-utils';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ moduleId: string }> }
) {
    const authResult = await verifyAuth(request);
    if (authResult.error) return authErrorResponse(authResult);

    const { moduleId } = await params;


    try {
        const module = await (prisma as any).module.findUnique({
            where: { id: moduleId },
            include: {
                reading: {
                    include: {
                        book: true
                    }
                },
                quizHeader: {
                    include: {
                        questions: {
                            orderBy: {
                                questionNo: 'asc'
                            }
                        }
                    }
                }
            }
        });

        if (!module) {
            return NextResponse.json({ error: 'Module not found' }, { status: 404 });
        }

        // --- Subscription Lock Check ---
        const user = await prisma.user.findUnique({
            where: { id: authResult.uid },
            select: { subscription: true }
        });

        const isFree = !user || user.subscription === 'FREE';
        const bookId = module.reading.book.id;

        if (isFree && (bookId === 'book-2' || bookId === 'book-3' || bookId === 'book-4')) {
            return NextResponse.json({
                error: 'This curriculum material is reserved for PRO members. Please upgrade to continue learning.',
                isLocked: true
            }, { status: 403 });
        }

        const questions = module.quizHeader?.questions || [];

        // Map ModuleQuiz to QuizQuestion interface for frontend compatibility
        const mappedQuizzes = questions.map((quiz: any) => ({
            id: quiz.id,
            content: quiz.prompt,
            optionA: quiz.optionA,
            optionB: quiz.optionB,
            optionC: quiz.optionC,
            correctAnswer: quiz.correct,
            explanation: quiz.explanation || "No explanation provided.",
            difficulty: "MEDIUM",
            topic: {
                id: module.reading.id,
                name: module.reading.title
            },
            isModuleQuiz: true // Mark as module quiz to skip shadow copy
        }));

        return NextResponse.json({
            moduleTitle: module.title,
            moduleCode: module.code,
            readingTitle: module.reading.title,
            readingId: module.reading.id,
            bookId: module.reading.book.id,
            questions: mappedQuizzes
        });
    } catch (error) {
        console.error('Failed to fetch module quizzes:', error);
        return NextResponse.json({ error: 'Failed to fetch module quizzes' }, { status: 500 });
    }
}
