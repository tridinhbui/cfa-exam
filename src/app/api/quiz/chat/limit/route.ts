import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, authErrorResponse } from '@/lib/server-auth-utils';
import { getLimitInfo } from '@/lib/rate-limit';

export const runtime = 'nodejs';

/**
 * API to check user's remaining chat credits
 * Matches the logic in /api/quiz/chat/route.ts
 */
export async function GET(req: NextRequest) {
    try {
        const authResult = await verifyAuth(req);
        if (authResult.error) return authErrorResponse(authResult as any);
        const userId = authResult.uid as string;

        const { prisma } = await import('@/lib/prisma');
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { subscription: true }
        });

        const isFree = !user || user.subscription === 'FREE';
        const isPro = user?.subscription === 'PRO';

        let limitInfo;
        // getLimitInfo is now async and takes userId directly
        if (isFree) {
            const info = await getLimitInfo(userId, { limit: 3, window: 86400000 });
            limitInfo = {
                ...info,
                type: 'FREE',
                limit: 3
            };
        } else {
            const info = await getLimitInfo(userId, { limit: 60, window: 86400000 });
            limitInfo = {
                ...info,
                type: 'PRO',
                limit: 60
            };
        }

        return NextResponse.json(limitInfo);

    } catch (error) {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
