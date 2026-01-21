import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, authErrorResponse } from '@/lib/server-auth-utils';

// Helper to check admin role
async function isAdmin(uid: string) {
    const user = await prisma.user.findUnique({
        where: { id: uid },
        select: { role: true }
    });
    return user?.role === 'ADMIN';
}

// GET: Fetch all active conversations for admin dashboard
export async function GET(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (auth.error) return authErrorResponse(auth);

    try {
        if (!(await isAdmin(auth.uid!))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        // Get unique users who have support messages
        const messages = await (prisma as any).supportMessage.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    }
                }
            }
        });

        // Group by user to show in sidebar
        const conversationsMap = new Map<string, any>();
        messages.forEach((msg: any) => {
            if (!conversationsMap.has(msg.userId)) {
                conversationsMap.set(msg.userId, {
                    user: msg.user,
                    lastMessage: msg,
                    unreadCount: 0
                });
            }
            if (!msg.isAdmin && !msg.isRead) {
                const conv = conversationsMap.get(msg.userId);
                conv.unreadCount++;
            }
        });

        return NextResponse.json(Array.from(conversationsMap.values()));
    } catch (error) {
        console.error('Error fetching admin support conversations:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Admin sends a reply to a specific user
export async function POST(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (auth.error) return authErrorResponse(auth);

    try {
        if (!(await isAdmin(auth.uid!))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { userId, content } = await req.json();

        if (!userId || !content) {
            return NextResponse.json({ error: 'UserID and Content are required' }, { status: 400 });
        }

        const message = await (prisma as any).supportMessage.create({
            data: {
                userId,
                content,
                isAdmin: true,
                isRead: false, // User hasn't read this yet
            },
        });

        // Mark all previous messages from this USER as read
        await (prisma as any).supportMessage.updateMany({
            where: {
                userId,
                isAdmin: false,
                isRead: false
            },
            data: { isRead: true }
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error('Error sending admin reply:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
