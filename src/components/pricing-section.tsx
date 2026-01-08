'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { NumberFlow } from '@/components/ui/number-flow';
import { Tab } from '@/components/ui/pricing-tab';

export function PricingSection() {
    const plans: {
        name: string;
        price: number;
        originalPrice: number;
        discount: number;
        description: string;
        features: string[];
        cta: string;
        highlight: boolean;
        badge?: string;
        duration: string;
        glowingVariant: "indigo" | "emerald" | "amber" | "rose" | "cyan" | "white";
    }[] = [
            {
                name: '1 Month',
                price: 3.99,
                originalPrice: 5.99,
                discount: 33,
                description: 'Perfect for quick revision and last-minute prep.',
                features: [
                    'Unlimited AI Chatbot',
                    'Unlimited Practice Tests',
                    'Full Mock Exam Access',
                ],
                cta: 'Choose this plan',
                highlight: false,
                duration: 'month',
                glowingVariant: "white"
            },
            {
                name: '6 Months',
                price: 37.99,
                originalPrice: 57.99,
                discount: 35,
                description: 'Get an extra month free. Most popular for exam cycles.',
                features: [
                    'All Pro Benefits',
                    '+1 Month Free Gift',
                    'Save 33% Instantly',
                    'Priority Support',
                ],
                cta: 'Choose this plan',
                highlight: false,
                duration: '6 mos',
                badge: 'Exclusive Offer',
                glowingVariant: "cyan"
            },
            {
                name: '1 Year',
                price: 69.99,
                originalPrice: 115.99,
                discount: 40,
                description: 'Maximum value. Buy 1 year, gift 1 year to a friend.',
                features: [
                    'All Pro Benefits',
                    'Buy 1 Get 1 Free',
                    'Maximum Savings',
                    'Charterholder Mentoring',
                ],
                cta: 'Choose this plan',
                highlight: true,
                duration: 'year',
                badge: 'Most Popular',
                glowingVariant: "indigo"
            },
            {
                name: 'Lifetime',
                price: 119.99,
                originalPrice: 239.99,
                discount: 50,
                description: 'One-time payment for unlimited access forever.',
                features: [
                    'Lifetime Access',
                    'All Pro Benefits',
                    'One-time Payment',
                    'Never Expires',
                ],
                cta: 'Choose this plan',
                highlight: false,
                duration: 'life',
                glowingVariant: "amber"
            },
        ];

    return (
        <section id="pricing" className="py-24 relative overflow-hidden bg-slate-950/20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <span className="text-indigo-400 font-semibold tracking-wider uppercase text-sm">Investment</span>
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mt-3 mb-6">
                        Unlock All Features & Unlimited Learning
                    </h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Invest in your future. Our AI-powered platform helps you study smarter, not harder.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative flex flex-col p-6 rounded-[2.5rem] ${plan.highlight
                                ? 'bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border-indigo-500/40'
                                : 'bg-slate-900/40 border-white/5'
                                } border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] group h-full`}
                        >
                            <GlowingEffect
                                spread={40}
                                proximity={64}
                                inactiveZone={0.01}
                                variant={plan.glowingVariant}
                            />

                            <div className={`relative z-10 flex flex-col h-full ${plan.badge ? 'pt-6' : ''}`}>
                                {plan.badge && (
                                    <div className={`absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-white text-[10px] font-bold uppercase tracking-wider shadow-xl z-20 whitespace-nowrap ${plan.highlight ? 'bg-indigo-600 shadow-indigo-500/20' : 'bg-amber-600 shadow-amber-500/20'}`}>
                                        {plan.badge}
                                    </div>
                                )}

                                <div className="mb-6 text-center">
                                    <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>

                                    <div className="flex flex-col items-center gap-1 mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500 line-through text-sm font-medium">${plan.originalPrice}</span>
                                            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                -{plan.discount}%
                                            </span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-extrabold text-white">$</span>
                                            <span className="text-4xl font-extrabold text-white">
                                                <NumberFlow value={plan.price} />
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8 flex-grow">
                                    {plan.features.map((feature) => (
                                        <div key={feature} className="flex items-start gap-3">
                                            <div className={`mt-0.5 rounded-full p-1 ${plan.highlight ? 'bg-indigo-500/20' : 'bg-slate-800'}`}>
                                                <Check className={`h-3 w-3 ${plan.highlight ? 'text-indigo-400' : 'text-slate-400'}`} />
                                            </div>
                                            <span className="text-sm text-slate-300 font-medium leading-tight">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link href="/dashboard" className="block w-full mt-auto">
                                    <Button
                                        className={`w-full h-12 rounded-xl font-bold text-sm transition-all ${plan.highlight
                                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30'
                                            : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                                            }`}
                                    >
                                        {plan.cta}
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 text-center max-w-3xl mx-auto">
                    <h3 className="text-2xl font-bold text-white mb-4">Need help with your payment?</h3>
                    <p className="text-slate-400 mb-8 font-medium">Do not hesitate to contact our support team for any questions or issues.</p>

                    <div className="mt-16">
                        <p className="text-slate-500 text-[10px] max-w-2xl mx-auto leading-relaxed uppercase tracking-widest font-medium opacity-60">
                            CFA Institute does not endorse, promote or warrant the accuracy or quality of the products or services offered by MentisAI. CFA and Chartered Financial Analyst are registered trademarks owned by CFA Institute.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
