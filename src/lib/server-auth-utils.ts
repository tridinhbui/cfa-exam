import { adminAuth } from './firebase-admin';
import { NextResponse } from 'next/server';

export async function verifyAuth(req: Request, targetUserId?: string | null) {
    const authHeader = req.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: 'Unauthorized: No token provided', status: 401 };
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);

        // Nếu có targetUserId, kiểm tra xem có khớp với UID của token không (chống IDOR)
        if (targetUserId && decodedToken.uid !== targetUserId) {
            return { error: 'Forbidden: Access denied', status: 403 };
        }

        return { uid: decodedToken.uid, error: null };
    } catch (error) {
        console.error('Auth verification failed:', error);
        return { error: 'Unauthorized: Invalid token', status: 401 };
    }
}

export function authErrorResponse(authResult: { error: string, status: number }) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
}
