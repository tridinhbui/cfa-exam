import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { uid, email, name, image } = await req.json();

        if (!uid || !email) {
            return NextResponse.json({ error: 'Missing uid or email' }, { status: 400 });
        }

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                name,
                image,
                // Do not update ID if it already exists, or handle it carefully
                // If we want the ID to BE the Firebase UID, we should ensure it's set on create
            },
            create: {
                id: uid,
                email,
                name,
                image,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error syncing user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
