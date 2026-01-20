'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const categories = [
    { id: 'GENERAL', label: 'General Feedback' },
    { id: 'AI_ACCURACY', label: 'AI Accuracy' },
    { id: 'UI_UX', label: 'Design & Experience' },
    { id: 'CONTENT', label: 'CFA Content' },
    { id: 'BUG', label: 'Report a Bug' },
    { id: 'FEATURE_REQUEST', label: 'Feature Request' },
];

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
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
        return () => setMounted(false);
    }, []);

    const handleSubmit = async () => {
        if (rating === 0) return;

        setIsSubmitting(true);
        try {
            const token = await user?.getIdToken();
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
                    improvements
                }),
            });

            if (res.ok) {
                setIsSuccess(true);
                // Reset form after success
                setTimeout(() => {
                    onClose();
                    // Small delay before resetting state to allow exit animation
                    setTimeout(() => {
                        setIsSuccess(false);
                        setRating(0);
                        setStrengths('');
                        setWeaknesses('');
                        setBugs('');
                        setImprovements('');
                        setCategory('GENERAL');
                    }, 500);
                }, 2000);
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
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-md z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">Help Us Improve</h2>
                                <p className="text-slate-400 text-xs mt-1 font-medium italic">We value your honest feedback</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-full p-2 text-slate-500 hover:bg-white/5 hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-8 no-scrollbar scrollbar-premium">
                            {isSuccess ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-16 text-center"
                                >
                                    <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20">
                                        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-3">Submission Success!</h3>
                                    <p className="text-slate-400 max-w-[280px] leading-relaxed">
                                        Your feedback has been received. Thank you for helping us make MentisAI the best it can be!
                                    </p>
                                </motion.div>
                            ) : (
                                <>
                                    {/* Rating */}
                                    <div className="space-y-4">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Rate your experience</label>
                                        <div className="flex items-center gap-2 justify-center py-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setRating(star)}
                                                    className="transition-transform active:scale-90"
                                                >
                                                    <Star
                                                        className={cn(
                                                            "h-10 w-10 transition-colors",
                                                            (hoverRating || rating) >= star
                                                                ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                                                : "text-slate-700 hover:text-slate-600"
                                                        )}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/5" />

                                    {/* Category */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Subject</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => setCategory(cat.id)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-xl text-xs font-medium border transition-all",
                                                        category === cat.id
                                                            ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400 ring-1 ring-indigo-500/30"
                                                            : "bg-white/5 border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/10"
                                                    )}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/5" />

                                    {/* Questions */}
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-slate-200">What do you think is our app's strength?</label>
                                            <textarea
                                                value={strengths}
                                                onChange={(e) => setStrengths(e.target.value)}
                                                placeholder="Tell us what you like..."
                                                className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-slate-200">What do you think is our app's weakness?</label>
                                            <textarea
                                                value={weaknesses}
                                                onChange={(e) => setWeaknesses(e.target.value)}
                                                placeholder="What's missing or needs work?"
                                                className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-slate-200">What bugs did you find?</label>
                                            <textarea
                                                value={bugs}
                                                onChange={(e) => setBugs(e.target.value)}
                                                placeholder="Be as specific as possible (page, action, etc.)"
                                                className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-slate-200">How can we improve for you?</label>
                                            <textarea
                                                value={improvements}
                                                onChange={(e) => setImprovements(e.target.value)}
                                                placeholder="Your suggestions for the future..."
                                                className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer / Submit */}
                        {!isSuccess && (
                            <div className="p-8 pt-4 border-t border-white/5 bg-slate-900/80 backdrop-blur-md">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || rating === 0}
                                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.99] disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="h-5 w-5" />
                                            Submit Detailed Feedback
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
