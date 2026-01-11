import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    typescript: true,
});

// Map your plan names (frontend) to Stripe Price IDs (backend)
// REPLACE THESE WITH YOUR ACTUAL STRIPE PRICE IDs
const PLANS = {
    '1 Month': {
        priceId: 'price_1SoVLOF4LmRGqjOCznaYaURV',
        mode: 'subscription' as const,
    },
    '6 Months': {
        priceId: 'price_1SoVM3F4LmRGqjOCKuTt3sKi',
        mode: 'subscription' as const,
    },
    '1 Year': {
        priceId: 'price_1SoVMmF4LmRGqjOCFml4oBG4',
        mode: 'subscription' as const,
    },
    'Lifetime': {
        priceId: 'price_1SoVNGF4LmRGqjOCtOSzAZQ9',
        mode: 'payment' as const,
    }
};

export async function POST(req: Request) {
    try {
        const { plan, userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized: User ID required' }, { status: 401 });
        }

        const selectedPlan = PLANS[plan as keyof typeof PLANS];
        if (!selectedPlan) {
            return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
        }

        // Get user details for pre-filling email
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true }
        });

        if (!user || !user.email) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: user.email,
            line_items: [
                {
                    price: selectedPlan.priceId,
                    quantity: 1,
                },
            ],
            mode: selectedPlan.mode,
            success_url: `${origin}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/#pricing`,
            metadata: {
                userId: userId,
                planName: plan,
            },
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
