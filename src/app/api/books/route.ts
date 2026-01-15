import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, authErrorResponse } from '@/lib/server-auth-utils';

export async function GET(req: Request) {
    try {
        const authResult = await verifyAuth(req);
        if (authResult.error) return authErrorResponse(authResult);

        const user = await prisma.user.findUnique({
            where: { id: authResult.uid },
            select: { subscription: true }
        });

        const isFree = !user || user.subscription === 'FREE';

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

        const formattedBooks = books.map(book => ({
            ...book,
            isLocked: isFree && (book.id === 'book-2' || book.id === 'book-3' || book.id === 'book-4')
        }));

        return NextResponse.json(formattedBooks);
    } catch (error) {
        console.error('Error fetching books:', error);
        return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
    }
}
