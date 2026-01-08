'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Mail, KeyRound, Sparkles, ChevronLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { changePassword, resetPassword, confirmReset, verifyResetCode } from '@/lib/auth-utils';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';

function ResetPasswordContent() {
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [step, setStep] = useState<'request' | 'reset'>('request');
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const oobCode = searchParams.get('oobCode');

    useEffect(() => {
        const checkCode = async () => {
            if (oobCode) {
                setStep('reset');
                try {
                    const verifiedEmail = await verifyResetCode(oobCode);
                    if (verifiedEmail) setEmail(verifiedEmail);
                } catch (err: any) {
                    setError('This reset link is invalid or has expired. Please request a new one.');
                }
            } else if (user) {
                setStep('reset');
            } else {
                setStep('request');
            }
        };
        checkCode();
    }, [oobCode, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        setIsLoading(true);
        try {
            if (step === 'request') {
                if (!email) throw new Error('Please enter your email address.');
                await resetPassword(email.trim().toLowerCase());
                setSuccess(true);
            } else {
                if (password.length < 6) throw new Error('Password must be at least 6 characters.');
                if (password !== confirmPassword) throw new Error('Passwords do not match.');

                if (oobCode) {
                    await confirmReset(oobCode, password);
                } else if (user) {
                    await changePassword(password);
                } else {
                    throw new Error('Verification required.');
                }

                const response = await fetch('/api/user/update-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: user?.uid || null,
                        email: !user ? email.trim().toLowerCase() : null,
                        password: password,
                    }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Database sync failed');
                }

                setSuccess(true);
                setTimeout(() => {
                    router.push(user ? '/dashboard' : '/login');
                }, 3000);
            }
        } catch (err: any) {
            setError(err.message || 'Operation failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#07070a] flex items-center justify-center p-6 relative overflow-hidden">
            {/* dynamic background effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/15 rounded-full blur-[140px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-violet-600/15 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[460px] relative z-10"
            >
                <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 p-10 md:p-12 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden ring-1 ring-white/5">
                    {/* Animated top border */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

                    <div className="flex flex-col items-center text-center mb-10">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative mb-6"
                        >
                            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
                            <div className="relative h-20 w-20 flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-[2rem] border border-white/10 shadow-inner group">
                                <AnimatePresence mode="wait">
                                    {step === 'request' ? (
                                        <motion.div key="mail" initial={{ rotate: -10, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 10, opacity: 0 }}>
                                            <Mail className="h-10 w-10 text-indigo-400" />
                                        </motion.div>
                                    ) : (
                                        <motion.div key="shield" initial={{ rotate: -10, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 10, opacity: 0 }}>
                                            <ShieldCheck className="h-10 w-10 text-violet-400" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-indigo-300 animate-bounce" />
                            </div>
                        </motion.div>

                        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">
                            {step === 'request' ? 'Restore Access' : 'Vault Security'}
                        </h1>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step + (user ? 'user' : 'no-user')}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="min-h-[20px]"
                            >
                                {user ? (
                                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-300 text-xs font-medium">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                        {user.email}
                                    </span>
                                ) : email && step === 'reset' ? (
                                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-500/10 rounded-full border border-violet-500/20 text-violet-300 text-xs font-medium">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                                        {email}
                                    </span>
                                ) : (
                                    <p className="text-slate-400 text-sm max-w-[280px] leading-relaxed">
                                        {step === 'request'
                                            ? "Request a secure bridge to your MentisAI account"
                                            : "Establish a new high-security cipher for your vault"}
                                    </p>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {!success ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs flex items-center gap-3"
                                >
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    {error}
                                </motion.div>
                            )}

                            <div className="space-y-5">
                                {step === 'request' && (
                                    <div className="space-y-2">
                                        <Label className="text-slate-400 text-xs uppercase tracking-widest ml-1 font-semibold">Registered Email</Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                            <Input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="guardian@mentis.ai"
                                                className="h-16 bg-white/5 border-white/10 text-white rounded-[1.25rem] focus:ring-2 focus:ring-indigo-500/40 transition-all text-base pl-14 placeholder:text-slate-600"
                                            />
                                        </div>
                                    </div>
                                )}

                                {step === 'reset' && (
                                    <>
                                        {!user && !oobCode && (
                                            <div className="space-y-2">
                                                <Label className="text-slate-400 text-xs uppercase tracking-widest ml-1 font-semibold">Account Email</Label>
                                                <div className="relative group">
                                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                                                    <Input
                                                        type="email"
                                                        required
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        placeholder="name@example.com"
                                                        className="h-16 bg-white/5 border-white/10 text-white rounded-[1.25rem] focus:ring-2 focus:ring-violet-500/40 transition-all text-base pl-14 placeholder:text-slate-600"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <Label className="text-slate-400 text-xs uppercase tracking-widest ml-1 font-semibold">New Cipher</Label>
                                            <div className="relative group">
                                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                                <Input
                                                    type="password"
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="h-16 bg-white/5 border-white/10 text-white rounded-[1.25rem] focus:ring-2 focus:ring-indigo-500/40 transition-all text-base pl-14 placeholder:text-slate-600"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-400 text-xs uppercase tracking-widest ml-1 font-semibold">Confirm Cipher</Label>
                                            <div className="relative group">
                                                <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                                <Input
                                                    type="password"
                                                    required
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="h-16 bg-white/5 border-white/10 text-white rounded-[1.25rem] focus:ring-2 focus:ring-indigo-500/40 transition-all text-base pl-14 placeholder:text-slate-600"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <Button
                                disabled={isLoading}
                                className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-[1.25rem] shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)] group text-lg transition-all active:scale-[0.98] relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-700 -translate-x-full" />
                                <span className="relative flex items-center justify-center gap-2">
                                    {isLoading ? 'Processing Access...' : (step === 'request' ? 'Dispatch Reset Link' : 'Secure Account')}
                                    {!isLoading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                                </span>
                            </Button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6 flex flex-col items-center"
                        >
                            <div className="h-24 w-24 flex items-center justify-center bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 mb-8 shadow-[0_0_40px_-5px_rgba(16,185,129,0.2)]">
                                <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">
                                {step === 'request' ? 'Cipher Bridge Sent' : 'Vault Secured'}
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-[280px]">
                                {step === 'request'
                                    ? `A secure frequency has been sent to your mail. Please use the link within to bypass the lock.`
                                    : 'Your new security cipher is active. Re-routing to your command center...'}
                            </p>

                            <div className="flex flex-col gap-3 w-full">
                                <Link href="/login" className="w-full">
                                    <Button variant="outline" className="w-full h-14 border-white/10 hover:bg-white/5 text-white rounded-2xl transition-all">
                                        Return to Login
                                    </Button>
                                </Link>
                                {step === 'request' && (
                                    <button
                                        onClick={() => setSuccess(false)}
                                        className="text-slate-500 hover:text-indigo-400 text-xs font-medium transition-colors py-2"
                                    >
                                        Mistake? Try another email
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="mt-10 text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-all text-sm font-semibold group/back"
                    >
                        <ChevronLeft className="h-4 w-4 group-hover/back:-translate-x-1 transition-transform" />
                        Back to Command Center
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#07070a] flex items-center justify-center text-indigo-400">Loading Security...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
