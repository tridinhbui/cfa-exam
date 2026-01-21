import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, authErrorResponse } from '@/lib/server-auth-utils';

// GET: Fetch chat history for the current user
export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (auth.error) return authErrorResponse(auth);

    try {
        // Mark all unread messages from admin as read
        await (prisma as any).supportMessage.updateMany({
            where: {
                userId: auth.uid,
                isAdmin: true,
                isRead: false
            },
            data: { isRead: true }
        });

        const messages = await (prisma as any).supportMessage.findMany({
            where: { userId: auth.uid },
            orderBy: { createdAt: 'asc' },
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error fetching support messages:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: User sends a message
export async function POST(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (auth.error) return authErrorResponse(auth);

    try {
        const { content } = await req.json();

        if (!content || content.trim() === '') {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const message = await (prisma as any).supportMessage.create({
            data: {
                userId: auth.uid!,
                content,
                isAdmin: false,
                isRead: false, // For admin to see new messages
            },
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error('Error sending support message:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
