'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CTASectionProps {
    user: any;
}

export function CTASection({ user }: CTASectionProps) {
    return (
        <section className="py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-600">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-transparent opacity-90" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            </div>

            <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
                        Ready to Crush Your Exam?
                    </h2>
                    <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
                        Join thousands of successful candidates who trusted our AI-driven platform.
                        Start with 30 free questions today.
                    </p>
                    <Link href={user ? "/dashboard" : "/login"}>
                        <Button size="xl" className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold h-14 px-10 rounded-full shadow-2xl shadow-indigo-900/50 hover:scale-105 transition-transform">
                            Get Started for Free
                            <ArrowRight className="h-5 w-5 ml-2" />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
