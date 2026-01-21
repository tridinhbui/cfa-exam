'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Bot, HelpCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthenticatedSWR } from '@/hooks/use-authenticated-swr';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

interface Message {
    id: string;
    content: string;
    isAdmin: boolean;
    createdAt: string;
}

interface SupportChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SupportChatModal({ isOpen, onClose }: SupportChatModalProps) {
    const { user } = useAuth();
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data: messages, mutate } = useAuthenticatedSWR<Message[]>(
        isOpen ? '/api/support/messages' : null,
        { refreshInterval: 5000 } // Polling every 5 seconds for "real-time" feel
    );

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim() || isSending) return;

        setIsSending(true);
        try {
            const token = await user?.getIdToken();
            const res = await fetch('/api/support/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: inputValue })
            });

            if (res.ok) {
                setInputValue('');
                mutate(); // Refresh messages immediately
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-end justify-end p-4 sm:p-6 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-[400px] h-[600px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col pointer-events-auto overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                    <HelpCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold">MentisAI Support</h3>
                                    <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Direct line to Admin</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-white hover:bg-white/10 rounded-full"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-hidden relative bg-slate-50 dark:bg-slate-950/50 pointer-events-auto">
                            <div
                                className="h-full overflow-y-auto p-6 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overscroll-contain"
                                ref={scrollRef}
                                onWheel={(e) => e.stopPropagation()}
                            >
                                <div className="space-y-6">
                                    {/* Welcome Message */}
                                    <div className="flex flex-col gap-2 max-w-[80%]">
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-white/5 text-sm text-slate-900 dark:text-slate-100">
                                            Hi there! 👋 How can we help you today? Send us a message and our team will get back to you shortly.
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-medium px-2">MentisAI Team</span>
                                    </div>

                                    {messages?.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex flex-col gap-2 max-w-[80%]",
                                                msg.isAdmin ? "mr-auto" : "ml-auto items-end"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "p-4 rounded-2xl text-sm shadow-sm",
                                                    msg.isAdmin
                                                        ? "bg-white dark:bg-slate-800 rounded-tl-none border border-slate-100 dark:border-white/5 text-slate-900 dark:text-slate-100"
                                                        : "bg-indigo-600 text-white rounded-tr-none"
                                                )}
                                            >
                                                {msg.content}
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-medium px-2">
                                                {msg.isAdmin ? 'Admin' : 'You'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Type your message..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus-visible:ring-indigo-500 h-11 text-slate-900 dark:text-white"
                                />
                                <Button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isSending}
                                    className="rounded-xl w-11 h-11 p-0 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
                                >
                                    {isSending ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Send className="h-5 w-5" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
