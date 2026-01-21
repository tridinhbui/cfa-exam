import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, authErrorResponse } from '@/lib/server-auth-utils';

async function isAdmin(uid: string) {
    const user = await prisma.user.findUnique({
        where: { id: uid },
        select: { role: true }
    });
    return user?.role === 'ADMIN';
}

export async function GET(
    req: NextRequest,
    { params }: { params: { userId: string } }
) {
    const auth = await verifyAuth(req);
    if (auth.error) return authErrorResponse(auth);

    const { userId } = params;

    try {
        if (!(await isAdmin(auth.uid!))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const messages = await (prisma as any).supportMessage.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });

        // Mark as read when admin views it
        await (prisma as any).supportMessage.updateMany({
            where: {
                userId,
                isAdmin: false,
                isRead: false
            },
            data: { isRead: true }
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error fetching user support history:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
