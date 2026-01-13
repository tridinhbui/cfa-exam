'use client';

import { BookOpen, BarChart3, FileText, Calendar, Layout, Sparkles, Clock } from 'lucide-react';
import { FeatureCard } from '@/components/features/feature-card';
import { MockExam, MockAnalytics, MockItemSet, MockPlanner } from '@/components/features/mockups';
import { Badge } from '@/components/ui/badge';

export function FeaturesSection() {
    return (
        <section id="features" className="py-24 relative bg-slate-100/50 dark:bg-slate-900/30">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider uppercase text-sm">Features</span>
                    <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mt-3 mb-6">
                        Designed for CFA Exam Success
                    </h2>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Our comprehensive platform covers all CFA levels with AI-driven tools designed
                        to maximize your learning efficiency.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
                    {/* 1. Practice Questions (Mock Exam) */}
                    <FeatureCard
                        title="MCQ Practice"
                        description="Thousands of practice questions organized by topic with detailed explanations."
                        icon={BookOpen}
                        iconColor="text-indigo-400"
                        className="md:col-span-2"
                        delay={0}
                        glowingVariant="indigo"
                    >
                        <MockExam />
                    </FeatureCard>

                    {/* 2. Smart Analytics */}
                    <FeatureCard
                        title="Smart Analytics"
                        description="Track your progress and identify weak areas instantly."
                        icon={BarChart3}
                        iconColor="text-emerald-400"
                        className="md:col-span-1"
                        delay={0.1}
                        glowingVariant="emerald"
                    >
                        <MockAnalytics />
                    </FeatureCard>

                    {/* 3. Item Set Simulator */}
                    <FeatureCard
                        title="Item Set Simulator"
                        description="Practice Level II style vignettes with real exam-like conditions."
                        icon={FileText}
                        iconColor="text-rose-400"
                        className="md:col-span-1 md:row-span-2"
                        delay={0.2}
                        glowingVariant="rose"
                    >
                        <MockItemSet />
                    </FeatureCard>

                    {/* 4. Study Planner */}
                    <FeatureCard
                        title="Dynamic Study Planner"
                        description="3-month structured roadmap tailored to your exam date."
                        icon={Calendar}
                        iconColor="text-rose-400"
                        className="md:col-span-2"
                        delay={0.3}
                        glowingVariant="rose"
                    >
                        <MockPlanner />
                    </FeatureCard>

                    {/* 5. Exam Simulation */}
                    <FeatureCard
                        title="Exam Simulation"
                        description="Timed mock exams that mirror the official interface."
                        icon={Layout}
                        iconColor="text-amber-400"
                        className="md:col-span-1"
                        delay={0.4}
                        glowingVariant="amber"
                    >
                        <div className="absolute inset-0 flex items-center justify-center p-6 pb-0 overflow-hidden">
                            <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-t-xl p-4 shadow-2xl transform translate-y-4">
                                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-amber-500" />
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">02:14:55</span>
                                    </div>
                                    <Badge variant="outline" className="text-[8px] bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">Active Session</Badge>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-2 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-full" />
                                    <div className="h-2 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-full" />
                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        <div className="h-8 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5" />
                                        <div className="h-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FeatureCard>

                    {/* 6. AI Explanations */}
                    <FeatureCard
                        title="AI Explanations"
                        description="Get instant, personalized explanations for any concept."
                        icon={Sparkles}
                        iconColor="text-cyan-400"
                        className="md:col-span-1"
                        delay={0.5}
                        glowingVariant="cyan"
                    >
                        <div className="absolute inset-0 flex items-center justify-center p-6">
                            <div className="bg-white dark:bg-slate-900 border border-indigo-500/20 dark:border-indigo-500/30 rounded-2xl p-4 w-full max-w-[250px] shadow-lg">
                                <div className="flex gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div className="text-xs text-slate-600 dark:text-slate-300">
                                        Can you explain <span className="text-indigo-600 dark:text-indigo-400">convexity</span>?
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border border-slate-100 dark:border-white/5">
                                    Convexity measures the curvature in the relationship between bond prices and yields...
                                </div>
                            </div>
                        </div>
                    </FeatureCard>
                </div>
            </div>
        </section>
    );
}
