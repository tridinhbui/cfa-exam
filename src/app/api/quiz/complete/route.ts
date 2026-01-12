import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, subDays, isSameDay } from 'date-fns';

export async function POST(req: Request) {
    try {
        const { userId, correctAnswers, totalQuestions, timeSpent, topicPerformance, date, mode, questions, answers } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // 1. Get user to check current streak and lastActiveAt
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                currentStreak: true,
                longestStreak: true,
                lastActiveAt: true,
                cfaLevel: true, // Needed for QuizAttempt
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const now = new Date();
        const today = date ? new Date(date) : startOfDay(now);
        let newStreak = user.currentStreak;

        // 2. Logic to update Streak
        if (!user.lastActiveAt) {
            newStreak = 1;
        } else {
            const lastActiveDate = startOfDay(new Date(user.lastActiveAt));

            if (isSameDay(today, lastActiveDate)) {
                newStreak = user.currentStreak;
            } else {
                const yesterday = startOfDay(subDays(today, 1));
                if (isSameDay(lastActiveDate, yesterday)) {
                    newStreak = user.currentStreak + 1;
                } else if (lastActiveDate < yesterday) {
                    newStreak = 1;
                }
            }
        }

        const newLongestStreak = Math.max(newStreak, user.longestStreak);

        // Prepare TopicPerformance updates
        const topicUpdates: any[] = [];
        /* 
        // DISABLED per user request: Only update DailyProgress, not TopicPerformance
        if (topicPerformance) {
            const topicIds = Object.keys(topicPerformance);

            const existingPerformances = await prisma.topicPerformance.findMany({
                where: {
                    userId,
                    topicId: { in: topicIds }
                }
            });

            const performanceMap = new Map(existingPerformances.map((p: any) => [p.topicId, p]));

            for (const [topicId, stats] of Object.entries(topicPerformance) as [string, { correct: number, total: number }][]) {
                const existing = performanceMap.get(topicId);
                const currentTotal = (existing?.totalAttempts || 0);
                const currentCorrect = (existing?.correctCount || 0);

                const newTotal = currentTotal + stats.total;
                const newCorrect = currentCorrect + stats.correct;
                const newAccuracy = newTotal > 0 ? (newCorrect / newTotal) * 100 : 0;

                topicUpdates.push(
                    prisma.topicPerformance.upsert({
                        where: {
                            userId_topicId: { userId, topicId }
                        },
                        update: {
                            totalAttempts: newTotal,
                            correctCount: newCorrect,
                            accuracy: newAccuracy,
                            lastPracticed: now,
                        },
                        create: {
                            userId,
                            topicId,
                            totalAttempts: stats.total,
                            correctCount: stats.correct,
                            accuracy: newAccuracy,
                            lastPracticed: now,
                        }
                    })
                );
            }
        }
        */

        // Create QuizAttempt
        // We'll create it even if we don't have detailed questionsData, just to track history.
        const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        const quizAttemptCreate = prisma.quizAttempt.create({
            data: {
                userId,
                cfaLevel: user.cfaLevel || 'LEVEL_1', // Default or fetch from user
                mode: mode ? mode.toUpperCase() : 'PRACTICE',
                startedAt: new Date(now.getTime() - (timeSpent * 1000)), // Approximate start time
                completedAt: now,
                score,
                totalQuestions,
                correctAnswers,
            }
        });

        // 3. Update User, DailyProgress, TopicPerformance, and create QuizAttempt in a transaction
        const results = await prisma.$transaction([
            // Update User streaks
            prisma.user.update({
                where: { id: userId },
                data: {
                    currentStreak: newStreak,
                    longestStreak: newLongestStreak,
                    lastActiveAt: now,
                }
            }),
            // Upsert DailyProgress
            prisma.dailyProgress.upsert({
                where: {
                    userId_date: {
                        userId,
                        date: today,
                    }
                },
                update: {
                    questionsAnswered: { increment: totalQuestions },
                    correctAnswers: { increment: correctAnswers },
                    timeSpent: { increment: timeSpent || 0 },
                    sessionsCount: { increment: 1 },
                },
                create: {
                    userId,
                    date: today,
                    questionsAnswered: totalQuestions,
                    correctAnswers: correctAnswers,
                    timeSpent: timeSpent || 0,
                    sessionsCount: 1,
                }
            }),
            ...topicUpdates,
            quizAttemptCreate
        ]);

        const quizAttempt = results[results.length - 1] as any;

        // 4. SHADOW COPY LOGIC: Save incorrect answers for Error Analysis
        if (quizAttempt && questions && answers && Array.isArray(questions)) {
            try {
                const incorrectQuestions = questions.filter((q: any) => {
                    const userAns = answers[q.id];
                    return userAns && userAns !== q.correctAnswer;
                });

                if (incorrectQuestions.length > 0) {
                    // Cache a fallback topic ID in case questions don't have one
                    const fallbackTopic = await prisma.topic.findFirst();

                    for (const badQ of incorrectQuestions) {
                        // Check if this question content already exists in 'Question' table
                        let questionRecord = await prisma.question.findFirst({
                            where: { content: badQ.content }
                        });

                        if (!questionRecord && user.cfaLevel) {
                            try {
                                // Validate Topic ID before insertion
                                let validTopicId = badQ.topic?.id;

                                // Check if topic exists in Topic table (it might be a Reading ID from Module Quiz)
                                if (validTopicId) {
                                    const topicExists = await prisma.topic.findUnique({
                                        where: { id: validTopicId },
                                        select: { id: true }
                                    });
                                    if (!topicExists) {
                                        validTopicId = null;
                                    }
                                }

                                // Use fallback if invalid
                                if (!validTopicId) {
                                    validTopicId = fallbackTopic?.id;
                                }

                                if (validTopicId) {
                                    questionRecord = await prisma.question.create({
                                        data: {
                                            content: badQ.content,
                                            optionA: badQ.optionA,
                                            optionB: badQ.optionB,
                                            optionC: badQ.optionC,
                                            correctAnswer: badQ.correctAnswer,
                                            explanation: badQ.explanation || '',
                                            difficulty: 'MEDIUM',
                                            topicId: validTopicId,
                                            cfaLevel: user.cfaLevel,
                                        }
                                    });
                                } else {
                                    console.warn("Skipping shadow copy: No valid topic found (and no fallback) for question", badQ.id);
                                }
                            } catch (e) {
                                console.warn("Skipping shadow copy creation for question:", badQ.id, e);
                            }
                        }

                        if (questionRecord) {
                            // Create the history record
                            await prisma.quizQuestion.create({
                                data: {
                                    quizAttemptId: quizAttempt.id,
                                    questionId: questionRecord.id, // Link to the Question table record
                                    order: 0,
                                    userAnswer: answers[badQ.id],
                                    isCorrect: false,
                                    answeredAt: now
                                }
                            });
                        }
                    }
                }
            } catch (shadowError) {
                console.error("Shadow Copy Error:", shadowError);
            }
        }

        return NextResponse.json({
            success: true,
            currentStreak: newStreak,
            longestStreak: newLongestStreak
        });

    } catch (error) {
        console.error('Error completing quiz:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
