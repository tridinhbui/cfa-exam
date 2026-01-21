import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, authErrorResponse } from '@/lib/server-auth-utils';

export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (auth.error) return authErrorResponse(auth);

    try {
        const count = await (prisma as any).supportMessage.count({
            where: {
                userId: auth.uid,
                isAdmin: true, // Only count messages FROM admin
                isRead: false
            }
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error fetching unread support count for user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
