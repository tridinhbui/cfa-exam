'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';

export function MissionChat() {
    const [displayText, setDisplayText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const fullText = "Explain convexity like I'm 5...";

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            if (i < fullText.length) {
                setDisplayText(fullText.slice(0, i + 1));
                i++;
            } else {
                clearInterval(interval);
                setTimeout(() => setIsTyping(true), 1000);
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full max-w-md mx-auto">
            {/* Search/Prompt Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="glass p-4 rounded-2xl mb-6 relative z-20 mx-8 border-white/5"
            >
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-indigo-400">You</span>
                    </div>
                    <div className="h-8 flex-1 bg-slate-800/50 rounded-lg px-3 flex items-center text-sm text-slate-200 font-medium">
                        {displayText}
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="w-[2px] h-4 bg-indigo-400 ml-1"
                        />
                    </div>
                    <motion.div
                        animate={{ scale: displayText === fullText ? [1, 1.1, 1] : 1 }}
                        className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0"
                    >
                        <Send className="h-4 w-4 text-white" />
                    </motion.div>
                </div>
            </motion.div>

            {/* AI Response Card */}
            <AnimatePresence>
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 100 }}
                        className="glass p-6 rounded-3xl relative z-10 border-indigo-500/20"
                    >
                        {/* Floating Tag */}
                        <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-3 -right-3 bg-indigo-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1"
                        >
                            <Sparkles className="w-3 h-3" />
                            AI Explanation
                        </motion.div>

                        <div className="flex gap-4 mb-4">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-1">CFA Prep AI</h4>
                                <p className="text-xs text-indigo-300">Just now</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Imagine a <span className="text-indigo-400 font-semibold">smile</span>! 😊
                            </p>
                            <p className="text-slate-300 text-sm leading-relaxed text-wrap">
                                <span className="text-white font-medium">Duration</span> is a straight line estimate. But bonds are curved (like a smile).
                            </p>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="bg-slate-950/50 rounded-xl p-3 border border-indigo-500/10 mt-2"
                            >
                                <p className="text-xs text-slate-400 font-mono italic">
                                    "Convexity = The curvature that Duration misses."
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Decorative Blur */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/10 blur-3xl -z-10 rounded-full" />
        </div>
    );
}
