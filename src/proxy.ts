import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit, getIP } from './lib/rate-limit';

export function proxy(request: NextRequest) {
    // Only apply to API routes
    if (request.nextUrl.pathname.startsWith('/api')) {
        const ip = getIP(request);
        const path = request.nextUrl.pathname;

        // 1. Strict limit for Auth-sensitive actions (Password update)
        if (path.includes('/api/user/update-password')) {
            const result = rateLimit(`password_upd_${ip}`, {
                limit: 3,
                window: 3600 * 1000 // 3 times per hour
            });
            if (!result.success) {
                return NextResponse.json(
                    { error: 'Too many password update attempts. Please try again in an hour.' },
                    { status: 429 }
                );
            }
            return NextResponse.next(); // Priority handled, skip global
        }

        // 2. Strict limit for Quiz Questions (Protecting database/content)
        if (path.includes('/api/quiz/questions')) {
            const result = rateLimit(`q_limit_${ip}`, {
                limit: 5,
                window: 60 * 1000 // 5 times per minute
            });
            if (!result.success) {
                return NextResponse.json(
                    { error: 'Too many requests for questions. Please slow down.' },
                    { status: 429 }
                );
            }
            return NextResponse.next(); // Priority handled, skip global
        }

        // 3. Global Baseline for all other API calls
        const globalResult = rateLimit(`global_api_${ip}`, {
            limit: 100,
            window: 60 * 1000 // 100 requests per minute total
        });

        if (!globalResult.success) {
            return NextResponse.json(
                { error: 'System is busy (Global rate limit exceeded). Please try again in a minute.' },
                { status: 429 }
            );
        }
    }

    return NextResponse.next();
}

// Optionally, specify paths to run middleware on
export const config = {
    matcher: '/api/:path*',
};
