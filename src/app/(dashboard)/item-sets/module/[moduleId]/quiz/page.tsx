'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    Flag,
    X,
    Loader2,
    BookOpen,
    Lightbulb,
    Info,
    ChevronDown,
    ChevronUp,
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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const cleanLatex = (text: string) => {
    if (!text) return '';
    return text
        // 1. Fix Double Escaped Block Delimiters (from JSON storage)
        .replace(/\\\\\\$\\\\\\$/g, '$$')
        // 2. Unescape all dollars first to normalize
        .replace(/\\\$/g, '$')
        // 3. Re-escape ONLY single dollars followed by digits (Currency Protection)
        // Does not touch $$ or escaped dollars
        .replace(/(?<!\$)\$(?=\d)/g, '\\$')
        // 4. Auto-format simple exponent blocks for markdown compatibility
        .replace(/(\((?:[\d\.\s\-\+\*]+)\)\^\{[^\}]+\})/g, (match) => '$' + match + '$');
};

function ModuleQuizContent() {
    const { user } = useAuth();
    const { moduleId } = useParams();
    const router = useRouter();
    const [showNotes, setShowNotes] = useState(true);

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

                    {/* Module Specific Notes (Dynamic from DB) - Content Protected */}
                    {data?.studyNotes && Array.isArray(data.studyNotes) && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 overflow-hidden rounded-3xl border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-xl transition-all duration-300 select-none"
                            onCopy={(e) => e.preventDefault()}
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            <button
                                onClick={() => setShowNotes(!showNotes)}
                                className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors border-b border-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
                                        <BookOpen className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-sm font-black text-white tracking-tight">VIP Study Flashcards</h3>
                                        <p className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest italic">
                                            Module {moduleInfo?.code} • Exclusive Summary
                                        </p>
                                    </div>
                                </div>
                                {showNotes ? <ChevronUp className="h-5 w-5 text-slate-500" /> : <ChevronDown className="h-5 w-5 text-slate-500" />}
                            </button>

                            <AnimatePresence>
                                {showNotes && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {(data.studyNotes as any[]).map((standard, idx) => (
                                                <div key={idx} className="space-y-4 p-5 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-indigo-500/20 transition-all shadow-inner relative overflow-hidden group">
                                                    {/* Decorative background element */}
                                                    <div className="absolute -top-4 -right-2 p-1 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                                                        <div className="text-6xl font-black italic">{standard.standardId}</div>
                                                    </div>

                                                    <div className="flex items-center gap-2 relative z-10">
                                                        <div className="flex h-6 min-w-[1.5rem] px-2 items-center justify-center rounded-lg bg-indigo-600 text-white text-[10px] font-black shadow-lg shadow-indigo-500/20 whitespace-nowrap">
                                                            {standard.standardId}
                                                        </div>
                                                        <h4 className="font-black text-indigo-100 text-sm tracking-tight line-clamp-1">{standard.standardTitle}</h4>
                                                    </div>

                                                    <div className="space-y-3 relative z-10">
                                                        {(standard.notes as any[]).map((note, nIdx) => (
                                                            <div key={nIdx} className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/5 shadow-sm">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    {note.type === 'lightbulb' ? (
                                                                        <div className="p-1 bg-amber-500/20 rounded-md">
                                                                            <Lightbulb className="h-3 w-3 text-amber-400" />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="p-1 bg-indigo-500/20 rounded-md">
                                                                            <Info className="h-3 w-3 text-indigo-400" />
                                                                        </div>
                                                                    )}
                                                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                                                                        <ReactMarkdown
                                                                            remarkPlugins={[remarkMath]}
                                                                            rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
                                                                            components={{
                                                                                p: ({ children }) => <span className="inline-block">{children}</span>,
                                                                            }}
                                                                        >
                                                                            {note.label}
                                                                        </ReactMarkdown>
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs leading-relaxed text-slate-200 font-medium markdown-content-sm">
                                                                    <ReactMarkdown
                                                                        remarkPlugins={[remarkGfm, remarkMath]}
                                                                        rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
                                                                        components={{
                                                                            p: ({ children }) => <p className="mb-2 last:mb-0 inline-block w-full">{children}</p>,
                                                                            table: ({ children }) => (
                                                                                <div className="my-4 overflow-x-auto rounded-xl border border-white/10">
                                                                                    <table className="w-full text-left border-collapse">{children}</table>
                                                                                </div>
                                                                            ),
                                                                            thead: ({ children }) => <thead className="bg-white/5">{children}</thead>,
                                                                            th: ({ children }) => <th className="p-3 text-[10px] font-black uppercase text-indigo-300 border-b border-white/10">{children}</th>,
                                                                            td: ({ children }) => <td className="p-3 text-[11px] border-b border-white/5 text-slate-300">{children}</td>,
                                                                            tr: ({ children }) => <tr className="hover:bg-white/5 transition-colors">{children}</tr>,
                                                                        }}
                                                                    >
                                                                        {cleanLatex(note.text)}
                                                                    </ReactMarkdown>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

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
                            options={{
                                A: currentQuestion.optionA,
                                B: currentQuestion.optionB,
                                C: currentQuestion.optionC
                            }}
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
