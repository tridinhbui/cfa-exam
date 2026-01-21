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

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (auth.error) return authErrorResponse(auth);

    try {
        if (!(await isAdmin(auth.uid!))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const count = await (prisma as any).supportMessage.count({
            where: {
                isAdmin: false, // Only count messages FROM users
                isRead: false
            }
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error fetching unread support count:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
