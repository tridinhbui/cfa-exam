'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Typewriter } from '@/components/ui/typewriter';
import { HeroAnalytics } from '@/components/hero-analytics';
import {
    Sparkles,
    CheckCircle,
    ArrowRight,
    TrendingUp,
    Clock,
    Target,
    Users
} from 'lucide-react';
import { User } from 'firebase/auth';

interface HeroSectionProps {
    user: User | null;
}

export function HeroSection({ user }: HeroSectionProps) {
    return (
        <section className="relative pt-20 sm:pt-24 lg:pt-32 pb-16 sm:pb-24 lg:pb-32 overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/10 rounded-[100%] blur-[120px] opacity-30 mix-blend-screen" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center">
                    {/* Left Side: Content */}
                    <div className="text-left max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-indigo-500/10 light:bg-indigo-50 border border-indigo-500/20 light:border-indigo-100 mb-8 backdrop-blur-sm"
                        >
                            <Sparkles className="h-4 w-4 text-indigo-400 light:text-indigo-600 mr-2" />
                            <span className="text-indigo-200 light:text-indigo-600 text-sm font-medium">AI-Powered CFA Preparation</span>
                        </motion.div>

                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white light:text-slate-900 tracking-tight leading-[1.1] mb-6 sm:mb-8">
                            Study CFA <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 light:from-indigo-600 light:via-violet-600 light:to-indigo-600">Smarter.</span> <br />
                            Not Harder.
                        </h1>

                        <p className="text-lg sm:text-2xl text-slate-400 light:text-slate-600 mb-8 sm:mb-10 leading-relaxed font-medium min-h-[1.5em]">
                            <Typewriter
                                text={[
                                    "Master the CFA Exam",
                                    "Adaptive Learning System",
                                    "Pass with Confidence"
                                ]}
                                speed={70}
                                loop={true}
                                className="text-indigo-400 light:text-indigo-600 font-bold"
                            />
                        </p>

                        <div className="flex flex-wrap gap-x-4 gap-y-3 mb-8">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/5 light:bg-indigo-50 border border-indigo-500/10 light:border-indigo-100 backdrop-blur-sm">
                                <CheckCircle className="h-3.5 w-3.5 text-indigo-400 light:text-indigo-600" />
                                <span className="text-xs sm:text-sm font-medium text-indigo-100/80 light:text-slate-700">Free Diagnostic Test</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/5 light:bg-cyan-50 border border-cyan-500/10 light:border-cyan-100 backdrop-blur-sm">
                                <CheckCircle className="h-3.5 w-3.5 text-cyan-400 light:text-cyan-600" />
                                <span className="text-xs sm:text-sm font-medium text-cyan-100/80 light:text-slate-700">24/7 Dedicated Support</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-start items-center mb-10">
                            <Link href={user ? "/dashboard" : "/login"} className="w-full sm:w-auto">
                                <Button size="xl" className="h-14 px-8 text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 light:shadow-indigo-500/20 transition-all hover:scale-[1.02] rounded-full w-full font-bold">
                                    Get Started
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <button
                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                className="h-14 px-8 text-lg border border-white/10 light:border-slate-200 bg-white/5 light:bg-white/50 text-white light:text-slate-900 hover:bg-white/10 light:hover:bg-white/80 hover:border-white/20 light:hover:border-slate-300 backdrop-blur-sm rounded-full transition-all w-full sm:w-auto shadow-sm font-medium"
                            >
                                View Demo
                            </button>
                        </div>
                    </div>

                    {/* Right Side: Dashboard Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="relative group"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="relative border border-white/10 light:border-slate-200 p-2 bg-slate-950/50 light:bg-white/50 rounded-[2rem] shadow-2xl backdrop-blur-sm overflow-hidden transform lg:rotate-2 lg:group-hover:rotate-0 transition-transform duration-700">
                            <div className="h-[300px] sm:h-[400px] overflow-hidden rounded-2xl bg-slate-950 light:bg-white border border-white/5 light:border-slate-100">
                                <HeroAnalytics />
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-6 -right-6 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-xl z-20 hidden md:block"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Daily Progress</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">+12.4%</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Proof Highlights Row */}
                <div className="mt-16 sm:mt-24 relative z-20">
                    <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-16">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">Free 30 Questions Daily</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">Real Exam Timing</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Target className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">LOS Aligned</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-violet-600 dark:text-violet-400 shrink-0" />
                            <span className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">50,000+ Users</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
