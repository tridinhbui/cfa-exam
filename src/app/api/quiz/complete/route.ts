import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, subDays, isSameDay } from 'date-fns';
import { verifyAuth, authErrorResponse } from '@/lib/server-auth-utils';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, correctAnswers, totalQuestions, timeSpent, topicPerformance, date, mode, questions, answers, studyPlanItemId, isModuleQuiz } = body;

        const authResult = await verifyAuth(req, userId);
        if (authResult.error) return authErrorResponse(authResult);

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

        const todayStr = date || new Date().toLocaleDateString('en-CA');
        const today = new Date(todayStr + 'T00:00:00Z');
        const now = new Date();

        const lastActiveDateStr = user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString('en-CA') : null;
        let newStreak = user.currentStreak || 0;
        if (!lastActiveDateStr) newStreak = 1;
        else if (todayStr === lastActiveDateStr) newStreak = Math.max(user.currentStreak || 0, 1);
        else {
            const yesterdayDate = new Date(today);
            yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
            newStreak = (lastActiveDateStr === yesterdayDate.toISOString().split('T')[0]) ? (user.currentStreak || 0) + 1 : 1;
        }
        const newLongestStreak = Math.max(newStreak, user.longestStreak);

        // Calculate coins server-side
        let coinsAwarded = 0;
        if (Array.isArray(questions) && answers) {
            const questionIds = questions.map((q: any) => q.id).filter(Boolean);
            const dbQuestions = await prisma.question.findMany({
                where: { id: { in: questionIds } },
                select: { id: true, correctAnswer: true, difficulty: true }
            });
            const dbQuestionMap = new Map(dbQuestions.map(q => [q.id, q]));

            questions.forEach((q: any) => {
                const dbQ = dbQuestionMap.get(q.id);
                const userAns = answers[q.id];
                const correctAns = dbQ ? dbQ.correctAnswer : q.correctAnswer;
                const difficulty = (dbQ?.difficulty || q.difficulty || 'MEDIUM').toUpperCase();

                const uAns = userAns?.toString().trim().toUpperCase();
                const cAns = correctAns?.toString().trim().toUpperCase();

                if (uAns && uAns === cAns) {
                    if (difficulty === 'EASY') coinsAwarded += 1;
                    else if (difficulty === 'HARD') coinsAwarded += 5;
                    else coinsAwarded += 3;
                }
            });
        }

        // 3. EXECUTE IN INTERACTIVE TRANSACTION
        const scoreValue = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

        const finalResults = await prisma.$transaction(async (tx) => {
            // Update User
            const updatedUser = await (tx.user as any).update({
                where: { id: userId },
                data: {
                    currentStreak: newStreak,
                    longestStreak: newLongestStreak,
                    lastActiveAt: now,
                    coins: { increment: coinsAwarded }
                }
            });

            // Daily Progress
            await tx.dailyProgress.upsert({
                where: { userId_date: { userId, date: today } },
                update: {
                    questionsAnswered: { increment: totalQuestions || 0 },
                    correctAnswers: { increment: correctAnswers || 0 },
                    timeSpent: { increment: timeSpent || 0 },
                    sessionsCount: { increment: 1 },
                },
                create: {
                    userId,
                    date: today,
                    questionsAnswered: totalQuestions || 0,
                    correctAnswers: correctAnswers || 0,
                    timeSpent: timeSpent || 0,
                    sessionsCount: 1,
                }
            });

            // Topic Performance (skip invalid topics)
            if (topicPerformance && typeof topicPerformance === 'object') {
                const allTopics = await tx.topic.findMany({ select: { id: true } });
                const validTopicIds = new Set(allTopics.map(t => t.id));

                for (const [topicId, stats] of Object.entries(topicPerformance) as [string, { correct: number, total: number }][]) {
                    if (!validTopicIds.has(topicId)) continue;

                    const existing = await tx.topicPerformance.findUnique({
                        where: { userId_topicId: { userId, topicId } }
                    });

                    const newTotal = (existing?.totalAttempts || 0) + stats.total;
                    const newCorrect = (existing?.correctCount || 0) + stats.correct;
                    const newAccuracy = newTotal > 0 ? (newCorrect / newTotal) * 100 : 0;

                    await tx.topicPerformance.upsert({
                        where: { userId_topicId: { userId, topicId } },
                        update: { totalAttempts: newTotal, correctCount: newCorrect, accuracy: newAccuracy, lastPracticed: now },
                        create: { userId, topicId, totalAttempts: stats.total, correctCount: stats.correct, accuracy: newAccuracy, lastPracticed: now }
                    });
                }
            }

            // Create Quiz Attempt
            const attemptMode = (mode?.toUpperCase() === 'MISTAKES') ? 'PRACTICE' : (mode?.toUpperCase() || 'PRACTICE');

            const attempt = await (tx.quizAttempt as any).create({
                data: {
                    userId,
                    cfaLevel: user.cfaLevel || 'LEVEL_1',
                    mode: attemptMode,
                    startedAt: new Date(now.getTime() - ((timeSpent || 0) * 1000)),
                    completedAt: now,
                    score: scoreValue,
                    totalQuestions: totalQuestions || 0,
                    correctAnswers: correctAnswers || 0,
                }
            });

            // --- MISTAKES BANK (ERROR LOG) LOGIC ---
            const verifiedUserId = authResult.uid;
            if (Array.isArray(questions) && answers) {
                let index = 0;
                for (const q of questions) {
                    const questionId = q.id;
                    if (!questionId) continue;

                    const userAns = answers[questionId]?.toString().trim().toUpperCase();
                    // Fallback to provided correctAnswer if DB check fails
                    let correctAns = q.correctAnswer?.toString().trim().toUpperCase();

                    try {
                        const dbQ = await tx.question.findUnique({
                            where: { id: questionId },
                            select: { correctAnswer: true }
                        });
                        if (dbQ?.correctAnswer) {
                            correctAns = dbQ.correctAnswer.trim().toUpperCase();
                        }
                    } catch (e) {
                        // Silent fallback
                    }

                    const isCorrect = !!(userAns && correctAns && userAns === correctAns);

                    // 1. Save detailed question history
                    await (tx as any).quizQuestion.create({
                        data: {
                            quizAttemptId: attempt.id,
                            questionId: questionId,
                            order: index++,
                            userAnswer: userAns || null,
                            isCorrect: isCorrect,
                            answeredAt: now
                        }
                    });

                    if (userAns && correctAns) {
                        if (isCorrect) {
                            // Correct: ALWAYS remove from Mistakes Bank
                            await (tx as any).wrongQuestion.deleteMany({
                                where: {
                                    userId: verifiedUserId,
                                    questionId: questionId
                                }
                            });
                        } else {
                            // Wrong: Add/Update in Mistakes Bank (Only for regular practice, not module quizzes)
                            if (!isModuleQuiz) {
                                await (tx as any).wrongQuestion.upsert({
                                    where: {
                                        userId_questionId: {
                                            userId: verifiedUserId,
                                            questionId: questionId
                                        }
                                    },
                                    update: { createdAt: now },
                                    create: {
                                        userId: verifiedUserId,
                                        questionId: questionId,
                                        createdAt: now
                                    }
                                });
                            }
                        }
                    }
                }
            }

            return { updatedUser, attempt };
        });

        const { updatedUser, attempt: quizAttempt } = finalResults;

        // 4. STUDY PLAN COMPLETION LOGIC
        // If this quiz was started from a Study Plan task and the score is >= 70% (21/30)
        let studyPlanCompleted = false;
        if (studyPlanItemId && scoreValue >= 70) {
            try {
                // Verify ownership: Item -> StudyPlan -> User
                const item = await prisma.studyPlanItem.findFirst({
                    where: {
                        id: studyPlanItemId,
                        studyPlan: {
                            userId: userId
                        }
                    }
                });

                if (item) {
                    await prisma.studyPlanItem.update({
                        where: { id: studyPlanItemId },
                        data: { isCompleted: true, completedAt: now }
                    });
                    studyPlanCompleted = true;
                } else {
                    console.warn(`Attempt to complete studyPlanItem ${studyPlanItemId} by non-owner user ${userId}`);
                }
            } catch (e) {
                console.error("Failed to update study plan item:", e);
            }
        }

        // 5. SHADOW COPY LOGIC: Save incorrect answers for Error Analysis
        if (!isModuleQuiz && quizAttempt && questions && answers && Array.isArray(questions)) {
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
            longestStreak: newLongestStreak,
            coinsAwarded,
            newTotalCoins: updatedUser.coins || 0
        });

    } catch (error: any) {
        console.error('Error completing quiz:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal Server Error'
        }, { status: 500 });
    }
}
