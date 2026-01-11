import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    typescript: true,
});

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not set');
        }
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error: any) {
        console.error('Webhook signature verification failed.', error.message);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // Retrieve userId from metadata we sent during checkout creation
        const userId = session.metadata?.userId;

        if (userId) {
            console.log(`Payment successful for user: ${userId}`);

            const planName = session.metadata?.planName;
            let subscriptionEndsAt: Date | null = null;

            const now = new Date();

            // Calculate end date based on plan
            switch (planName) {
                case '1 Month':
                    subscriptionEndsAt = new Date(now.setMonth(now.getMonth() + 1));
                    break;
                case '6 Months':
                    subscriptionEndsAt = new Date(now.setMonth(now.getMonth() + 6));
                    break;
                case '1 Year':
                    subscriptionEndsAt = new Date(now.setFullYear(now.getFullYear() + 1));
                    break;
                case 'Lifetime':
                    subscriptionEndsAt = null; // No expiration
                    break;
                default:
                    // Default fallback: 30 days if plan name is unknown
                    subscriptionEndsAt = new Date(now.setDate(now.getDate() + 30));
                    break;
            }

            await prisma.user.update({
                where: { id: userId },
                data: {
                    subscription: 'PRO',
                    subscriptionEndsAt: subscriptionEndsAt
                }
            });
        }
    }

    return NextResponse.json({ received: true });
}
