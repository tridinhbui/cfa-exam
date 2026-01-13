'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { logout } from '@/lib/auth-utils';
import { User } from 'firebase/auth';

interface LandingNavbarProps {
    user: User | null;
    dbUserSubscription?: string;
    loadingState: 'loading' | 'exiting' | 'complete';
}

export function LandingNavbar({ user, dbUserSubscription, loadingState }: LandingNavbarProps) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 light:border-slate-200 bg-slate-950/60 light:bg-white/80 backdrop-blur-xl transition-all duration-300">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-3">
                        {loadingState === 'complete' && (
                            <motion.div
                                layoutId="brand-logo"
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 1 }}
                                style={{ opacity: 1 }}
                                className="flex h-10 w-10 items-center justify-center"
                                transition={{
                                    duration: 0.7,
                                    ease: [0.4, 0, 0.2, 1]
                                }}
                            >
                                <Image
                                    src="/logo-brain-v3.png"
                                    alt="Logo"
                                    width={32}
                                    height={32}
                                    priority
                                    className="h-8 w-8 object-contain brightness-125 saturate-150 drop-shadow-[0_0_8px_rgba(34,197,253,0.5)]"
                                />
                            </motion.div>
                        )}

                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="text-lg font-bold text-white light:text-slate-900 tracking-tight"
                        >
                            Mentis<span className="text-indigo-400 light:text-indigo-600">AI</span>
                        </motion.span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#mission" className="text-sm font-medium text-slate-400 light:text-slate-600 hover:text-white light:hover:text-indigo-600 transition-colors">Mission</Link>
                        <Link href="#features" className="text-sm font-medium text-slate-400 light:text-slate-600 hover:text-white light:hover:text-indigo-600 transition-colors">Features</Link>
                        {dbUserSubscription !== 'PRO' && (
                            <Link href="#pricing" className="text-sm font-medium text-slate-400 light:text-slate-600 hover:text-white light:hover:text-indigo-600 transition-colors">Pricing</Link>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-300 light:text-slate-600 hidden sm:inline-block">Hi, {user.displayName?.split(' ')[0]}</span>
                                <Link href="/dashboard">
                                    <Button variant="ghost" className="text-slate-300 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-200">Dashboard</Button>
                                </Link>
                                <Button
                                    onClick={async () => {
                                        await logout();
                                        window.location.reload();
                                    }}
                                    variant="ghost"
                                    className="text-rose-400 light:text-rose-600 hover:text-rose-300 light:hover:text-rose-700 hover:bg-rose-500/10 light:hover:bg-rose-50"
                                >
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" className="text-slate-300 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-200">Sign In</Button>
                                </Link>
                                <Link href={user ? "/dashboard" : "/login"}>
                                    <Button className="bg-white light:bg-indigo-600 text-slate-900 light:text-white hover:bg-slate-100 light:hover:bg-indigo-700 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.2)] light:shadow-indigo-500/20 transition-transform hover:scale-[1.02]">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
