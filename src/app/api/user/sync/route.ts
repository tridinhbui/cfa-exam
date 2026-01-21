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
        const { uid, email, name, image, password, referralCode } = body;

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
            select: { currentStreak: true, longestStreak: true, lastActiveAt: true, password: true, hasRedeemedReferral: true, subscription: true }
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

        // Check Referral Code
        const isReferralValid = referralCode === 'mentis1321';

        // Can only redeem if:
        // 1. Valid code
        // 2. Has NOT redeemed before
        // 3. Is currently FREE (don't downgrade PRO/LIFETIME users)
        const canRedeem = isReferralValid &&
            (!existingUser || !existingUser.hasRedeemedReferral) &&
            (!existingUser || existingUser.subscription === 'FREE');

        const user = await (prisma.user.upsert as any)({
            where: { email: normalizedEmail },
            update: {
                ...(name ? { name } : {}),
                ...(image ? { image } : {}),
                lastActiveAt: new Date(),
                currentStreak: newStreak,
                longestStreak: newLongestStreak,
                ...(shouldUpdatePassword ? { password: hashedEmailPassword } : {}),
                // Apply PRO only if eligible
                ...(canRedeem ? {
                    subscription: 'PRO',
                    subscriptionEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    hasRedeemedReferral: true
                } : {})
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
                subscription: isReferralValid ? 'PRO' : 'FREE',
                subscriptionEndsAt: isReferralValid ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
                hasRedeemedReferral: isReferralValid
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
            }
        }

        // Determine referral result string for frontend feedback
        let referralResult = null;
        if (referralCode === 'mentis1321') {
            if (canRedeem) {
                referralResult = 'SUCCESS';
            } else if (existingUser && existingUser.hasRedeemedReferral) {
                referralResult = 'ALREADY_REDEEMED';
            } else if (existingUser && existingUser.subscription !== 'FREE') {
                referralResult = 'ALREADY_PRO';
            }
        }

        // Sanitize user object to prevent leaking sensitive data (Principle of Least Privilege)
        const safeUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            cfaLevel: user.cfaLevel,
            subscription: user.subscription,
            subscriptionEndsAt: user.subscriptionEndsAt,
            role: user.role,
            createdAt: user.createdAt,
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            lastActiveAt: user.lastActiveAt,
            coins: user.coins,
            chatCount: user.chatCount,
            chatResetTime: user.chatResetTime,
            hasCompletedOnboarding: user.hasCompletedOnboarding,
            hasRedeemedReferral: user.hasRedeemedReferral,
        };

        return NextResponse.json({ ...safeUser, referralResult });
    } catch (error) {
        console.error('Error syncing user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
