'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    GraduationCap,
    Loader2,
    BookOpen,
    CheckCircle2,
    Share2,
    Maximize2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

export default function LessonModulePage() {
    const { moduleId } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [lesson, setLesson] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [togglingProgress, setTogglingProgress] = useState(false);

    useEffect(() => {
        async function fetchLesson() {
            if (!user || !moduleId) return;
            try {
                const token = await user.getIdToken();
                const response = await fetch(`/api/lessons/${moduleId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();

                if (response.ok) {
                    setLesson(data);
                } else if (response.status === 404) {
                    setLesson(null); // Triggers "Coming Soon" state
                } else {
                    setError(data.error);
                }
            } catch (err) {
                console.error('Failed to fetch lesson:', err);
                setError('Failed to load lesson content');
            } finally {
                setLoading(false);
            }
        }

        async function fetchProgress() {
            if (!user || !moduleId) return;
            try {
                const token = await user.getIdToken();
                const response = await fetch(`/api/lessons/${moduleId}/progress`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setIsCompleted(data.isCompleted);
                }
            } catch (err) {
                console.error('Failed to fetch progress:', err);
            }
        }

        fetchLesson();
        fetchProgress();
    }, [user, moduleId]);

    const toggleCompletion = async () => {
        if (!user || !moduleId || togglingProgress) return;

        setTogglingProgress(true);
        const newState = !isCompleted;

        // Optimistic update
        setIsCompleted(newState);

        try {
            const token = await user.getIdToken();
            const response = await fetch(`/api/lessons/${moduleId}/progress`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ completed: newState })
            });

            if (!response.ok) {
                // Revert on error
                setIsCompleted(!newState);
                const data = await response.json();
                console.error('Failed to update progress:', data.error);
            }
        } catch (err) {
            // Revert on error
            setIsCompleted(!newState);
            console.error('Failed to toggle completion:', err);
        } finally {
            setTogglingProgress(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                <p className="text-muted-foreground font-medium">Loading your lesson...</p>
            </div>
        );
    }

    // If no lesson content exists, show the "Coming Soon" state
    if (!lesson) {
        return (
            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Modules
                </Button>

                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 px-6 rounded-3xl border-2 border-dashed border-border bg-card/30"
                >
                    <div className="mx-auto w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
                        <BookOpen className="h-10 w-10 text-indigo-500 animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-black mb-4">Content Coming Soon</h1>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
                        We are currently digitizing the official CFA curriculum for this module.
                        Interactive summaries and key formula sheets are on the way!
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 font-bold px-8 h-12"
                            onClick={() => router.push(`/item-sets/module/${moduleId}/quiz`)}
                        >
                            Practice Quiz Instead
                        </Button>
                        <Button variant="outline" className="font-bold px-8 h-12" onClick={() => router.back()}>
                            Back
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 pb-24 relative">
            {/* Standalone Back Button */}
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-muted-foreground hover:text-indigo-400 transition-colors p-0 hover:bg-transparent"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Curriculum
                </Button>
            </div>

            {/* Header & Breadcrumbs */}
            <div className="mb-10 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-widest">
                    <span>Reading {lesson.module.reading.order}</span>
                    <span className="text-muted-foreground/30">•</span>
                    <span>Module {lesson.module.code}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                            {lesson.module.title}
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            CFA Level I Curriculum • Official Prep Material
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full">
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    <Card className="border-none shadow-none bg-transparent">
                        <CardContent className="p-0 prose prose-indigo dark:prose-invert max-w-none">
                            <div className="lesson-content-container">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkMath]}
                                    rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
                                    components={{
                                        h1: ({ children }) => <h2 className="text-2xl font-black mt-12 mb-6 border-l-4 border-indigo-500 pl-4">{children}</h2>,
                                        h2: ({ children }) => <h3 className="text-xl font-extrabold mt-10 mb-4 text-indigo-400">{children}</h3>,
                                        p: ({ children }) => <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 text-lg">{children}</p>,
                                        blockquote: ({ children }) => (
                                            <div className="my-8 p-6 bg-indigo-500/10 border-l-4 border-indigo-500 rounded-r-2xl italic text-indigo-900 dark:text-indigo-100 shadow-inner">
                                                {children}
                                            </div>
                                        ),
                                        ul: ({ children }) => <ul className="space-y-3 mb-8 list-none pl-0">{children}</ul>,
                                        li: ({ children }) => (
                                            <li className="flex gap-3 text-slate-600 dark:text-slate-300 text-lg">
                                                <div className="mt-1.5 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                                                <span>{children}</span>
                                            </li>
                                        ),
                                        table: ({ children }) => (
                                            <div className="my-10 overflow-x-auto rounded-3xl border border-border/50 bg-card/30 backdrop-blur-sm">
                                                <table className="w-full text-left border-collapse">{children}</table>
                                            </div>
                                        ),
                                        thead: ({ children }) => <thead className="bg-indigo-500/10">{children}</thead>,
                                        th: ({ children }) => <th className="p-4 text-sm font-black uppercase text-indigo-700 dark:text-indigo-300 border-b border-border/50">{children}</th>,
                                        td: ({ children }) => <td className="p-4 text-base border-b border-border/10 text-slate-600 dark:text-slate-300">{children}</td>,
                                        hr: () => <hr className="my-12 border-border/30" />,
                                    }}
                                >
                                    {lesson.content}
                                </ReactMarkdown>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Footer Actions */}
                    <div className="mt-16 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                <GraduationCap className="h-8 w-8" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg leading-none">Ready for Practice?</h4>
                                <p className="text-sm text-muted-foreground mt-1">Test your mastery of this module</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <Button
                                variant={isCompleted ? "default" : "outline"}
                                onClick={toggleCompletion}
                                disabled={togglingProgress}
                                className={cn(
                                    "h-14 px-8 rounded-2xl font-bold transition-all duration-300",
                                    isCompleted
                                        ? "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent shadow-lg shadow-indigo-500/20"
                                        : "border-2 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10"
                                )}
                            >
                                <CheckCircle2 className={cn("mr-2 h-5 w-5 transition-transform", isCompleted && "scale-110")} />
                                {isCompleted ? "Completed" : "Mark as Completed"}
                            </Button>
                            <Button
                                size="lg"
                                onClick={() => router.push(`/item-sets/module/${moduleId}/quiz`)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-12 h-14 rounded-2xl shadow-xl shadow-emerald-600/20 group w-full sm:w-auto"
                            >
                                Start Module Quiz
                                <ArrowLeft className="ml-2 h-5 w-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </div >

                {/* Sidebar Sticky Navigation / Quick Info */}
                < div className="lg:col-span-4 space-y-6" >
                    <div className="sticky top-24 space-y-6">
                        <Card className="bg-indigo-600 border-none text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                            <CardContent className="p-6 relative z-10">
                                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    Professor's Note
                                </h3>
                                <p className="text-white/80 text-sm leading-relaxed italic">
                                    "This module is the foundation for all quantitative methods.
                                    Master the Fisher Relationship and HPR calculations early to save time later."
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div >
            </div >
        </div >
    );
}
