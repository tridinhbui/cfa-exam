import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, authErrorResponse } from '@/lib/server-auth-utils';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ moduleId: string }> }
) {
    try {
        const { moduleId } = await params;
        const authResult = await verifyAuth(req);
        if (authResult.error) return authErrorResponse(authResult);

        const { completed } = await req.json();

        const progress = await (prisma as any).userModuleProgress.upsert({
            where: {
                userId_moduleId: {
                    userId: authResult.uid,
                    moduleId: moduleId
                }
            },
            update: {
                isCompleted: completed,
                completedAt: completed ? new Date() : null,
                lastViewed: new Date()
            },
            create: {
                userId: authResult.uid,
                moduleId: moduleId,
                isCompleted: completed,
                completedAt: completed ? new Date() : null
            }
        });

        return NextResponse.json(progress);
    } catch (error) {
        console.error('Failed to update progress:', error);
        return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ moduleId: string }> }
) {
    try {
        const { moduleId } = await params;
        const authResult = await verifyAuth(req);
        if (authResult.error) return authErrorResponse(authResult);

        const progress = await (prisma as any).userModuleProgress.findUnique({
            where: {
                userId_moduleId: {
                    userId: authResult.uid,
                    moduleId: moduleId
                }
            }
        });

        return NextResponse.json({ isCompleted: progress?.isCompleted || false });
    } catch (error) {
        console.error('Failed to fetch progress:', error);
        return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
    }
}
