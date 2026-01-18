import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, authErrorResponse } from '@/lib/server-auth-utils';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ moduleId: string }> }
) {
    try {
        const { moduleId } = await params;
        const authResult = await verifyAuth(req);
        if (authResult.error) return authErrorResponse(authResult);

        console.log(`FETCHING_LESSON: ${moduleId}`);

        if (!(prisma as any).lessonContent) {
            console.error('CRITICAL: prisma.lessonContent is undefined. Prisma client may need regeneration.');
            return NextResponse.json({ error: 'Internal server error: DB schema out of sync' }, { status: 500 });
        }

        const lesson = await (prisma as any).lessonContent.findUnique({
            where: { moduleId },
            include: {
                module: {
                    select: {
                        title: true,
                        code: true,
                        reading: {
                            select: {
                                title: true,
                                bookId: true,
                                order: true
                            }
                        }
                    }
                }
            }
        });

        if (!lesson) {
            // Return 404 but with some module info if possible
            const moduleInfo = await prisma.module.findUnique({
                where: { id: moduleId },
                include: { reading: true }
            });
            return NextResponse.json({
                error: 'Lesson not found',
                module: moduleInfo
            }, { status: 404 });
        }

        return NextResponse.json(lesson);
    } catch (error) {
        console.error('Error fetching lesson:', error);
        return NextResponse.json({ error: 'Failed to fetch lesson' }, { status: 500 });
    }
}
