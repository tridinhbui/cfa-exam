
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format, addMinutes } from 'date-fns';

export const dynamic = 'force-dynamic'; // Disable caching so we always get the latest date

export async function GET() {
    try {
        const today = new Date();

        // Find the first exam window where the END date is in the future
        // We order by startDate ascending to get the nearest one
        const nextExamWindow = await prisma.examWindow.findFirst({
            where: {
                endDate: {
                    gte: today // greater than or equal to today
                },
                isActive: true
            },
            orderBy: {
                startDate: 'asc'
            }
        });

        if (!nextExamWindow) {
            // Fallback if no future dates found in DB
            return NextResponse.json({
                date: '2027-02-01',
                label: 'TBD 2027'
            });
        }

        // Format the label like "Feb 20, 2026"
        // We use date-fns. To prevent timezone shifts (e.g. UTC 00:00 -> Local Previous Day),
        // we essentially want to format the UTC date as-is.
        // A simple trick is to add the timezone offset minutes to the date object so the "local" time matches the UTC time.
        const dateObj = new Date(nextExamWindow.startDate);
        const offset = dateObj.getTimezoneOffset();
        const adjustedDate = addMinutes(dateObj, offset);

        const label = format(adjustedDate, 'MMM d, yyyy');

        return NextResponse.json({
            date: nextExamWindow.startDate.toISOString(), // Send ISO string for client parsing
            label: label
        });

    } catch (error) {
        console.error('Failed to fetch exam date:', error);
        return NextResponse.json({ error: 'Failed to fetch exam date' }, { status: 500 });
    }
}
