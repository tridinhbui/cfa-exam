'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import Link from 'next/link';

const levels = [
    {
        level: 'Level I',
        topics: 'Ethics, Quant, Economics, FRA, Corporate, Equity, Fixed Income, Derivatives, Alts, PM',
        color: 'level1' as const
    },
];

interface CurriculumSectionProps {
    user: any;
}

export function CurriculumSection({ user }: CurriculumSectionProps) {
    return (
        <section id="curriculum" className="py-24 bg-white dark:bg-slate-950 relative border-y border-slate-200 dark:border-white/5">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 dark:from-indigo-500/10 via-white dark:via-slate-950 to-white dark:to-slate-950 pointer-events-none" />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider uppercase text-sm">Curriculum</span>
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white mt-3 mb-6">
                        Prepare for CFA Level 1
                    </h2>
                </div>

                <div className="flex justify-center max-w-lg mx-auto">
                    {levels.map((level, index) => {
                        return (
                            <motion.div
                                key={level.level}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative rounded-3xl overflow-hidden w-full"
                            >
                                <GlowingEffect variant="rose" />
                                <div className="h-full relative p-8 rounded-3xl bg-purple-400 dark:bg-slate-900/40 border border-purple-600/50 dark:border-white/5 backdrop-blur-sm transition-all duration-300 group-hover:bg-purple-500 dark:group-hover:bg-slate-900/60 flex flex-col shadow-sm">
                                    <div className="flex justify-start mb-6">
                                        <Badge className="bg-purple-700 text-white dark:bg-indigo-500/10 dark:text-indigo-400 border-none px-3 py-1 font-medium rounded-full text-xs">
                                            {level.level}
                                        </Badge>
                                    </div>

                                    <h3 className="text-2xl font-bold text-purple-950 dark:text-white mb-4">
                                        CFA {level.level}
                                    </h3>

                                    <p className="text-purple-950 dark:text-slate-400 text-sm mb-10 leading-relaxed font-bold flex-grow">
                                        {level.topics}
                                    </p>

                                    <Link href={user ? "/dashboard" : "/login"} className="block w-full mt-auto">
                                        <Button variant="outline" className="w-full h-12 border-purple-700 light:bg-white/80 dark:border-white/10 hover:border-purple-800 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/5 text-purple-950 dark:text-white font-black flex items-center justify-center gap-2 rounded-xl transition-all shadow-lg shadow-purple-900/20">
                                            Start {level.level}
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
