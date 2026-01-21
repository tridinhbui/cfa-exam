import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, authErrorResponse } from '@/lib/server-auth-utils';

export async function POST(req: NextRequest) {
    try {
        console.log('Feedback POST started');
        const authResult = await verifyAuth(req);
        if (authResult.error) {
            console.error('Feedback Auth Error:', authResult.error);
            return authErrorResponse(authResult as { error: string; status: number });
        }
        const userId = authResult.uid as string;
        console.log('Feedback User ID:', userId);

        const body = await req.json();
        console.log('Feedback Body:', body);
        const { rating, category, strengths, weaknesses, bugs, improvements } = body;

        if (!rating) {
            return NextResponse.json({ error: 'Rating is required' }, { status: 400 });
        }

        const feedback = await prisma.feedback.create({
            data: {
                userId,
                rating: Number(rating),
                category,
                strengths,
                weaknesses,
                bugs,
                improvements,
            },
        });

        console.log('Feedback created successfully:', feedback.id);
        return NextResponse.json({ success: true, feedback });
    } catch (error: any) {
        console.error('Feedback API Error Detail:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
