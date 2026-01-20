'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { GraduationCap, Mail, Lock, ArrowLeft, ArrowRight, Github, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } from '@/lib/auth-utils';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            alert('Failed to sign in with Google');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || (isSignUp && !name)) {
            alert('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        try {
            let firebaseUser;
            if (isSignUp) {
                firebaseUser = await signUpWithEmail(email, password, name);
                alert('Account created successfully!');
            } else {
                firebaseUser = await signInWithEmail(email, password);
            }

            // Manually trigger sync to store data in Supabase
            if (firebaseUser) {
                const token = await firebaseUser.getIdToken();
                await fetch('/api/user/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        name: isSignUp ? name : firebaseUser.displayName,
                        image: firebaseUser.photoURL,
                        password: password, // Send password to be hashed and stored
                    }),
                });
            }

            router.push('/dashboard');
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]" />
            </div>

            {/* Back to Home Button */}
            <div className="absolute top-8 left-8 z-20">
                <Link href="/">
                    <Button variant="ghost" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-full border border-white/5">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Button>
                </Link>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="inline-flex h-16 w-16 items-center justify-center mb-6"
                        >
                            <Image
                                src="/logo-brain-v3.png"
                                alt="Logo"
                                width={48}
                                height={48}
                                priority
                                className="h-12 w-12 object-contain brightness-125 saturate-150 drop-shadow-[0_0_12px_rgba(34,197,253,0.6)]"
                            />
                        </motion.div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">
                            {isSignUp ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-slate-400 mt-2">
                            {isSignUp ? 'Start your CFA journey today' : 'Sign in to continue your CFA journey'}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Button
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            variant="outline"
                            className="w-full h-12 border-white/10 hover:bg-white/5 text-white flex items-center justify-center gap-3 rounded-xl transition-all"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </Button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#0a0a0f] px-4 text-slate-500">Or continue with email</span>
                            </div>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit} method="POST" action="#">
                            {isSignUp && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-2 overflow-hidden"
                                >
                                    <Label htmlFor="name" className="text-slate-300 ml-1">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            autoComplete="name"
                                            required={isSignUp}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            className="pl-10 h-12 bg-white/5 border-white/10 text-white rounded-xl focus:ring-indigo-500/50"
                                        />
                                    </div>
                                </motion.div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-300 ml-1">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                                    <Input
                                        id="email"
                                        name="username"
                                        type="email"
                                        autoComplete="username"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        className="pl-10 h-12 bg-white/5 border-white/10 text-white rounded-xl focus:ring-indigo-500/50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <Label htmlFor="password" title="Password feature coming soon" className="text-slate-300">Password</Label>
                                    {!isSignUp && (
                                        <Link
                                            href="/reset-password"
                                            className="text-xs text-indigo-400 hover:text-indigo-300"
                                        >
                                            Forgot?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete={isSignUp ? "new-password" : "current-password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="pl-10 h-12 bg-white/5 border-white/10 text-white rounded-xl focus:ring-indigo-500/50"
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 group transition-all disabled:opacity-50"
                            >
                                {isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </form>
                    </div>

                    <p className="text-center mt-8 text-slate-400 text-sm">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                            {isSignUp ? 'Sign In' : 'Create one'}
                        </button>
                    </p>
                </div>

                <div className="mt-8 text-center text-slate-500 text-xs">
                    By continuing, you agree to our{' '}
                    <Link href="#" className="underline">Terms of Service</Link> and{' '}
                    <Link href="#" className="underline">Privacy Policy</Link>.
                </div>
            </motion.div>
        </div>
    );
}
