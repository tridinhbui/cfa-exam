'use client';

import { motion } from 'framer-motion';
import {
    BookOpen,
    FileText,
    GraduationCap,
    Target,
    TrendingUp,
    Calendar,
    Flame,
    Award,
    Activity,
    LogOut,
    Menu,
    Search,
    Bell,
    Settings,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function HeroAnalytics() {
    return (
        <div className="w-full h-full bg-slate-950 light:bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col relative select-none pointer-events-none">
            {/* --- WINDOW HEADER (Traffic Lights & Address Bar Simulation) --- */}
            <div className="h-10 bg-slate-900 light:bg-slate-50 border-b border-white/5 light:border-slate-200 flex items-center px-4 justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.4)] light:shadow-[0_0_8px_rgba(239,68,68,0.2)]" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.4)] light:shadow-[0_0_8px_rgba(245,158,11,0.2)]" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.4)] light:shadow-[0_0_8px_rgba(16,185,129,0.2)]" />
                </div>
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-slate-800/50 light:bg-white rounded-md border border-white/5 light:border-slate-200 flex-1 sm:max-w-[256px] mx-4 sm:mx-0">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-600 light:bg-slate-300 shrink-0" />
                    <span className="text-[8px] sm:text-[10px] text-slate-500 light:text-slate-400 font-medium truncate">cfa-prep.ai/dashboard</span>
                </div>
                <div className="w-8 sm:w-16" /> {/* Spacer */}
            </div>

            {/* --- MAIN LAYOUT (Sidebar + Content) --- */}
            <div className="flex-1 flex overflow-hidden">
                {/* SIDEBAR MOCKUP */}
                <div className="w-12 sm:w-48 bg-slate-900/50 light:bg-slate-50/50 border-r border-white/5 light:border-slate-200 p-2 sm:p-4 flex flex-col gap-4 sm:gap-6">
                    <div className="flex items-center gap-2 opacity-50 light:opacity-30">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-indigo-500/20" />
                        <div className="hidden sm:block h-3 w-20 bg-slate-700/50 light:bg-slate-300 rounded-full" />
                    </div>

                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className={`flex items-center gap-3 p-1.5 sm:p-2 rounded-lg ${i === 1 ? 'bg-indigo-500/10 light:bg-indigo-50' : ''}`}>
                                <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded shrink-0 ${i === 1 ? 'bg-indigo-500 light:bg-indigo-600 text-indigo-100' : 'bg-slate-800 light:bg-slate-200'}`} />
                                <div className={`hidden sm:block h-2 rounded-full ${i === 1 ? 'w-24 bg-indigo-300 light:bg-indigo-600' : 'w-16 bg-slate-800 light:bg-slate-200'}`} />
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto space-y-2 hidden sm:block">
                        <div className="h-20 rounded-xl bg-gradient-to-br from-indigo-900/20 to-violet-900/20 border border-white/5" />
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 bg-slate-950 light:bg-white p-3 sm:p-6 flex flex-col gap-4 sm:gap-6 overflow-hidden">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="h-6 sm:h-8 w-32 sm:w-48 bg-gradient-to-r from-white to-slate-400 light:from-slate-900 light:to-slate-500 bg-clip-text text-transparent opacity-90 rounded-md mb-1 sm:mb-2 font-bold text-lg sm:text-2xl">Good Morning</div>
                            <div className="flex items-center gap-2 text-slate-500 light:text-slate-400 text-[10px]">
                                <span>Exam Countdown</span>
                                <span className="bg-indigo-500/10 light:bg-indigo-50 text-indigo-400 light:text-indigo-600 px-1 py-0.5 rounded text-[8px] font-bold">87 Days</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-800 light:bg-slate-100 border border-white/5 light:border-slate-200" />
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 light:bg-indigo-50 border border-indigo-500/30 light:border-indigo-100" />
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3">
                        {/* Stat 1 */}
                        <div className="p-2 sm:p-3 rounded-xl bg-slate-900/50 light:bg-slate-50 border border-white/5 light:border-slate-200 shadow-sm">
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2 text-indigo-400 light:text-indigo-600">
                                <Target className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">Accuracy</span>
                            </div>
                            <div className="text-base sm:text-xl font-bold text-white light:text-slate-900">68%</div>
                            <div className="text-[8px] sm:text-[10px] text-emerald-400 light:text-emerald-600 flex items-center gap-1 font-bold">
                                <TrendingUp className="w-2 h-2" />
                                +2.4%
                            </div>
                        </div>
                        {/* Stat 2 */}
                        <div className="p-2 sm:p-3 rounded-xl bg-slate-900/50 light:bg-slate-50 border border-white/5 light:border-slate-200 shadow-sm">
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2 text-amber-400 light:text-amber-600">
                                <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">Streak</span>
                            </div>
                            <div className="text-base sm:text-xl font-bold text-white light:text-slate-900">12</div>
                            <div className="text-[8px] sm:text-[10px] text-slate-500 light:text-slate-400 font-medium">Days Active</div>
                        </div>
                        {/* Stat 3 */}
                        <div className="p-2 sm:p-3 rounded-xl bg-slate-900/50 light:bg-slate-50 border border-white/5 light:border-slate-200 shadow-sm">
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2 text-violet-400 light:text-violet-600">
                                <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">Level</span>
                            </div>
                            <div className="flex gap-0.5">
                                <div className="w-1 h-2.5 sm:h-3 bg-indigo-500 light:bg-indigo-600 rounded-sm" />
                                <div className="w-1 h-2.5 sm:h-3 bg-indigo-500/30 light:bg-indigo-100 rounded-sm" />
                                <div className="w-1 h-2.5 sm:h-3 bg-indigo-500/30 light:bg-indigo-100 rounded-sm" />
                            </div>
                            <div className="text-[8px] sm:text-[10px] text-slate-500 light:text-slate-400 mt-1 font-medium">Level I</div>
                        </div>
                    </div>

                    {/* Bento Grid Mockup */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1 min-h-[160px]">
                        {/* Large Main Card */}
                        <div className="col-span-2 md:col-span-2 row-span-2 p-4 rounded-xl bg-gradient-to-br from-indigo-900/10 via-slate-900/50 to-slate-900/50 light:from-indigo-50 light:via-white light:to-white border border-indigo-500/20 light:border-indigo-100 relative group overflow-hidden shadow-sm">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-1.5 rounded-lg bg-indigo-500/20 light:bg-indigo-100">
                                    <Activity className="w-4 h-4 text-indigo-400 light:text-indigo-600" />
                                </div>
                                <Badge variant="secondary" className="bg-indigo-500/10 light:bg-indigo-50 text-indigo-300 light:text-indigo-600 text-[10px] border-0 font-bold">Active</Badge>
                            </div>
                            <div className="space-y-2">
                                <div className="h-2 w-24 bg-slate-700/50 light:bg-slate-200 rounded-full" />
                                <div className="h-4 w-32 bg-white/10 light:bg-slate-900/10 rounded-md" />
                            </div>

                            {/* Mini Graph Mockup */}
                            <div className="mt-6 flex items-end gap-1 h-16 opacity-70">
                                {[40, 60, 45, 70, 50, 80, 65, 85].map((h, i) => (
                                    <div key={i} className="flex-1 bg-indigo-500 light:bg-indigo-600 rounded-t-sm" style={{ height: `${h}%`, opacity: 0.2 + (i * 0.1) }} />
                                ))}
                            </div>
                        </div>

                        {/* Smaller Cards */}
                        <div className="col-span-1 p-3 rounded-xl bg-slate-900/50 light:bg-slate-50 border border-white/5 light:border-slate-200 flex flex-col justify-between shadow-sm">
                            <div className="w-6 h-6 rounded-md bg-emerald-500/10 light:bg-emerald-50 flex items-center justify-center">
                                <BookOpen className="w-3 h-3 text-emerald-400 light:text-emerald-600" />
                            </div>
                            <div className="h-1.5 w-12 bg-slate-700 light:bg-slate-200 rounded-full mt-2" />
                        </div>
                        <div className="col-span-1 p-3 rounded-xl bg-slate-900/50 light:bg-slate-50 border border-white/5 light:border-slate-200 flex flex-col justify-between shadow-sm">
                            <div className="w-6 h-6 rounded-md bg-purple-500/10 light:bg-purple-50 flex items-center justify-center">
                                <FileText className="w-3 h-3 text-purple-400 light:text-purple-600" />
                            </div>
                            <div className="h-1.5 w-12 bg-slate-700 light:bg-slate-200 rounded-full mt-2" />
                        </div>
                        <div className="col-span-2 row-span-1 p-3 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 light:from-slate-100 light:to-slate-50 border border-white/5 light:border-slate-200 flex items-center gap-3 shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 light:bg-amber-50 flex items-center justify-center shrink-0">
                                <GraduationCap className="w-4 h-4 text-amber-500 light:text-amber-600" />
                            </div>
                            <div className="space-y-1.5 flex-1">
                                <div className="h-1.5 w-20 bg-slate-600 light:bg-slate-300 rounded-full" />
                                <div className="h-1 w-full bg-slate-700 light:bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full w-2/3 bg-amber-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 light:from-white/10 to-transparent pointer-events-none" />
        </div>
    );
}
