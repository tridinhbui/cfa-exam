'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    CreditCard,
    Lock,
    ShieldCheck,
    ArrowLeft,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

function CheckoutContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const planName = searchParams.get('plan') || '1 Month';
    const planPrice = searchParams.get('price') || '6.99';

    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleApprove = async (orderID: string) => {
        if (!user) {
            alert('You must be logged in to complete payment.');
            return;
        }
        setIsProcessing(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    orderID,
                    userId: user.uid,
                    planName: planName,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setIsSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard?payment=success');
                }, 2000);
            } else {
                alert('Payment captured but update failed. Please contact support.');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12 }}
                >
                    <CheckCircle2 className="h-24 w-24 text-emerald-500" />
                </motion.div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-white">Payment Successful!</h1>
                    <p className="text-slate-400">Welcome to MentisAI Pro. Redirecting to your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <Button
                variant="ghost"
                className="mb-8 text-slate-400 hover:text-white"
                onClick={() => router.back()}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Pricing
            </Button>

            <div className="grid lg:grid-cols-2 gap-12">
                {/* Left Side: Order Summary */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-4">Complete your order</h1>
                        <p className="text-slate-400">Finalize your purchase to unlock all pro features and boost your CFA prep.</p>
                    </div>

                    <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="border-b border-white/5 bg-white/5">
                            <CardTitle className="text-lg">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-center text-slate-300">
                                <span>MentisAI {planName} Plan</span>
                                <span className="font-bold text-white">${planPrice}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-300">
                                <span>Taxes</span>
                                <span className="font-bold text-white">$0.00</span>
                            </div>
                            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                <span className="text-lg font-bold text-white">Total Amount</span>
                                <span className="text-2xl font-black text-indigo-400 font-mono">${planPrice}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            <span>SSL Encrypted & Secure Payments</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                            <Lock className="h-5 w-5 text-emerald-500" />
                            <span>We don't store your full credit card details</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Payment Form */}
                <Card className="bg-slate-900/80 border-indigo-500/20 shadow-2xl shadow-indigo-500/10 rounded-[2rem] overflow-hidden">
                    <CardHeader className="pb-6 border-b border-white/5 bg-white/5">
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-indigo-400" />
                            Secure Checkout
                        </CardTitle>
                        <CardDescription>Pay safely with your Credit or Debit Card via PayPal</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-6">
                            <PayPalButtons
                                fundingSource="card"
                                style={{
                                    layout: "vertical",
                                    shape: "rect",
                                    height: 55,
                                    label: 'pay'
                                }}
                                createOrder={(data, actions) => {
                                    return actions.order.create({
                                        intent: "CAPTURE",
                                        purchase_units: [
                                            {
                                                description: `MentisAI - ${planName} Plan`,
                                                amount: {
                                                    currency_code: "USD",
                                                    value: planPrice,
                                                },
                                            },
                                        ],
                                    });
                                }}
                                onApprove={async (data, actions) => {
                                    if (data.orderID) {
                                        await handleApprove(data.orderID);
                                    }
                                }}
                            />

                            <div className="flex flex-col items-center gap-4 pt-4">
                                <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest font-black opacity-60">
                                    Your payment is processed securely by PayPal
                                </p>
                                <div className="flex gap-4 grayscale opacity-40">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <PayPalScriptProvider options={{
            clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
            locale: "en_US",
            intent: "capture"
        }}>
            <div className="min-h-screen bg-slate-950 text-slate-200">
                <Suspense fallback={
                    <div className="flex items-center justify-center min-h-screen">
                        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
                    </div>
                }>
                    <CheckoutContent />
                </Suspense>
            </div>
        </PayPalScriptProvider>
    );
}
