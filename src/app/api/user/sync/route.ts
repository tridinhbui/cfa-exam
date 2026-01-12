import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { uid, email, name, image, password } = await req.json();

        if (!uid || !email) {
            return NextResponse.json({ error: 'Missing uid or email' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase();

        let hashedEmailPassword = null;
        if (password) {
            hashedEmailPassword = await bcrypt.hash(password, 10);
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail }
        });

        // Only update password if user doesn't have one or if it's a new user
        const shouldUpdatePassword = hashedEmailPassword && (!existingUser || !existingUser.password);

        const user = await (prisma.user.upsert as any)({
            where: { email: normalizedEmail },
            update: {
                name,
                image,
                lastActiveAt: new Date(),
                ...(shouldUpdatePassword ? { password: hashedEmailPassword } : {}),
            },
            create: {
                id: uid,
                email: normalizedEmail,
                name,
                image,
                lastActiveAt: new Date(),
                password: hashedEmailPassword,
            },
        });

        // Check for subscription expiration
        if (user.subscription === 'PRO' && user.subscriptionEndsAt) {
            const hasExpired = new Date(user.subscriptionEndsAt) < new Date();

            if (hasExpired) {
                const downgradedUser = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        subscription: 'FREE',
                        subscriptionEndsAt: null,
                    }
                });
                return NextResponse.json(downgradedUser);
            }
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error syncing user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
