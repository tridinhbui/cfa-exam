'use client';

import { motion } from 'framer-motion';
import { Zap, Layout, ShieldCheck, TrendingUp } from 'lucide-react';
import { GlowingEffect } from '@/components/ui/glowing-effect';

const whyChooseUs = [
    {
        title: 'Adaptive AI technology',
        description: 'Our algorithms identify your knowledge gaps and dynamically adjust your curriculum in real-time.',
        icon: Zap,
        color: 'from-indigo-400 to-cyan-400',
    },
    {
        title: 'CBT Simulation',
        description: 'Practice in an environment that precisely mirrors the official CFA Institute computer-based exam.',
        icon: Layout,
        color: 'from-violet-400 to-purple-400',
    },
    {
        title: 'Charterholder Curated',
        description: 'Every question and explanation is vetted by CFA charterholders for maximum accuracy and LOS alignment.',
        icon: ShieldCheck,
        color: 'from-emerald-400 to-teal-400',
    },
    {
        title: 'Motivation Focused',
        description: 'Gamified streaks and detailed analytics keep you consistently moving toward your charter.',
        icon: TrendingUp,
        color: 'from-amber-400 to-orange-400',
    },
];

export function WhyChooseUsSection() {
    return (
        <section id="why-us" className="py-24 relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider uppercase text-sm">The Advantage</span>
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white mt-3 mb-6">
                        Why MentisAI?
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {whyChooseUs.map((benefit, index) => {
                        const Icon = benefit.icon;
                        const glowVariant =
                            index === 0 ? "indigo" :
                                index === 1 ? "rose" :
                                    index === 2 ? "emerald" : "amber";

                        return (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative rounded-3xl overflow-hidden"
                            >
                                <GlowingEffect variant={glowVariant as any} />
                                <div className="relative p-8 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 backdrop-blur-sm h-full flex flex-col transition-all duration-300 group-hover:bg-slate-50 dark:group-hover:bg-slate-900/60 shadow-sm">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefit.color} p-3.5 mb-6 shadow-lg shadow-indigo-500/10`}>
                                        <Icon className="w-full h-full text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                        {benefit.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
