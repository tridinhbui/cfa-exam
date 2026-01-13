'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    Flag,
    X,
    Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QuizCard } from '@/components/quiz/quiz-card';
import { QuizTimer } from '@/components/quiz/quiz-timer';
import { QuizProgress } from '@/components/quiz/quiz-progress';
import { QuizResults } from '@/components/quiz/quiz-results';
import { QuizAIAssistant } from '@/components/quiz/ai-assistant';
import { useQuizStore } from '@/store/quiz-store';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useAuthenticatedSWR } from '@/hooks/use-authenticated-swr';

function ModuleQuizContent() {
    const { user } = useAuth();
    const { moduleId } = useParams();
    const router = useRouter();

    const {
        questions,
        currentIndex,
        answers,
        isCompleted,
        showExplanation,
        startQuiz,
        setAnswer,
        nextQuestion,
        prevQuestion,
        submitQuiz,
        toggleExplanation,
    } = useQuizStore();

    const { data, isLoading: swrLoading } = useAuthenticatedSWR<any>(
        user && moduleId ? `/api/quiz/module/${moduleId}` : null
    );

    useEffect(() => {
        if (data && !data.error && moduleId) {
            startQuiz(moduleId as string, data.questions, 'PRACTICE');
        }
    }, [data, moduleId, startQuiz]);

    const isLoading = swrLoading || !data;

    const moduleInfo = data ? {
        title: data.moduleTitle,
        code: data.moduleCode,
        readingId: data.readingId,
        bookId: data.bookId
    } : null;

    if (isLoading || !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
                <p className="text-slate-400 font-medium animate-pulse">Loading Module Quiz...</p>
            </div>
        );
    }

    if (isCompleted) {
        return <QuizResults />;
    }

    const currentQuestion = questions[currentIndex];
    const selectedAnswer = answers[currentQuestion?.id] || null;

    return (
        <div className="max-w-[1400px] mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8">
                    {/* Quiz Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    if (moduleInfo?.bookId && moduleInfo?.readingId) {
                                        router.push(`/item-sets?bookId=${moduleInfo.bookId}&readingId=${moduleInfo.readingId}`);
                                    } else {
                                        router.push('/item-sets');
                                    }
                                }}
                                className="rounded-full hover:bg-muted"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                            <div>
                                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                    Module {moduleInfo?.code} Quiz
                                </h2>
                                <h1 className="text-xl font-black text-foreground line-clamp-1">
                                    {moduleInfo?.title}
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <QuizTimer />
                            <Button variant="outline" size="sm" className="hidden sm:flex border-border/50 font-bold">
                                <Flag className="h-4 w-4 mr-2" />
                                Flag
                            </Button>
                        </div>
                    </div>

                    {/* Navigation & Progress Hub */}
                    <div className="mb-8 space-y-4 bg-card/30 backdrop-blur-md p-6 rounded-3xl border border-border/50 shadow-xl shadow-indigo-500/5">
                        <div className="flex items-center justify-between gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={prevQuestion}
                                disabled={currentIndex === 0}
                                className="font-bold rounded-xl h-10 px-4 hover:bg-white/10"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Prev
                            </Button>

                            <div className="flex-1 flex justify-center">
                                <QuizProgress />
                            </div>

                            {currentIndex === questions.length - 1 ? (
                                <Button
                                    size="sm"
                                    onClick={submitQuiz}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-10 px-6 shadow-lg shadow-indigo-500/20"
                                >
                                    Finish
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={nextQuestion}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-10 px-6 shadow-lg shadow-indigo-500/20"
                                >
                                    Next
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                                <span>Course Progress</span>
                                <span className="text-primary">{Object.keys(answers).length} / {questions.length} Answered</span>
                            </div>
                            <Progress
                                value={questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0}
                                className="h-2 bg-muted shadow-inner rounded-full"
                            />
                        </div>
                    </div>

                    {/* Main Question Card */}
                    <AnimatePresence mode="wait">
                        {currentQuestion && (
                            <QuizCard
                                key={currentQuestion.id}
                                question={currentQuestion}
                                selectedAnswer={selectedAnswer}
                                onSelectAnswer={(answer) => setAnswer(currentQuestion.id, answer)}
                                showResult={selectedAnswer !== null}
                                showExplanation={showExplanation}
                                onToggleExplanation={toggleExplanation}
                                questionNumber={currentIndex + 1}
                                totalQuestions={questions.length}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* AI Assistant Sidebar */}
                <div className="lg:col-span-4 lg:sticky lg:top-24">
                    {currentQuestion && (
                        <QuizAIAssistant
                            question={currentQuestion.content}
                            explanation={currentQuestion.explanation || ''}
                            topic={moduleInfo?.title}
                            currentIndex={currentIndex}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ModuleQuizPage() {
    return (
        <div className="min-h-screen bg-background">
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
                    <p className="text-slate-400 font-bold">Preparing Exam Environment...</p>
                </div>
            }>
                <ModuleQuizContent />
            </Suspense>
        </div>
    );
}
