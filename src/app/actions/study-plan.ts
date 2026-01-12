'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateStudyPlanExamDate(userId: string, examDate: Date) {
    if (!userId) {
        throw new Error('User ID is required');
    }

    // Find existing active study plan or create one
    const existingPlan = await prisma.studyPlan.findFirst({
        where: {
            userId: userId,
            isActive: true,
        },
    });

    if (existingPlan) {
        await prisma.studyPlan.update({
            where: { id: existingPlan.id },
            data: { examDate },
        });
    } else {
        // Need to get user's CFA Level to create plan correctly
        const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { cfaLevel: true },
        });

        if (!dbUser) {
            throw new Error('User not found in database');
        }

        await prisma.studyPlan.create({
            data: {
                userId: userId,
                name: 'My Study Plan',
                cfaLevel: dbUser.cfaLevel,
                examDate,
                isActive: true,
            },
        });
    }

    revalidatePath('/study-plan');
    return { success: true };
}
