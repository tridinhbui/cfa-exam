import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { addDays, addMonths, addYears } from 'date-fns';

export async function POST(req: Request) {
    try {
        const { userId, planName } = await req.json();

        if (!userId || !planName) {
            return NextResponse.json({ error: 'Missing userId or planName' }, { status: 400 });
        }

        let expirationDate = new Date();

        switch (planName) {
            case '1 Month':
                expirationDate = addMonths(new Date(), 1);
                break;
            case '6 Months':
                // User gets 6 months + 1 free month = 7 months
                expirationDate = addMonths(new Date(), 7);
                break;
            case '1 Year':
                expirationDate = addYears(new Date(), 1);
                break;
            case 'Lifetime':
                // Set to 100 years from now
                expirationDate = addYears(new Date(), 100);
                break;
            default:
                expirationDate = addMonths(new Date(), 1);
        }

        // Update user's subscription in DB
        await prisma.user.update({
            where: { id: userId },
            data: {
                subscription: 'PRO',
                subscriptionEndsAt: expirationDate
            }
        });

        return NextResponse.json({ success: true, message: 'Plan updated successfully' });

    } catch (error) {
        console.error('Error updating plan:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
