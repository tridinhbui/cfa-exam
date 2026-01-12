
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addMonths, addYears, addYears as addYearsDate } from 'date-fns';

// PayPal API base URLs
// For production, change to https://api-m.paypal.com
const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

// Helper to get access token from PayPal
async function getPayPalAccessToken() {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('Missing PayPal Credentials');
    }

    const auth = Buffer.from(clientId + ':' + clientSecret).toString('base64');
    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error_description || 'Failed to get access token');
    }
    return data.access_token;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { orderID, userId, planName } = body;

        console.log('Capturing order:', orderID, userId, planName);

        if (!orderID || !userId || !planName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const accessToken = await getPayPalAccessToken();

        // Capture order
        const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderID}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('PayPal capture error:', data);
            return NextResponse.json({ error: 'Failed to capture order', details: data }, { status: 500 });
        }

        if (data.status === 'COMPLETED') {
            // Determine subscription duration
            const now = new Date();
            let endsAt = now;
            let planTypeKey = 'MONTHLY'; // Just for logging or tracking

            switch (planName) {
                case '1 Month':
                    endsAt = addMonths(now, 1);
                    break;
                case '6 Months':
                    endsAt = addMonths(now, 6);
                    break;
                case '1 Year':
                    endsAt = addYears(now, 1);
                    planTypeKey = 'YEARLY';
                    break;
                case 'Lifetime':
                    endsAt = addYears(now, 100); // 100 years = lifetime
                    planTypeKey = 'LIFETIME';
                    break;
            }

            // Update user in DB
            await prisma.user.update({
                where: { id: userId },
                data: {
                    subscription: 'PRO',
                    subscriptionEndsAt: endsAt,
                    updatedAt: new Date(),
                },
            });

            return NextResponse.json({ success: true, status: 'COMPLETED' });
        } else {
            return NextResponse.json({ error: 'Transaction not completed', details: data }, { status: 400 });
        }

    } catch (error) {
        console.error('Processing error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
