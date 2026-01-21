'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Star,
    Bug,
    Lightbulb,
    TrendingUp,
    TrendingDown,
    Users,
    MessageSquare,
    ChevronRight,
    Search,
    Filter,
    ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthenticatedSWR } from '@/hooks/use-authenticated-swr';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

export default function AdminFeedbackPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'all' | 'bugs' | 'improvements' | 'strengths' | 'weaknesses'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: feedbackData, isLoading, isError } = useAuthenticatedSWR<any>(
        user ? `/api/admin/feedback` : null
    );

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-4">
                    <Bug className="h-8 w-8 text-rose-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-md">
                    You do not have the necessary permissions to view this page. This area is restricted to administrators only.
                </p>
            </div>
        );
    }

    const stats = feedbackData?.stats;
    const summaries = feedbackData?.summaries;
    const feedbacks = feedbackData?.feedbacks || [];

    const filteredFeedbacks = feedbacks.filter((f: any) => {
        const matchesSearch =
            f.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.bugs?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.improvements?.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeTab === 'all') return matchesSearch;
        if (activeTab === 'bugs') return matchesSearch && f.bugs;
        if (activeTab === 'improvements') return matchesSearch && f.improvements;
        if (activeTab === 'strengths') return matchesSearch && f.strengths;
        if (activeTab === 'weaknesses') return matchesSearch && f.weaknesses;
        return matchesSearch;
    });

    return (
        <div className="space-y-8 pb-12">
            {/* Header section with WOW factor */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 blur-3xl -z-10" />
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-black text-slate-900 dark:text-white tracking-tight"
                        >
                            Feedback <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-6xl block sm:inline">Analytics</span>
                        </motion.h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg font-medium">Detailed insight into user satisfaction and system health.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 backdrop-blur-xl flex items-center gap-2 shadow-sm">
                            <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-slate-900 dark:text-white font-bold">{isLoading ? '...' : stats?.totalCount} <span className="text-slate-500 font-medium">Responses</span></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-white/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden group shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-500/10 rounded-2xl">
                                <Star className="h-6 w-6 text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400" />
                            </div>
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full text-xs">
                                <TrendingUp className="h-3 w-3" />
                                +0.2
                            </div>
                        </div>
                        <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Average Satisfaction</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-black text-slate-900 dark:text-white">{isLoading ? <Skeleton className="h-12 w-20" /> : stats?.averageRating}</span>
                            <span className="text-slate-400 dark:text-slate-500 font-bold text-xl">/ 5.0</span>
                        </div>
                        <div className="mt-6 h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(stats?.averageRating / 5) * 100}%` }}
                                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Rating Distribution Chart - Custom Look */}
                <Card className="md:col-span-2 bg-white dark:bg-slate-900/40 border-slate-200 dark:border-white/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <CardContent className="p-8">
                        <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-6">Rating Distribution</h3>
                        <div className="flex flex-col gap-4">
                            {[5, 4, 3, 2, 1].map((rating) => {
                                const count = stats?.ratingDistribution[rating] || 0;
                                const percentage = stats?.totalCount > 0 ? (count / stats?.totalCount) * 100 : 0;
                                return (
                                    <div key={rating} className="flex items-center gap-4 group">
                                        <div className="w-12 text-right">
                                            <span className="text-slate-900 dark:text-white font-black flex items-center justify-end gap-1">
                                                {rating} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                            </span>
                                        </div>
                                        <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden relative">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1, delay: rating * 0.1 }}
                                                className={cn(
                                                    "h-full rounded-full transition-all group-hover:brightness-110",
                                                    rating === 5 ? "bg-emerald-500" :
                                                        rating === 4 ? "bg-indigo-500" :
                                                            rating === 3 ? "bg-amber-500" :
                                                                rating === 2 ? "bg-orange-500" : "bg-rose-500"
                                                )}
                                            />
                                        </div>
                                        <div className="w-16">
                                            <span className="text-slate-500 dark:text-slate-400 font-bold text-xs">{count} <span className="text-[10px] opacity-60">voices</span></span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900/60 rounded-[1.5rem] border border-slate-200 dark:border-white/5 w-fit shadow-inner">
                        {[
                            { id: 'all', label: 'All', icon: MessageSquare },
                            { id: 'bugs', label: 'Bugs', icon: Bug },
                            { id: 'improvements', label: 'Ideas', icon: Lightbulb },
                            { id: 'strengths', label: 'Strengths', icon: TrendingUp },
                            { id: 'weaknesses', label: 'Gaps', icon: TrendingDown },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "px-4 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all",
                                    activeTab === tab.id
                                        ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md dark:shadow-indigo-600/20"
                                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                )}
                            >
                                <tab.icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="relative max-w-xs w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search feedback content..."
                            className="pl-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5 rounded-2xl focus:ring-indigo-500 h-12 shadow-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Feedback Cards List */}
                <div className="grid grid-cols-1 gap-6">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-40 w-full rounded-[2.5rem] bg-white dark:bg-slate-900/40" />
                        ))
                    ) : filteredFeedbacks.length > 0 ? (
                        <AnimatePresence mode="popLayout">
                            {filteredFeedbacks.map((item: any, index: number) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-white/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden hover:border-indigo-500/30 dark:hover:border-indigo-500/20 transition-all shadow-lg hover:shadow-xl shadow-slate-200/50 dark:shadow-none">
                                        <CardContent className="p-8">
                                            <div className="flex flex-col lg:flex-row gap-8">
                                                <div className="lg:w-56 shrink-0 space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-400/10 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-400/20">
                                                            <Star className={cn("h-4 w-4 fill-amber-500 text-amber-500")} />
                                                            <span className="text-amber-700 dark:text-amber-400 font-black text-xl">{item.rating}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-900 dark:text-white font-black text-sm truncate">{item.user.name || 'Anonymous User'}</p>
                                                        <p className="text-slate-500 font-bold text-[11px] truncate">{item.user.email}</p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none font-bold text-[10px] uppercase px-2 py-0.5">
                                                            {item.category}
                                                        </Badge>
                                                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider py-0.5">
                                                            {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className={cn(
                                                    "flex-1 grid gap-8",
                                                    activeTab === 'all' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                                                )}>
                                                    {item.bugs && (activeTab === 'all' || activeTab === 'bugs') && (
                                                        <div className="space-y-2 p-4 rounded-3xl bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10">
                                                            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                                                                <Bug className="h-4 w-4" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Confirmed Bugs</span>
                                                            </div>
                                                            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">{item.bugs}</p>
                                                        </div>
                                                    )}
                                                    {item.improvements && (activeTab === 'all' || activeTab === 'improvements') && (
                                                        <div className="space-y-2 p-4 rounded-3xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10">
                                                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                                                <Lightbulb className="h-4 w-4" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Future Ideas</span>
                                                            </div>
                                                            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">{item.improvements}</p>
                                                        </div>
                                                    )}
                                                    {item.strengths && (activeTab === 'all' || activeTab === 'strengths') && (
                                                        <div className="space-y-2 p-4 rounded-3xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10">
                                                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                                                <TrendingUp className="h-4 w-4" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">User Wins</span>
                                                            </div>
                                                            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">{item.strengths}</p>
                                                        </div>
                                                    )}
                                                    {item.weaknesses && (activeTab === 'all' || activeTab === 'weaknesses') && (
                                                        <div className="space-y-2 p-4 rounded-3xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10">
                                                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                                                <TrendingDown className="h-4 w-4" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Identified Gaps</span>
                                                            </div>
                                                            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">{item.weaknesses}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <div className="py-20 text-center bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-inner">
                            <p className="text-slate-500 font-bold">No results found for your current filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
