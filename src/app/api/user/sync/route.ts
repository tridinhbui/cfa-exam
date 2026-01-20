import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyAuth, authErrorResponse } from '@/lib/server-auth-utils';
import { rateLimit, getIP } from '@/lib/rate-limit';

export async function POST(req: Request) {
    try {
        // --- Rate Limiting ---
        const ip = getIP(req);
        const { success, remaining, reset } = rateLimit(ip, {
            limit: 50, // 50 requests
            window: 60 * 1000 // per 1 minute
        });

        if (!success) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': '20',
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': reset.toString()
                    }
                }
            );
        }

        const body = await req.json();
        const { uid, email, name, image, password } = body;

        const authResult = await verifyAuth(req, uid);
        if (authResult.error) return authErrorResponse(authResult);

        if (!uid || !email) {
            return NextResponse.json({ error: 'Missing uid or email' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase();

        let hashedEmailPassword = null;
        if (password) {
            hashedEmailPassword = await bcrypt.hash(password, 10);
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { currentStreak: true, longestStreak: true, lastActiveAt: true, password: true }
        });

        // --- Streak Calculation Logic ---
        const todayStr = new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD' in user's potential locale, standardizing on CA for ISO-like format

        let newStreak = 1;
        let newLongestStreak = 1;

        if (existingUser) {
            const lastActiveDateStr = existingUser.lastActiveAt
                ? new Date(existingUser.lastActiveAt).toLocaleDateString('en-CA')
                : null;

            const currentStreak = existingUser.currentStreak || 0;
            const longestStreak = existingUser.longestStreak || 0;

            if (lastActiveDateStr === todayStr) {
                // Already logged in today, keep streak
                newStreak = Math.max(currentStreak, 1);
            } else {
                // Check if yesterday
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toLocaleDateString('en-CA');

                if (lastActiveDateStr === yesterdayStr) {
                    // Consecutive day
                    newStreak = currentStreak + 1;
                } else {
                    // Streak broken (or first time) -> Reset to 1
                    newStreak = 1;
                }
            }
            newLongestStreak = Math.max(newStreak, longestStreak);
        }
        // --------------------------------

        // Only update password if user doesn't have one or if it's a new user
        const shouldUpdatePassword = hashedEmailPassword && (!existingUser || !existingUser.password);

        const user = await (prisma.user.upsert as any)({
            where: { email: normalizedEmail },
            update: {
                ...(name ? { name } : {}),
                ...(image ? { image } : {}),
                lastActiveAt: new Date(),
                currentStreak: newStreak,
                longestStreak: newLongestStreak,
                ...(shouldUpdatePassword ? { password: hashedEmailPassword } : {}),
            },
            create: {
                id: uid,
                email: normalizedEmail,
                ...(name ? { name } : {}),
                ...(image ? { image } : {}),
                lastActiveAt: new Date(),
                currentStreak: 1,
                longestStreak: 1,
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
