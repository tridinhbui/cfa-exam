import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit, getIP } from './lib/rate-limit';

export function middleware(request: NextRequest) {
    // Only apply to API routes
    if (request.nextUrl.pathname.startsWith('/api')) {
        const ip = getIP(request);
        const path = request.nextUrl.pathname;

        // 1. Strict limit for AI Chat and Auth-sensitive actions
        if (path.includes('/api/quiz/chat') || path.includes('/update-password')) {
            const result = rateLimit(`strict_${ip}`, { limit: 10, window: 60000 });
            if (!result.success) {
                return NextResponse.json(
                    { error: 'Too many requests. Please slow down.' },
                    { status: 429 }
                );
            }
        }

        // 2. Medium limit for Database mutations (POST/PUT/DELETE) and Quiz Generation
        else if (['POST', 'PUT', 'DELETE'].includes(request.method) || path.includes('/api/quiz/questions')) {
            const result = rateLimit(`medium_${ip}`, { limit: 30, window: 60000 });
            if (!result.success) {
                return NextResponse.json(
                    { error: 'System is busy. Please try again in a minute.' },
                    { status: 429 }
                );
            }
        }

        // 3. General limit for all other API calls (GET)
        else {
            const result = rateLimit(`general_${ip}`, { limit: 150, window: 60000 });
            if (!result.success) {
                return NextResponse.json(
                    { error: 'General rate limit exceeded.' },
                    { status: 429 }
                );
            }
        }
    }

    return NextResponse.next();
}

// Optionally, specify paths to run middleware on
export const config = {
    matcher: '/api/:path*',
};
