'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XCircle,
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    AlertCircle,
    Play,
    RotateCcw,
    ChevronRight,
    TrendingUp,
    Brain
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { useAuthenticatedSWR } from '@/hooks/use-authenticated-swr';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

export default function MistakesPage() {
    const { user } = useAuth();
    const { data: mistakes, isLoading, mutate } = useAuthenticatedSWR<any[]>(
        user ? `/api/quiz/mistakes?userId=${user.uid}` : null
    );

    const [filter, setFilter] = useState('all');

    const filteredMistakes = mistakes?.filter(m => {
        if (filter === 'all') return true;
        return m.topic.toLowerCase().includes(filter.toLowerCase());
    }) || [];

    const uniqueTopics = Array.from(new Set(mistakes?.map(m => m.topic) || []));

    return (
        <div className="min-h-screen pb-20">
            {/* Header Section */}
            <div className="mb-10">
                <Link href="/dashboard">
                    <Button variant="ghost" className="mb-4 text-muted-foreground hover:text-indigo-400 -ml-2 group">
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Button>
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 mb-2"
                        >
                            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                                <XCircle className="h-6 w-6" />
                            </div>
                            <Badge variant="outline" className="text-rose-400 border-rose-400/30 uppercase tracking-widest text-[10px] font-black">
                                Personal Error Log
                            </Badge>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl md:text-5xl font-black text-foreground tracking-tighter"
                        >
                            Mistakes Bank
                        </motion.h1>
                        <p className="text-muted-foreground mt-4 text-lg max-w-2xl">
                            Turn your failures into fuel. Every question you answer correctly here will be removed from this list forever.
                        </p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center min-w-[160px] bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm"
                    >
                        <div className="text-center">
                            <div className="text-5xl font-black text-rose-500 mb-1">
                                {isLoading ? <Skeleton className="h-12 w-20 mx-auto" /> : mistakes?.length || 0}
                            </div>
                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Questions Remaining</div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar Filters */}
                <div className="space-y-6">
                    <Card className="bg-card/50 border-border rounded-2xl p-6">
                        <h3 className="text-sm font-black uppercase text-muted-foreground tracking-widest mb-4">Filter by Topic</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${filter === 'all'
                                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                                    : 'text-muted-foreground hover:bg-white/5'
                                    }`}
                            >
                                All Topics
                                <Badge className="ml-2 bg-muted text-foreground border-none px-1.5 py-0 h-4 text-[10px]">
                                    {mistakes?.length || 0}
                                </Badge>
                            </button>
                            {uniqueTopics.map((topic: any) => (
                                <button
                                    key={topic}
                                    onClick={() => setFilter(topic)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${filter === topic
                                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                                        : 'text-muted-foreground hover:bg-white/5'
                                        }`}
                                >
                                    {topic}
                                    <Badge className="ml-2 bg-muted text-foreground border-none px-1.5 py-0 h-4 text-[10px]">
                                        {mistakes?.filter(m => m.topic === topic).length}
                                    </Badge>
                                </button>
                            ))}
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20 rounded-2xl p-6">
                        <div className="flex items-center gap-2 text-indigo-400 mb-3">
                            <Brain className="h-5 w-5" />
                            <span className="font-bold text-sm">Study Protocol</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            We recommend reviewing your mistakes every <span className="text-foreground font-bold italic">48 hours</span> to maximize long-term retention.
                        </p>
                    </Card>
                </div>

                {/* Mistakes List */}
                <div className="lg:col-span-3 space-y-4">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i} className="bg-card border-border overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex justify-between mb-4">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-5 w-20" />
                                    </div>
                                    <Skeleton className="h-10 w-full mb-4" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-8 w-24" />
                                        <Skeleton className="h-8 w-24" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : filteredMistakes.length > 0 ? (
                        <AnimatePresence mode="popLayout">
                            {filteredMistakes.map((mistake, index) => (
                                <motion.div
                                    key={mistake.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="group bg-card hover:bg-white/[0.02] border-border hover:border-indigo-500/30 transition-all duration-300 overflow-hidden relative">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/50 group-hover:bg-indigo-500 transition-colors" />
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-muted text-muted-foreground border-border uppercase font-bold text-[10px] tracking-wider">
                                                        {mistake.topic}
                                                    </Badge>
                                                    <Badge variant="outline" className={`uppercase font-bold text-[10px] tracking-wider ${mistake.difficulty === 'HARD' ? 'text-rose-400 border-rose-400/20' :
                                                        mistake.difficulty === 'MEDIUM' ? 'text-amber-400 border-amber-400/20' :
                                                            'text-emerald-400 border-emerald-400/20'
                                                        }`}>
                                                        {mistake.difficulty}
                                                    </Badge>
                                                </div>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                    Last Failed: {new Date(mistake.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-bold text-foreground mb-6 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                                                {mistake.content}
                                            </h3>

                                            <div className="flex items-center justify-between">
                                                <div className="flex gap-2">
                                                    <Badge className="bg-rose-500/10 text-rose-500 border-none font-black text-[10px]">INCORRECT</Badge>
                                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[10px]">RETRY READY</Badge>
                                                </div>
                                                <Link href={`/quiz/session?questionId=${mistake.id}&mode=mistakes`}>
                                                    <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300 font-black text-xs uppercase tracking-widest p-0 flex items-center gap-1 group/btn">
                                                        Practice This Now
                                                        <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-card/20 rounded-3xl border border-dashed border-border text-center">
                            <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500 mb-6">
                                <CheckCircle2 className="h-12 w-12" />
                            </div>
                            <h3 className="text-2xl font-black text-foreground mb-2">Zero Mistakes!</h3>
                            <p className="text-muted-foreground max-w-sm">
                                You’ve cleared your Mistakes Bank. Keep practicing to identify new areas for improvement.
                            </p>
                            <Link href="/quiz" className="mt-8">
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 h-12 rounded-xl">
                                    Take a New Quiz
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
