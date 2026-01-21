"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, Star, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const categories = [
    { id: 'GENERAL', label: 'Overall App' },
    { id: 'CONTENT', label: 'Quiz & Study' },
    { id: 'UI_UX', label: 'UI & Performance' },
    { id: 'AI_ACCURACY', label: 'AI Assistance' },
    { id: 'BUG', label: 'Found a Bug' },
    { id: 'FEATURE_REQUEST', label: 'New Feature' }
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [category, setCategory] = useState('GENERAL');
    const [strengths, setStrengths] = useState('');
    const [weaknesses, setWeaknesses] = useState('');
    const [bugs, setBugs] = useState('');
    const [improvements, setImprovements] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setRating(0);
            setHoverRating(0);
            setCategory('GENERAL');
            setStrengths('');
            setWeaknesses('');
            setBugs('');
            setImprovements('');
            setIsSuccess(false);

            // Standard scroll lock
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [isOpen]);

    const handleSubmit = async () => {
        if (rating === 0) return;
        setIsSubmitting(true);
        try {
            const token = user ? await user.getIdToken() : '';
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    rating,
                    category,
                    strengths,
                    weaknesses,
                    bugs,
                    improvements,
                    userId: user?.uid,
                    userEmail: user?.email,
                }),
            });

            if (res.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    onClose();
                    setIsSuccess(false);
                }, 3000);
            }
        } catch (error) {
            console.error('Feedback submission failed', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100000] overflow-y-auto bg-slate-950/95 backdrop-blur-2xl scrollbar-premium overscroll-contain"
                    style={{ isolation: 'isolate' }}
                    data-lenis-prevent="true"
                    onClick={onClose}
                >
                    {/* Global Scroll Lock Force */}
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        html, body { 
                            overflow: hidden !important; 
                            height: 100vh !important;
                            width: 100% !important;
                        }
                    `}} />

                    <div className="min-h-screen flex items-center justify-center p-4 md:p-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-[0_0_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-10 pb-6 flex items-center justify-between border-b border-white/5 bg-slate-900/50">
                                <div>
                                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Help Us Improve</h2>
                                    <p className="text-slate-400 text-sm mt-1 font-medium italic">Your insights shape our future.</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="rounded-full p-3 text-slate-500 hover:bg-white/10 hover:text-white transition-all transform hover:rotate-90"
                                >
                                    <X className="h-7 w-7" />
                                </button>
                            </div>

                            {/* Content Area */}
                            <div className="p-10 space-y-10">
                                {isSuccess ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center py-20 text-center"
                                    >
                                        <div className="h-28 w-28 rounded-full bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20">
                                            <CheckCircle2 className="h-14 w-14 text-emerald-500" />
                                        </div>
                                        <h3 className="text-3xl font-bold text-white mb-4">You're Awesome!</h3>
                                        <p className="text-slate-400 max-w-[320px] text-lg leading-relaxed">
                                            Feedback submitted successfully. Thank you for being part of our journey!
                                        </p>
                                    </motion.div>
                                ) : (
                                    <>
                                        {/* Rating Selection */}
                                        <div className="space-y-6 text-center">
                                            <label className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">Overall Experience</label>
                                            <div className="flex items-center gap-3 justify-center">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        onMouseEnter={() => setHoverRating(star)}
                                                        onMouseLeave={() => setHoverRating(0)}
                                                        onClick={() => setRating(star)}
                                                        className="transition-all hover:scale-110 active:scale-95 p-1"
                                                    >
                                                        <Star
                                                            className={cn(
                                                                "h-12 w-12 transition-all duration-300",
                                                                (hoverRating || rating) >= star
                                                                    ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]"
                                                                    : "text-slate-800 hover:text-slate-700"
                                                            )}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                                        {/* Category Grid */}
                                        <div className="space-y-5">
                                            <label className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">What's this about?</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {categories.map((cat) => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => setCategory(cat.id)}
                                                        className={cn(
                                                            "px-5 py-3 rounded-2xl text-sm font-bold border transition-all duration-300",
                                                            category === cat.id
                                                                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                                                                : "bg-white/5 border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/10"
                                                        )}
                                                    >
                                                        {cat.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                                        {/* Detailed Questions */}
                                        <div className="space-y-8">
                                            {[
                                                { label: "App's Strength", val: strengths, setter: setStrengths, placeholder: "What do you love most?" },
                                                { label: "App's Weakness", val: weaknesses, setter: setWeaknesses, placeholder: "What can we do better?" },
                                                { label: "Bugs Found", val: bugs, setter: setBugs, placeholder: "Any technical glitches?" },
                                                { label: "Future Improvements", val: improvements, setter: setImprovements, placeholder: "Any feature requests?" }
                                            ].map((q, i) => (
                                                <div key={i} className="space-y-4">
                                                    <label className="text-lg font-bold text-slate-200 block px-1">{q.label}</label>
                                                    <textarea
                                                        value={q.val}
                                                        onChange={(e) => q.setter(e.target.value)}
                                                        placeholder={q.placeholder}
                                                        className="w-full h-32 bg-slate-950/50 border border-white/10 rounded-3xl p-6 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none shadow-inner"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Submit Footer */}
                            {!isSuccess && (
                                <div className="p-10 pt-6 border-t border-white/5 bg-slate-900/80 backdrop-blur-md">
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || rating === 0}
                                        className="w-full h-16 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 transition-all shadow-2xl shadow-indigo-600/30 active:scale-[0.98]"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="h-6 w-6" />
                                                Finalize Submission
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-center text-[10px] text-slate-600 mt-4 uppercase tracking-widest font-black">Anonymous Submission Secured</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};
