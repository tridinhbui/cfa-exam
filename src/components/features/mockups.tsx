import { CheckCircle2, ChevronRight, BarChart3, Clock, Brain, FileText } from 'lucide-react';

export function MockExam() {
    return (
        <div className="absolute top-8 left-8 right-8 bg-slate-950 border border-white/10 rounded-xl p-6 shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500 origin-top">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">ETHICS</span>
                    <span className="text-xs text-slate-500">Question 14 of 90</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>01:45</span>
                </div>
            </div>

            {/* Question */}
            <p className="text-sm text-slate-200 mb-6 leading-relaxed">
                According to the Standard regarding referral fees, a member must disclose any benefit received for the recommendation of services to:
            </p>

            {/* Options */}
            <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-white/5 opacity-50">
                    <div className="w-4 h-4 rounded-full border border-slate-600" />
                    <span className="text-sm text-slate-400 line-through">Only potential clients</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-emerald-100">Employers, clients, and prospective clients</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-white/5 opacity-50">
                    <div className="w-4 h-4 rounded-full border border-slate-600" />
                    <span className="text-sm text-slate-400">Employers and clients only</span>
                </div>
            </div>
        </div>
    );
}

export function MockAnalytics() {
    return (
        <div className="absolute inset-x-8 top-10 flex flex-col gap-6">
            {/* Top Row: Mastery Gauge & Main Metric */}
            <div className="flex items-center gap-6">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r="58"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="10"
                            className="text-slate-800"
                        />
                        <circle
                            cx="64"
                            cy="64"
                            r="58"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="10"
                            strokeDasharray={364.4}
                            strokeDashoffset={364.4 * (1 - 0.72)}
                            strokeLinecap="round"
                            className="text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000 group-hover:stroke-indigo-400"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-white">72%</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Mastery</span>
                    </div>
                </div>

                <div className="flex-1 space-y-4">
                    <div className="bg-slate-900/50 border border-white/5 p-3 rounded-2xl">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-slate-500 font-bold uppercase">Ethics Score</span>
                            <span className="text-xs text-emerald-400 font-bold">+12%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full w-4/5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
                        </div>
                    </div>
                    <div className="bg-slate-900/50 border border-white/5 p-3 rounded-2xl">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-slate-500 font-bold uppercase">Quant Score</span>
                            <span className="text-xs text-indigo-400 font-bold">Strong</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full w-2/3 bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Trend Line */}
            <div className="relative h-20 w-full bg-indigo-500/5 rounded-2xl border border-indigo-500/10 p-4 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <svg viewBox="0 0 400 100" className="w-full h-full preserve-3d">
                        <path
                            d="M0,80 Q50,70 100,40 T200,30 T300,60 T400,10"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-indigo-400"
                        />
                    </svg>
                </div>
                <div className="relative z-10 flex justify-between items-end h-full">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-indigo-300/60 font-medium tracking-widest uppercase">Performance Trend</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-sm font-bold text-white tracking-tight">On track for Pass</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-500 mb-0.5">Confidence</div>
                        <div className="text-lg font-black text-indigo-400">High</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function MockPlanner() {
    return (
        <div className="absolute top-10 -right-10 -left-10 transform -rotate-2">
            <div className="flex gap-4 overflow-hidden py-4 px-8">
                {[
                    { day: 'Mon', sub: 'Quant', status: 'done' }, // Complete
                    { day: 'Tue', sub: 'Econ', status: 'done' },  // Complete
                    { day: 'Wed', sub: 'FRA', status: 'active' }, // Active
                    { day: 'Thu', sub: 'Corp', status: 'pend' },  // Pending
                    { day: 'Fri', sub: 'Equity', status: 'pend' }, // Pending
                ].map((item, i) => (
                    <div
                        key={i}
                        className={`flex-shrink-0 w-32 p-4 rounded-2xl border ${item.status === 'active'
                            ? 'bg-slate-800 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)] scale-110 z-10'
                            : item.status === 'done'
                                ? 'bg-slate-900/50 border-emerald-500/20 opacity-60'
                                : 'bg-slate-900/30 border-white/5 opacity-40'
                            }`}
                    >
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">{item.day}</div>
                        <div className="font-bold text-white mb-2">{item.sub}</div>
                        {item.status === 'done' && <div className="h-1.5 w-full bg-emerald-500/20 rounded-full overflow-hidden"><div className="h-full w-full bg-emerald-500" /></div>}
                        {item.status === 'active' && <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden"><div className="h-full w-3/4 bg-indigo-500" /></div>}
                        {item.status === 'pend' && <div className="h-1.5 w-full bg-slate-800 rounded-full" />}
                    </div>
                ))}
            </div>
        </div>
    );
}


export function MockItemSet() {
    return (
        <div className="absolute inset-0 flex flex-col bg-slate-950">
            {/* Exam Header */}
            <div className="h-10 bg-slate-900 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                        <span className="text-[10px] font-black text-white uppercase tracking-tighter">Level II Mock</span>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <span className="text-[10px] text-slate-400 font-medium">Case: Global Equity Partners</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-1">
                        {[1, 2, 3, 4, 5, 6].map((q) => (
                            <div key={q} className={`w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[8px] ${q === 3 ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                {q}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Split View */}
            <div className="flex-grow flex min-h-0">
                {/* Left Panel: Vignette */}
                <div className="w-1/2 p-4 pt-6 border-r border-white/5 bg-slate-900/40 overflow-y-auto custom-scrollbar">
                    <h4 className="text-[11px] font-bold text-indigo-400 uppercase mb-3 tracking-widest">Scenario Vignette</h4>
                    <div className="space-y-3 opacity-90">
                        <p className="text-[10px] leading-relaxed text-slate-300">
                            Global Equity Partners (GEP) is evaluating an investment in a small-cap technology firm. The lead analyst, Sarah Chen, is reviewing the target's financial statements...
                        </p>
                        <div className="p-3 bg-slate-950/50 border border-white/5 rounded-lg space-y-2">
                            <div className="flex justify-between text-[8px] text-slate-500 border-b border-white/5 pb-1">
                                <span>Financial Metric</span>
                                <span>2024 (Projected)</span>
                            </div>
                            <div className="flex justify-between text-[9px] text-slate-300">
                                <span>Revenue Growth</span>
                                <span className="text-emerald-400">14.5%</span>
                            </div>
                            <div className="flex justify-between text-[9px] text-slate-300">
                                <span>Operating Margin</span>
                                <span>22.0%</span>
                            </div>
                        </div>
                        <p className="text-[10px] leading-relaxed text-slate-400 italic border-l-2 border-indigo-500/30 pl-3 py-1">
                            "The target's capitalize vs expense policy seems conservative relative to industry peers," Chen notes in her preliminary report...
                        </p>
                    </div>
                </div>

                {/* Right Panel: Questions */}
                <div className="w-1/2 p-4 pt-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar bg-slate-950/20">
                    {/* Question 3 (Active) */}
                    <div className="shrink-0">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-bold text-indigo-400">Q3 of 6</span>
                            <div className="h-px flex-grow bg-indigo-500/20" />
                        </div>
                        <p className="text-[11px] text-white font-medium mb-4 leading-normal">
                            Based on Chen's notes, which adjustment to the target's financial statements is most likely required to compare it with industry peers?
                        </p>
                        <div className="space-y-2">
                            {['Capitalize Research & Development', 'Increase Depreciation Expense', 'Decrease Goodwill Amortization'].map((opt, i) => (
                                <div key={i} className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${i === 0 ? 'bg-indigo-500/10 border-indigo-400/50 shadow-[0_0_10px_rgba(99,102,241,0.15)]' : 'bg-slate-900/50 border-white/5 hover:border-white/10'}`}>
                                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${i === 0 ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'}`}>
                                        {i === 0 && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                                    </div>
                                    <span className={`text-[10px] ${i === 0 ? 'text-white font-bold' : 'text-slate-400'}`}>{opt}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Next Question Preview (Bottom Fade) */}
                    <div className="shrink-0 opacity-30 mt-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Question 4</span>
                            <div className="h-px flex-grow bg-white/5" />
                        </div>
                        <p className="text-[10px] text-slate-500">Evaluating the impact of the capitalization policy on the cash flow...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
