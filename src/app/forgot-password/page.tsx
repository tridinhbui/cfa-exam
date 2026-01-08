'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ShieldQuestion, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPassword } from '@/lib/auth-utils';
import Image from 'next/image';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email) {
            setError('Please enter your email address.');
            return;
        }

        setIsLoading(true);
        try {
            await resetPassword(email);
            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50" />

                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="inline-flex h-20 w-20 items-center justify-center mb-6 bg-violet-500/10 rounded-3xl border border-violet-500/20 shadow-inner"
                        >
                            <ShieldQuestion className="h-10 w-10 text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]" />
                        </motion.div>
                        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Lost Access?</h2>
                        <p className="text-slate-400">No worries! We'll send you a link to recover your account</p>
                    </div>

                    {!success ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3"
                                >
                                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                    {error}
                                </motion.div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-slate-300 ml-1 flex items-center gap-2">
                                    <Mail className="h-3 w-3" /> Email Address
                                </Label>
                                <Input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-violet-500/40 transition-all text-lg pl-6"
                                />
                            </div>

                            <Button
                                disabled={isLoading}
                                className="w-full h-14 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-violet-500/20 group text-lg"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </div>
                                ) : (
                                    <>
                                        Send Recovery Link
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8 space-y-4"
                        >
                            <div className="inline-flex h-20 w-20 items-center justify-center bg-emerald-500/10 rounded-full mb-4">
                                <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Check Your Email</h3>
                            <p className="text-slate-400">
                                We've sent a password recovery link to <span className="text-white font-medium">{email}</span>. Please check your inbox and spam folder.
                            </p>
                            <div className="pt-4">
                                <Link href="/login">
                                    <Button variant="outline" className="h-12 border-white/10 hover:bg-white/5 text-white rounded-xl px-8">
                                        Return to Login
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </div>

                {!success && (
                    <div className="mt-8 text-center">
                        <Link
                            href="/login"
                            className="text-slate-500 hover:text-violet-400 transition-colors text-sm font-medium"
                        >
                            ← Back to Login
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
