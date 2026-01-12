import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, authErrorResponse } from '@/lib/server-auth-utils';

export async function GET(req: Request) {
    try {
        const authResult = await verifyAuth(req);
        if (authResult.error) return authErrorResponse(authResult);

        const books = await prisma.book.findMany({
            include: {
                readings: {
                    include: {
                        modules: {
                            orderBy: {
                                order: 'asc',
                            },
                        },
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },

            },
        });
        return NextResponse.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
    }
}
