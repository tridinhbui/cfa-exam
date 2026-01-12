'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { addDays, differenceInWeeks, startOfWeek } from 'date-fns';

export async function updateStudyPlanExamDate(userId: string, examDate: Date) {
    if (!userId) {
        throw new Error('User ID is required');
    }

    // 1. Get user and topics
    const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { cfaLevel: true },
    });

    if (!dbUser) {
        throw new Error('User not found');
    }

    const topics = await prisma.topic.findMany({
        where: { cfaLevel: dbUser.cfaLevel },
        orderBy: { order: 'asc' },
    });

    // 2. Clear existing plan to generate a fresh one
    await prisma.studyPlan.deleteMany({
        where: { userId, isActive: true }
    });

    // 3. Create new Study Plan
    const studyPlan = await prisma.studyPlan.create({
        data: {
            userId,
            name: 'My Custom Study Plan',
            cfaLevel: dbUser.cfaLevel,
            examDate,
            isActive: true,
        }
    });

    // 4. Calculate distributions
    const startDate = new Date();
    const totalWeeks = Math.max(differenceInWeeks(examDate, startDate), 4); // Assume at least 4 weeks for a valid plan
    const reviewWeeks = Math.min(Math.max(Math.floor(totalWeeks * 0.2), 1), 4); // At least 1 week review
    const learningWeeks = Math.max(totalWeeks - reviewWeeks, 1); // At least 1 week learning

    // Distribute topics over learning weeks
    // Simple distribution: topics / learningWeeks
    for (let i = 0; i < topics.length; i++) {
        const topic = topics[i];

        // Calculate which week this topic belongs to
        // We spread topics evenly across learning weeks
        const weekIndex = Math.min(Math.floor((i / topics.length) * learningWeeks), learningWeeks - 1);
        const weekNumber = weekIndex + 1;

        // Target date is the end of that week
        const targetDate = addDays(startOfWeek(startDate), (weekNumber * 7) - 1);

        await prisma.studyPlanItem.create({
            data: {
                studyPlanId: studyPlan.id,
                topicId: topic.id,
                weekNumber,
                targetDate,
                isCompleted: false,
            }
        });
    }

    revalidatePath('/study-plan');
    return { success: true, planId: studyPlan.id };
}

export async function getActiveStudyPlan(userId: string) {
    if (!userId) return null;

    return await prisma.studyPlan.findFirst({
        where: { userId, isActive: true },
        include: {
            items: {
                include: { topic: true },
                orderBy: { weekNumber: 'asc' }
            }
        }
    });
}

export async function toggleStudyItemCompletion(itemId: string, isCompleted: boolean) {
    const updatedItem = await prisma.studyPlanItem.update({
        where: { id: itemId },
        data: {
            isCompleted,
            completedAt: isCompleted ? new Date() : null
        }
    });

    revalidatePath('/study-plan');
    return updatedItem;
}
