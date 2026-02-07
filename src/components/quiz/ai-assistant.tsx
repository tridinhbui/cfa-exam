'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

import { useAuth } from '@/context/auth-context';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface QuizAIAssistantProps {
    question: string;
    explanation: string;
    options: {
        A: string;
        B: string;
        C: string;
    };
    topic?: string;
    currentIndex: number;
}

// Helper to clean and format LaTeX from AI responses
const formatMath = (content: string) => {
    if (!content) return '';
    return content
        // 1. Escape currency $ symbols (dollar followed by a digit) to prevent them being treated as math delimiters
        .replace(/\$(?=\d)/g, '\\$')
        // 2. Replace \[ math \] with $$ math $$
        .replace(/\\\[/g, '$$$$')
        .replace(/\\\]/g, '$$$$')
        // 3. Replace \( math \) with $ math $
        .replace(/\\\(/g, '$')
        .replace(/\\\)/g, '$')
        // 4. Fix double backslashes if any
        .replace(/\\\\/g, '\\');
};

export function QuizAIAssistant({ question, explanation, options, topic, currentIndex }: QuizAIAssistantProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Reset chat when question index changes
    useEffect(() => {
        setMessages([]);
        setInput('');
        setIsLoading(false);
    }, [currentIndex]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || !user) return;

        const userMessage = input.trim();
        setInput('');
        const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/quiz/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    messages: newMessages,
                    question,
                    explanation,
                    options,
                    topic: topic || 'General CFA'
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to get response');
            }

            // Sync navbar credits
            window.dispatchEvent(new Event('chat-limit-updated'));

            // Handle Streaming Response
            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader available');

            // Add an empty assistant message to start streaming into
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            let assistantReply = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = new TextDecoder().decode(value);
                assistantReply += chunk;

                // Update the last message in the list
                setMessages(prev => {
                    const next = [...prev];
                    next[next.length - 1] = { role: 'assistant', content: assistantReply };
                    return next;
                });
            }
        } catch (error: any) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message || 'Connection error'}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const handleWheel = (e: WheelEvent) => {
            if (scrollRef.current) {
                // Manually scroll the chat content
                scrollRef.current.scrollTop += e.deltaY;

                // CRITICAL: Stop the event from reaching the window/body
                e.preventDefault();
                e.stopPropagation();
            }
        };

        card.addEventListener('wheel', handleWheel, { passive: false });
        return () => card.removeEventListener('wheel', handleWheel);
    }, []);

    return (
        <Card
            ref={cardRef}
            className="flex flex-col h-[600px] w-full border-border/50 bg-card/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl relative select-none"
        >
            {/* Header */}
            <div className="p-4 border-b border-border/50 bg-indigo-500/5 flex items-center gap-3 select-auto">
                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border/50 p-1 shadow-inner relative overflow-hidden">
                    <Image src="/images/ai-avatar.png" alt="AI Advisor" fill className="object-contain rounded-lg" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-foreground">Mentis AI Tutor</h3>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Active</span>
                    </div>
                </div>
                <Sparkles className="w-4 h-4 text-indigo-400 ml-auto animate-pulse" />
            </div>

            {/* Chat Content */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar p-4 space-y-4 overscroll-contain select-auto"
            >
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <MessageCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground mb-1">Confused about this question?</p>
                            <p className="text-xs text-muted-foreground">Ask me anything about the concept, formulas, or why an answer is correct.</p>
                        </div>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} min-w-0 w-full`}
                        >
                            <div className={`max-w-[90%] sm:max-w-[85%] min-w-0 p-3 rounded-2xl text-sm ${m.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-muted/50 text-foreground rounded-tl-none border border-border/50'
                                }`}>
                                {m.role === 'assistant' ? (
                                    <div className="prose prose-invert prose-sm max-w-none break-words overflow-x-auto no-scrollbar">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkMath]}
                                            rehypePlugins={[rehypeKatex]}
                                            components={{
                                                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                                                ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                                                ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                            }}
                                        >
                                            {formatMath(m.content)}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className="whitespace-pre-wrap">{m.content}</p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-muted/50 p-3 rounded-2xl rounded-tl-none border border-border/50">
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Footer Input */}
            <div className="p-4 bg-muted/30 border-t border-border/50">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="relative"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask for clarification..."
                        disabled={isLoading}
                        className="pr-12 bg-background/50 border-border/50 rounded-xl h-12 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-1 top-1 bottom-1 h-10 w-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all active:scale-95"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </Card>
    );
}
