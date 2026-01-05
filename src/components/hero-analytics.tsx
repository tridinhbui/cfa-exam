'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, Target, ChevronRight } from 'lucide-react';

const examData = [
    { level: 'Level I', passRate: 43, studyHours: 303, color: 'from-indigo-500 to-indigo-400' },
    { level: 'Level II', passRate: 44, studyHours: 328, color: 'from-violet-500 to-violet-400' },
    { level: 'Level III', passRate: 50, studyHours: 344, color: 'from-fuchsia-500 to-fuchsia-400' },
];

export function HeroAnalytics() {
    return (
        <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4 lg:p-6 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Left Panel: Pass Rates & Study Time */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-4 w-4 text-indigo-400" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Statistics</span>
                    </div>
                    <div className="space-y-6">
                        {examData.map((data, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-semibold text-white">{data.level}</span>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-tighter">{data.passRate}% PASS RATE</span>
                                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">{data.studyHours}h STUDY</span>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${data.passRate}%` }}
                                        transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                                        className={`h-full bg-gradient-to-r ${data.color}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-600/10 border border-indigo-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-indigo-400" />
                        <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Average Study Time</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">~325h</span>
                        <span className="text-xs text-slate-400">per level</span>
                    </div>
                </div>
            </div>

            {/* Right Panel: Interactive Chart Mockup */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="flex-1 p-6 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div>
                            <h4 className="text-lg font-bold text-white mb-1">Performance Analytics</h4>
                            <p className="text-xs text-slate-500">Candidate confidence vs. Targeted Practice</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                <BarChart3 className="h-4 w-4 text-slate-400" />
                            </div>
                        </div>
                    </div>

                    {/* Lines & Grid */}
                    <div className="absolute inset-0 pt-24 pb-12 px-6">
                        <div className="w-full h-full relative">
                            {/* Grid Lines */}
                            {[0, 1, 2, 3].map((i) => (
                                <div key={i} className="absolute w-full h-px bg-white/5" style={{ top: `${i * 33.3}%` }} />
                            ))}

                            {/* Main SVG Path */}
                            <svg className="w-full h-full overflow-visible">
                                <motion.path
                                    d="M0 100 L50 90 L100 110 L150 70 L200 85 L250 40 L300 60 L350 20 L400 35 L450 0"
                                    fill="none"
                                    stroke="url(#chartGradient)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 2, ease: "easeInOut" }}
                                />
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>

                                {/* Glow for path */}
                                <motion.path
                                    d="M0 100 L50 90 L100 110 L150 70 L200 85 L250 40 L300 60 L350 20 L400 35 L450 0"
                                    fill="none"
                                    stroke="#6366f1"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    className="blur-xl opacity-20"
                                    style={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 2, ease: "easeInOut" }}
                                />

                                {/* Animated Dot */}
                                <motion.circle
                                    cx="450"
                                    cy="0"
                                    r="6"
                                    className="fill-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 2 }}
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-[10px] text-slate-600 font-bold uppercase tracking-widest z-10">
                        <span>Month 1</span>
                        <span>Month 2</span>
                        <span>Exam Month</span>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-slate-900 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-violet-600/20 flex items-center justify-center border border-violet-500/20">
                            <Target className="h-5 w-5 text-violet-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Personalized LOS Tracker</p>
                            <p className="text-[10px] text-slate-500">Target Level III Learning Objectives</p>
                        </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                </div>

                <div className="px-1">
                    <p className="text-[9px] text-slate-500 leading-tight italic">
                        * Pass rates remain challenging; average study time exceeds 300 hours. Our targeted practice and real-time analytics are designed to close this gap.
                    </p>
                </div>
            </div>
        </div>
    );
}
