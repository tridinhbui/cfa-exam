import { NextResponse } from 'next/server';

interface RateLimitOption {
    limit: number;    // Maximum number of requests
    window: number;   // Window in milliseconds
}

// In-memory store for rate limiting (Note: This will reset on server restart)
// Using global to persist across HMR in development
const globalForRateLimit = global as unknown as {
    rateLimitMap: Map<string, { count: number; resetTime: number }> | undefined
};

const rateLimitMap = globalForRateLimit.rateLimitMap ?? new Map<string, { count: number; resetTime: number }>();

if (process.env.NODE_ENV !== 'production') {
    globalForRateLimit.rateLimitMap = rateLimitMap;
}

/**
 * Basic in-memory rate limiter
 * @param ip Client IP address
 * @param options Rate limit configuration
 * @returns { success: boolean, remaining: number, reset: number }
 */
export function rateLimit(ip: string, options: RateLimitOption) {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    // If no record or current time is past reset time, start new window
    if (!record || now > record.resetTime) {
        const newRecord = {
            count: 1,
            resetTime: now + options.window
        };
        rateLimitMap.set(ip, newRecord);
        return {
            success: true,
            remaining: options.limit - 1,
            reset: newRecord.resetTime
        };
    }

    // Within window, check if limit exceeded
    if (record.count >= options.limit) {
        return {
            success: false,
            remaining: 0,
            reset: record.resetTime
        };
    }

    // Increment count
    record.count += 1;
    console.log(`[RateLimit] Key: ${ip} | Count: ${record.count}/${options.limit} | Remaining: ${options.limit - record.count}`);
    return {
        success: true,
        remaining: options.limit - record.count,
        reset: record.resetTime
    };
}

/**
 * Check rate limit status without incrementing
 */
export function getLimitInfo(key: string, options: RateLimitOption) {
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
        return {
            count: 0,
            remaining: options.limit,
            resetTime: now + options.window
        };
    }

    console.log(`[LimitInfo] Key: ${key} | Current Count: ${record.count} | Remaining: ${Math.max(0, options.limit - record.count)}`);
    return {
        count: record.count,
        remaining: Math.max(0, options.limit - record.count),
        resetTime: record.resetTime
    };
}

/**
 * Helper to get IP from request headers
 */
export function getIP(req: Request): string {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return '127.0.0.1'; // Fallback for local dev
}
