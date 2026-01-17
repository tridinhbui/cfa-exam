'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { NumberFlow } from '@/components/ui/number-flow';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export function PricingSection() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<any | null>(null);

    const handleApprove = async (orderID: string, planName: string) => {
        try {
            const response = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderID,
                    userId: user?.uid,
                    planName,
                }),
            });

            const data = await response.json();

            if (data.success) {
                router.push('/dashboard?payment=success');
            } else {
                alert('Payment captured but update failed. Please contact support.');
            }
        } catch (error) {
            console.error('Approval error:', error);
            alert('An error occurred while confirming your payment.');
        }
    };
    // ... logic remains same, but I will wrap correctly ...
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
                price: 15.00,
                originalPrice: 24.99,
                discount: 40,
                description: 'Perfect for quick revision and last-minute prep.',
                features: [
                    'Advanced GPT-5 Reasoning',
                    '75 Daily Chat Credits',
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
                price: 54.00,
                originalPrice: 89.99,
                discount: 40,
                description: 'Get an extra month free. Most popular for exam cycles.',
                features: [
                    'Advanced GPT-5 Reasoning',
                    '75 Daily Chat Credits',
                    '+1 Month Free Gift',
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
                price: 77.00,
                originalPrice: 149.99,
                discount: 48,
                description: 'Maximum value. Buy 1 year, gift 1 year to a friend.',
                features: [
                    'Advanced GPT-5 Reasoning',
                    '75 Daily Chat Credits',
                    'Buy 1 Get 1 Free',
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
                price: 162.00,
                originalPrice: 329.99,
                discount: 51,
                description: 'One-time payment for unlimited access forever.',
                features: [
                    'Advanced GPT-5 Reasoning',
                    '75 Daily Chat Credits',
                    'Lifetime Access',
                    'One-time Payment',
                ],
                cta: 'Choose this plan',
                highlight: false,
                duration: 'life',
                glowingVariant: "amber"
            },
        ];

    return (
        <PayPalScriptProvider options={{
            clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
            currency: "USD",
            locale: "en_US",
            intent: "capture"
        }}>
            <section id="pricing" className="py-24 relative overflow-hidden bg-slate-950/20 light:bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-indigo-400 light:text-indigo-600 font-semibold tracking-wider uppercase text-sm">Investment</span>
                        <h2 className="text-4xl lg:text-5xl font-bold text-white light:text-slate-900 mt-3 mb-6">
                            Unlock All Features & Unlimited Learning
                        </h2>
                        <p className="text-xl text-slate-400 light:text-slate-600 max-w-2xl mx-auto">
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
                                    ? 'bg-gradient-to-br from-indigo-900/40 light:from-indigo-50 to-slate-900/40 light:to-white border-indigo-500/40 light:border-indigo-200'
                                    : 'bg-slate-900/40 light:bg-white/60 border-white/5 light:border-slate-200'
                                    } border backdrop-blur-sm transition-all duration-300 ${selectedPlan?.name === plan.name ? '' : 'hover:scale-[1.02]'} group h-full shadow-sm`}
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
                                        <h3 className="text-2xl font-bold text-white light:text-slate-900 mb-4">{plan.name}</h3>

                                        <div className="flex flex-col items-center gap-1 mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-500 light:text-slate-400 line-through text-sm font-medium">${plan.originalPrice}</span>
                                                <span className="bg-emerald-500/20 light:bg-emerald-50 text-emerald-400 light:text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                    -{plan.discount}%
                                                </span>
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-extrabold text-white light:text-slate-900">$</span>
                                                <span className="text-4xl font-extrabold text-white light:text-slate-900">
                                                    <NumberFlow value={plan.price} />
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8 flex-grow">
                                        {plan.features.map((feature) => (
                                            <div key={feature} className="flex items-start gap-3">
                                                <div className={`mt-0.5 rounded-full p-1 ${plan.highlight ? 'bg-indigo-500/20 light:bg-indigo-500/10' : 'bg-slate-800 light:bg-slate-100'}`}>
                                                    <Check className={`h-3 w-3 ${plan.highlight ? 'text-indigo-400 light:text-indigo-600' : 'text-slate-400'}`} />
                                                </div>
                                                <span className="text-sm text-slate-300 light:text-slate-600 font-medium leading-tight">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-auto">
                                        {selectedPlan?.name === plan.name ? (
                                            <div className="space-y-4">
                                                {/* Custom Card Button */}
                                                <Button
                                                    onClick={() => router.push(`/checkout?plan=${encodeURIComponent(plan.name)}&price=${plan.price}`)}
                                                    className="w-full h-12 bg-white light:bg-slate-900 text-slate-900 light:text-white hover:bg-slate-100 light:hover:bg-slate-800 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
                                                >
                                                    <CreditCard className="h-4 w-4" />
                                                    Debit or Credit Card
                                                </Button>

                                                <div className="relative flex items-center gap-2 my-2 py-1">
                                                    <div className="h-[1px] flex-1 bg-white/10" />
                                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Or Pay with</span>
                                                    <div className="h-[1px] flex-1 bg-white/10" />
                                                </div>

                                                <PayPalButtons
                                                    style={{ layout: "vertical", shape: "rect", height: 48, label: 'pay' }}
                                                    fundingSource="paypal"
                                                    createOrder={(data, actions) => {
                                                        return actions.order.create({
                                                            intent: "CAPTURE",
                                                            purchase_units: [
                                                                {
                                                                    description: `MentisAI - ${plan.name} Plan`,
                                                                    amount: {
                                                                        currency_code: "USD",
                                                                        value: plan.price.toString(),
                                                                    },
                                                                },
                                                            ],
                                                        });
                                                    }}
                                                    onApprove={async (data, actions) => {
                                                        await handleApprove(data.orderID, plan.name);
                                                    }}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full text-slate-500 hover:text-slate-400 hover:bg-transparent"
                                                    onClick={() => setSelectedPlan(null)}
                                                >
                                                    Change Plan
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => {
                                                    if (!user) {
                                                        router.push('/login?redirect=/pricing');
                                                        return;
                                                    }
                                                    setSelectedPlan(plan);
                                                }}
                                                className={`w-full h-12 rounded-xl font-bold text-sm transition-all ${plan.highlight
                                                    ? 'bg-blue-600 light:bg-indigo-600 hover:bg-blue-500 light:hover:bg-indigo-700 text-white shadow-xl shadow-blue-600/30 light:shadow-indigo-600/30'
                                                    : 'bg-white/5 light:bg-slate-100 hover:bg-white/10 light:hover:bg-slate-200 text-white light:text-slate-900 border border-white/10 light:border-slate-200'
                                                    }`}
                                            >
                                                {plan.cta}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-20 text-center max-w-3xl mx-auto">
                        <h3 className="text-2xl font-bold text-white light:text-slate-900 mb-4">Need help with your payment?</h3>
                        <p className="text-slate-400 light:text-slate-600 mb-8 font-medium">Do not hesitate to contact our support team for any questions or issues.</p>

                        <div className="mt-16">
                            <p className="text-slate-500 text-[10px] max-w-2xl mx-auto leading-relaxed uppercase tracking-widest font-medium opacity-60">
                                CFA Institute does not endorse, promote or warrant the accuracy or quality of the products or services offered by MentisAI. CFA and Chartered Financial Analyst are registered trademarks owned by CFA Institute.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </PayPalScriptProvider>
    );
}
