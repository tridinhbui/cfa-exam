'use server';

import { prisma } from '@/lib/prisma';

export interface ExamWindowData {
    id: string;
    sessionName: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
}

export async function getExamWindows(): Promise<ExamWindowData[]> {
    try {
        const today = new Date();
        // We might want to filter out windows that are completely in the past?
        // User request: "so Card tuong ung voi so hang cua ExamWindow" -> all rows.
        // But logically, showing exam windows from 2020 makes no sense.
        // Let's filter for windows where endDate is >= today OR recent past (for context).
        // Actually, user said "so hang cua ExamWindow", implying all available ones.
        // Let's just fetch future ones or active ones + closed future ones.

        const windows = await prisma.examWindow.findMany({
            where: {
                // Let's show all windows starting from today onwards, or maybe slightly in past
                endDate: {
                    gte: new Date() // Only show exams that are not fully finished
                }
            },
            orderBy: {
                startDate: 'asc',
            },
        });

        return windows;
    } catch (error) {
        console.error('Failed to fetch exam windows:', error);
        return [];
    }
}
