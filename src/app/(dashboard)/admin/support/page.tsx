'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, MessageSquare, Send, Loader2, CheckCheck, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthenticatedSWR } from '@/hooks/use-authenticated-swr';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Conversation {
    user: {
        id: string;
        name: string;
        email: string;
        image: string;
    };
    lastMessage: {
        content: string;
        createdAt: string;
        isAdmin: boolean;
    };
    unreadCount: number;
}

interface Message {
    id: string;
    content: string;
    isAdmin: boolean;
    isRead: boolean;
    createdAt: string;
}

export default function AdminSupportPage() {
    const { user: currentUser } = useAuth();
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [replyValue, setReplyValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch all conversations
    const { data: conversations, mutate: mutateConversations } = useAuthenticatedSWR<Conversation[]>(
        '/api/admin/support',
        { refreshInterval: 10000 }
    );

    // Fetch messages for selected user
    const { data: messages, mutate: mutateMessages } = useAuthenticatedSWR<Message[]>(
        selectedUserId ? `/api/admin/support/${selectedUserId}` : null,
        { refreshInterval: 5000 }
    );

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendReply = async () => {
        if (!replyValue.trim() || !selectedUserId || isSending) return;

        setIsSending(true);
        try {
            const token = await currentUser?.getIdToken();
            const res = await fetch('/api/admin/support', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId: selectedUserId, content: replyValue })
            });

            if (res.ok) {
                setReplyValue('');
                mutateMessages();
                mutateConversations();
            }
        } catch (error) {
            console.error('Failed to send reply:', error);
        } finally {
            setIsSending(false);
        }
    };

    const [searchQuery, setSearchQuery] = useState('');

    // Filter conversations based on search
    const filteredConversations = conversations?.filter(conv =>
        conv.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedConv = conversations?.find(c => c.user.id === selectedUserId);

    return (
        <div className="flex h-[calc(100vh-140px)] min-h-0 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden">
            {/* Conversations Sidebar */}
            <div className="w-80 border-r border-slate-200 dark:border-white/10 flex flex-col bg-slate-50/50 dark:bg-slate-950/20">
                <div className="p-6 border-b border-slate-200 dark:border-white/10">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Inbox className="h-5 w-5 text-indigo-500" />
                        Live Support
                    </h1>
                    <div className="mt-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search users..."
                            className="pl-10 h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-white/5 rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {filteredConversations?.length === 0 ? (
                        <div className="p-10 text-center text-slate-400">
                            <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">
                                {searchQuery ? 'No matching users found' : 'No conversations yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-white/5">
                            {filteredConversations?.map((conv) => (
                                <button
                                    key={conv.user.id}
                                    onClick={() => setSelectedUserId(conv.user.id)}
                                    className={cn(
                                        "w-full p-4 flex gap-3 text-left transition-all hover:bg-white dark:hover:bg-slate-800/50",
                                        selectedUserId === conv.user.id && "bg-white dark:bg-slate-800 shadow-sm border-l-4 border-l-indigo-500"
                                    )}
                                >
                                    <Avatar className="h-10 w-10 shrink-0 border border-slate-200 dark:border-white/10">
                                        <AvatarImage src={conv.user.image} />
                                        <AvatarFallback>{conv.user.name?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-semibold text-sm truncate">{conv.user.name || conv.user.email}</span>
                                            <span className="text-[10px] text-slate-400">{new Date(conv.lastMessage.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                            {conv.lastMessage.isAdmin ? 'You: ' : ''}{conv.lastMessage.content}
                                        </p>
                                    </div>
                                    {conv.unreadCount > 0 && (
                                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                            {conv.unreadCount}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area - Flexbox Layout */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 min-w-0 h-full overflow-hidden">
                {selectedUserId ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/10 shrink-0">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border border-slate-200 dark:border-white/10">
                                    <AvatarImage src={selectedConv?.user.image} />
                                    <AvatarFallback>{selectedConv?.user.name?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                        {selectedConv?.user.name}
                                    </h2>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">{selectedConv?.user.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages - Scrollable Middle Area */}
                        <div
                            className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                            ref={scrollRef}
                            onWheel={(e) => e.stopPropagation()}
                        >
                            {messages?.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex flex-col gap-2 max-w-[70%]",
                                        msg.isAdmin ? "ml-auto items-end" : "mr-auto"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "p-4 rounded-2xl text-sm shadow-sm",
                                            msg.isAdmin
                                                ? "bg-indigo-600 text-white rounded-tr-none"
                                                : "bg-slate-100 dark:bg-slate-800 rounded-tl-none border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100"
                                        )}
                                    >
                                        {msg.content}
                                    </div>
                                    <div className="flex items-center gap-2 px-2">
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            {new Date(msg.createdAt).toLocaleTimeString()}
                                        </span>
                                        {msg.isAdmin && (
                                            <CheckCheck className={cn("h-3 w-3", msg.isRead ? "text-indigo-400" : "text-slate-300")} />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reply Area - Fixed Bottom */}
                        <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shrink-0">
                            <div className="flex gap-3 h-full items-center">
                                <Input
                                    value={replyValue}
                                    onChange={(e) => setReplyValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                                    placeholder="Type your response..."
                                    className="flex-1 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus-visible:ring-indigo-500 px-6 text-slate-900 dark:text-white"
                                />
                                <Button
                                    onClick={handleSendReply}
                                    disabled={!replyValue.trim() || isSending}
                                    className="h-12 w-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 p-0 shadow-lg shadow-indigo-600/20 shrink-0"
                                >
                                    {isSending ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Send className="h-5 w-5" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 h-full">
                        <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
                            <MessageSquare className="h-10 w-10 opacity-20" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Select a conversation</h2>
                        <p className="max-w-xs text-center text-sm"> Choose a user from the left to start chatting and solving their problems. </p>
                    </div>
                )}
            </div>
        </div>
    );
}
