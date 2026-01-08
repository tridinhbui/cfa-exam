'use client';

import { motion } from 'framer-motion';
import {
    Flag,
    ChevronLeft,
    ChevronRight,
    X,
    CheckCircle2
} from 'lucide-react';

export function HeroQuiz() {
    return (
        <div className="w-full h-full bg-[#0a0a0f] rounded-xl overflow-hidden shadow-2xl flex flex-col relative select-none pointer-events-none border border-white/5">
            {/* Window Header */}
            <div className="h-10 bg-slate-900 border-b border-white/5 flex items-center px-4 justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                    <X className="w-3 h-3" />
                    <span>Exit Quiz</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                    <Flag className="w-3 h-3" />
                    <span>Flag</span>
                </div>
            </div>

            {/* Quiz Content */}
            <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden bg-slate-950/50">
                {/* Question Numbers */}
                <div className="flex justify-center gap-1.5 opacity-80">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <div
                            key={num}
                            className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold border ${num === 1
                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_10px_rgba(79,70,229,0.4)]'
                                    : 'bg-slate-900 border-white/5 text-slate-500'
                                }`}
                        >
                            {num}
                        </div>
                    ))}
                </div>

                {/* Main Question Card */}
                <div className="flex-1 rounded-2xl border border-white/5 bg-slate-900/30 p-6 flex flex-col gap-6 relative overflow-hidden group">
                    <div className="flex justify-between items-center">
                        <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Question 1 of 10</span>
                        <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-white/5">Ethics</span>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm md:text-base font-medium text-slate-200 leading-relaxed">
                            According to the CFA Institute Code of Ethics, members and candidates must place the integrity of the investment profession and the interests of clients above their own personal interests. Which of the following actions would most likely violate this principle?
                        </h3>
                    </div>

                    {/* Options */}
                    <div className="space-y-3 mt-4">
                        {[
                            { letter: 'A', text: 'A portfolio manager who discloses potential conflicts of interest to clients' },
                            { letter: 'B', text: 'An analyst who recommends a security in which she owns shares, without disclosure', selected: true },
                            { letter: 'C', text: 'A financial advisor who refers clients to other professionals when appropriate' }
                        ].map((opt) => (
                            <div
                                key={opt.letter}
                                className={`p-4 rounded-xl border transition-all flex items-center gap-4 ${opt.selected
                                        ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.1)]'
                                        : 'bg-slate-900/50 border-white/5 opacity-60'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${opt.selected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                                    }`}>
                                    {opt.letter}
                                </div>
                                <p className="text-xs text-slate-300 flex-1">{opt.text}</p>
                                {opt.selected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between opacity-80 pt-2 shrink-0">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                        0 of 10 answered
                    </div>
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Shine */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />
        </div>
    );
}
