import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const topUsers = await (prisma.user as any).findMany({
            take: 3,
            orderBy: {
                coins: 'desc',
            },
            select: {
                id: true,
                name: true,
                image: true,
                coins: true,
            },
        });

        return NextResponse.json(topUsers);
    } catch (error: any) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
