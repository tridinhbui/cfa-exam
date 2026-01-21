import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, authErrorResponse } from '@/lib/server-auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const authResult = await verifyAuth(req);
        if (authResult.error) {
            return authErrorResponse(authResult as { error: string; status: number });
        }

        const userId = authResult.uid as string;

        // Check user role in DB
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden: Admin access only' }, { status: 403 });
        }

        // Fetch all feedback with user details
        const feedbacks = await prisma.feedback.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        // Summarize stats
        const totalFeedback = feedbacks.length;
        if (totalFeedback === 0) {
            return NextResponse.json({
                stats: {
                    averageRating: 0,
                    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                    totalCount: 0
                },
                feedbacks: []
            });
        }

        const ratingSum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
        const averageRating = parseFloat((ratingSum / totalFeedback).toFixed(2));

        const ratingDistribution = feedbacks.reduce((acc, f) => {
            const r = f.rating as keyof typeof acc;
            acc[r] = (acc[r] || 0) + 1;
            return acc;
        }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

        // Categorize text feedback for summary view
        const bugSummary = feedbacks.filter(f => f.bugs).map(f => ({ text: f.bugs, user: f.user.name || f.user.email, date: f.createdAt }));
        const improvementSummary = feedbacks.filter(f => f.improvements).map(f => ({ text: f.improvements, user: f.user.name || f.user.email, date: f.createdAt }));
        const strengthSummary = feedbacks.filter(f => f.strengths).map(f => ({ text: f.strengths, user: f.user.name || f.user.email, date: f.createdAt }));
        const weaknessSummary = feedbacks.filter(f => f.weaknesses).map(f => ({ text: f.weaknesses, user: f.user.name || f.user.email, date: f.createdAt }));

        return NextResponse.json({
            stats: {
                averageRating,
                ratingDistribution,
                totalCount: totalFeedback
            },
            summaries: {
                bugs: bugSummary,
                improvements: improvementSummary,
                strengths: strengthSummary,
                weaknesses: weaknessSummary
            },
            feedbacks: feedbacks // Full list for detailed view
        });

    } catch (error: any) {
        console.error('Admin Feedback API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
