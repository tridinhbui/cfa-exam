'use client';

import { motion } from 'framer-motion';
import { CyclingBadge } from '@/components/cycling-badge';
import { MissionChat } from '@/components/mission-chat';

export function MissionSection() {
    return (
        <section id="mission" className="py-16 sm:py-24 bg-white/40 dark:bg-slate-950/50 border-y border-slate-200 dark:border-white/5 relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center lg:text-left"
                    >
                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 tracking-widest uppercase mb-4">Our Mission</p>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                            Making CFA Prep <br />
                            <CyclingBadge />
                        </h2>

                        <div className="space-y-6 mb-10">
                            <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-2">
                                <p className="text-slate-600 dark:text-slate-400"><span className="text-slate-900 dark:text-slate-200 font-bold">Curated Content:</span> Rigorously reviewed by charterholders to ensure accuracy and relevance.</p>
                            </div>
                            <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-2">
                                <p className="text-slate-600 dark:text-slate-400"><span className="text-slate-900 dark:text-slate-200 font-bold">Real Conditions:</span> Interface designed to mirror the actual computer-based testing environment.</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Mission Visual - Chat UI */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <MissionChat />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
