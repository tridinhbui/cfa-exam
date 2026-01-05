'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { CheckCircle2, ChevronDown, ChevronUp, Lightbulb, ArrowRight, HelpCircle, MousePointer2 } from 'lucide-react';

export function MissionChat() {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [cursorPos, setCursorPos] = useState({ x: '50%', y: '100%', opacity: 0 });
    const [isClicked, setIsClicked] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const smoothScrollTo = (targetY: number) => {
        const element = scrollContainerRef.current;
        if (!element) return;

        animate(element.scrollTop, targetY, {
            duration: 1.2,
            ease: [0.32, 0.72, 0, 1],
            onUpdate: (latest) => {
                element.scrollTop = latest;
            }
        });
    };

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const runAnimation = async () => {
            // 1. Reset
            setSelectedAnswer(null);
            setShowExplanation(false);
            setCursorPos({ x: '50%', y: '95%', opacity: 0 });
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = 0;
            }

            // 2. Approach Option B
            await wait(1500);
            setCursorPos({ x: '50%', y: '55%', opacity: 1 });

            await wait(1200);
            setIsClicked(true);
            setSelectedAnswer('B');
            setTimeout(() => setIsClicked(false), 200);

            // Move to scrollbar area
            await wait(800);
            setCursorPos({ x: '92%', y: '55%', opacity: 1 });

            // 3. Scroll and Approach Explanation Reveal
            await wait(800);
            smoothScrollTo(180);
            await wait(1500);
            setCursorPos({ x: '50%', y: '75%', opacity: 1 });

            await wait(1200);
            setIsClicked(true);
            setShowExplanation(true);
            setTimeout(() => setIsClicked(false), 200);

            // Move to scrollbar area again
            await wait(800);
            setCursorPos({ x: '92%', y: '75%', opacity: 1 });

            // 4. Scroll to see explanation
            await wait(800);
            smoothScrollTo(500);
            await wait(1500);
            setCursorPos(prev => ({ ...prev, opacity: 0 }));

            // 5. Loop reset
            timeoutId = setTimeout(runAnimation, 6000);
        };

        const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        runAnimation();

        return () => clearTimeout(timeoutId);
    }, []);

    const options = [
        { id: 'A', text: 'A portfolio manager who discloses potential conflicts of interest to clients' },
        { id: 'B', text: 'An analyst who recommends a security in which she owns shares, without disclosure', isCorrect: true },
        { id: 'C', text: 'A financial advisor who refers clients to other professionals when appropriate' },
    ];

    return (
        <div className="relative w-full max-w-lg mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass rounded-[2rem] overflow-hidden border-white/5 shadow-2xl scale-[0.95] origin-top"
            >
                {/* Fixed Header */}
                <div className="p-5 sm:p-6 bg-white/5 border-b border-white/5 relative z-10 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                            Question 1 of 10
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                            Ethics
                        </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-slate-200 leading-snug">
                        According to the CFA Institute Code of Ethics, members and candidates must place the integrity of the investment profession and the interests of clients above their own personal interests. Which of the following actions would most likely violate this principle?
                    </h3>
                </div>

                {/* Scrollable Content Area */}
                <div
                    ref={scrollContainerRef}
                    className="h-[380px] overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-4 scroll-smooth"
                >
                    <div className="space-y-4">
                        {options.map((opt) => {
                            const isSelected = selectedAnswer === opt.id;
                            const isCorrect = opt.isCorrect;

                            return (
                                <div
                                    key={opt.id}
                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-500 flex items-start gap-4 ${isSelected
                                        ? (isCorrect ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-rose-500/10 border-rose-500')
                                        : 'bg-slate-900/40 border-white/5'
                                        }`}
                                >
                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 font-bold transition-colors duration-500 ${isSelected
                                        ? (isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white')
                                        : 'bg-slate-800 text-slate-400'
                                        }`}>
                                        {isSelected && isCorrect ? <CheckCircle2 className="h-5 w-5" /> : opt.id}
                                    </div>
                                    <span className={`text-sm sm:text-base leading-snug pt-0.5 transition-colors duration-500 ${isSelected ? 'text-white' : 'text-slate-400'
                                        }`}>
                                        {opt.text}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <AnimatePresence>
                        {selectedAnswer === 'B' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="space-y-4 pb-4"
                            >
                                <div className="mt-2 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-emerald-400 mb-1">Correct!</h4>
                                        <p className="text-sm text-emerald-400/80">Great job on this question.</p>
                                    </div>
                                </div>

                                <div className="w-full h-12 rounded-xl border border-white/10 bg-white/5 text-slate-300 text-sm font-medium flex items-center justify-center gap-2">
                                    <Lightbulb className="h-4 w-4 text-amber-400" />
                                    Explanation RevealING...
                                </div>

                                <AnimatePresence>
                                    {showExplanation && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-6 rounded-2xl glass border-indigo-500/20"
                                        >
                                            <div className="flex items-center gap-2 mb-4 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                                                <HelpCircle className="h-4 w-4" />
                                                Explanation
                                            </div>
                                            <p className="text-slate-300 text-sm leading-relaxed">
                                                Standard VI(A) - Disclosure of Conflicts requires members and candidates to make full and fair disclosure of all matters that could reasonably be expected to impair their independence and objectivity. An analyst who recommends a security in which she owns shares without disclosing this ownership is violating this standard by not revealing a potential conflict of interest.
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Footer Nav */}
                                <div className="mt-8 flex justify-between items-center border-t border-white/5 pt-6">
                                    <div className="text-xs text-slate-500">1 of 10 answered</div>
                                    <div className="flex gap-3">
                                        <div className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest leading-none flex items-center">Prev</div>
                                        <div className="px-6 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center gap-2 uppercase tracking-widest group leading-none">
                                            Next
                                            <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Decorative Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/10 blur-[120px] -z-10" />

            {/* Animated Ghost Cursor */}
            <motion.div
                animate={{
                    left: cursorPos.x,
                    top: cursorPos.y,
                    opacity: cursorPos.opacity,
                    scale: isClicked ? 0.8 : 1
                }}
                transition={{
                    duration: 0.8,
                    ease: [0.23, 1, 0.32, 1],
                    scale: { duration: 0.2 }
                }}
                className="absolute z-50 pointer-events-none drop-shadow-2xl translate-x-[-50%] translate-y-[-50%]"
            >
                <MousePointer2 className="w-6 h-6 text-white fill-indigo-500" />
                <AnimatePresence>
                    {isClicked && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0.5 }}
                            animate={{ scale: 2, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-0 left-0 w-6 h-6 bg-indigo-500 rounded-full -z-10"
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
