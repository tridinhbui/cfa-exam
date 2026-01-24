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

        // Use raw SQL to be 100% sure we get the data from the DB bypassing any Prisma Client caching/type issues
        const results = await prisma.$queryRawUnsafe<any[]>(
            `SELECT lc.id, lc."moduleId", lc.content, lc."videoUrl", lc."updatedAt",
                    m.title as "moduleTitle", m.code as "moduleCode",
                    r.title as "readingTitle", r."bookId", r."order" as "readingOrder"
             FROM "LessonContent" lc
             JOIN "Module" m ON lc."moduleId" = m.id
             JOIN "Reading" r ON m."readingId" = r.id
             WHERE lc."moduleId" = $1`,
            moduleId
        );

        if (!results || results.length === 0) {
            // Fallback to fetch just module info if content doesn't exist
            const moduleInfo = await prisma.module.findUnique({
                where: { id: moduleId },
                include: { reading: true }
            });
            return NextResponse.json({
                error: 'Lesson not found',
                module: moduleInfo
            }, { status: 404 });
        }

        const data = results[0];

        // Reconstruct expected object structure
        const lesson = {
            id: data.id,
            moduleId: data.moduleId,
            content: data.content,
            videoUrl: data.videoUrl,
            updatedAt: data.updatedAt,
            module: {
                title: data.moduleTitle,
                code: data.moduleCode,
                reading: {
                    title: data.readingTitle,
                    bookId: data.bookId,
                    order: data.readingOrder
                }
            }
        };



        return NextResponse.json(lesson, {
            headers: {
                'Cache-Control': 'no-store, must-revalidate'
            }
        });
    } catch (error) {
        console.error('Error fetching lesson (RAW SQL):', error);
        return NextResponse.json({ error: 'Failed to fetch lesson' }, { status: 500 });
    }
}
