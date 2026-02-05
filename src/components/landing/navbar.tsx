'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Menu, X, ArrowRight } from 'lucide-react';
import { logout } from '@/lib/auth-utils';
import { User } from 'firebase/auth';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

interface LandingNavbarProps {
    user: User | null;
    dbUserSubscription?: string;
    loadingState: 'loading' | 'exiting' | 'complete';
}

export function LandingNavbar({ user, dbUserSubscription, loadingState }: LandingNavbarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Mission', href: '#mission' },
        { name: 'Features', href: '#features' },
        { name: 'Why MentisAI?', href: '#why-us' },
        { name: 'Curriculum', href: '#curriculum' },
        ...(dbUserSubscription !== 'PRO' ? [{ name: 'Pricing', href: '#pricing' }] : []),
    ];

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

                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-slate-400 light:text-slate-600 hover:text-white light:hover:text-indigo-600 transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-4">
                            <ThemeToggle />
                            {user ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-slate-300 light:text-slate-600 hidden xl:inline-block truncate max-w-[100px]">Hi, {user.displayName?.split(' ')[0]}</span>
                                    <Link href="/dashboard">
                                        <Button variant="ghost" className="text-slate-300 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-200">Dashboard</Button>
                                    </Link>
                                </div>
                            ) : (
                                <Link href="/login">
                                    <Button variant="ghost" className="text-slate-300 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:bg-white/5 light:hover:bg-slate-200">Sign In</Button>
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <div className="lg:hidden flex items-center gap-3">
                            <div className="sm:hidden">
                                <ThemeToggle />
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                            >
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>

                        {/* CTA - visible on all screens but maybe smaller on mobile */}
                        <Link href={user ? "/dashboard" : "/login"} className="hidden sm:block">
                            <Button className="bg-white light:bg-indigo-600 text-slate-900 light:text-white hover:bg-slate-100 light:hover:bg-indigo-700 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.2)] light:shadow-indigo-500/20 transition-transform hover:scale-[1.02]">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden border-t border-white/5 bg-slate-950/95 backdrop-blur-2xl overflow-hidden"
                    >
                        <div className="px-4 py-6 space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block text-lg font-medium text-slate-400 hover:text-white py-2 border-b border-white/5"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-4 flex flex-col gap-4">
                                {user ? (
                                    <>
                                        <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button className="w-full justify-between" variant="ghost">
                                                Dashboard <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            onClick={async () => {
                                                await logout();
                                                window.location.reload();
                                            }}
                                            variant="ghost"
                                            className="w-full justify-start text-rose-400"
                                        >
                                            Logout
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button className="w-full" variant="ghost">Sign In</Button>
                                        </Link>
                                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button className="w-full bg-white text-slate-900">Get Started</Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
