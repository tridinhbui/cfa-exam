'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, MessageCircle, X, Trash2, RotateCcw, ImageIcon, Paperclip, UploadCloud, ChevronDown, History, Settings, Search, Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/context/auth-context';
import { useQuizStore } from '@/store/quiz-store';
import { useUserStore } from '@/store/user-store';
import { useChatStore, ChatSession, Message } from '@/store/chat-store';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';



interface GlobalChatbotProps {
    isOpen: boolean;
    onClose: () => void;
}

const getInitials = (name?: string | null) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

const formatMath = (content: string) => {
    return content
        .replace(/\\\[/g, '$$$$')
        .replace(/\\\]/g, '$$$$')
        .replace(/\\\(/g, '$')
        .replace(/\\\)/g, '$')
        .replace(/\\\\/g, '\\');
};

export function GlobalChatbot({ isOpen, onClose }: GlobalChatbotProps) {
    const { user: firebaseUser } = useAuth();
    const { user: dbUser } = useUserStore();
    const { questions, currentIndex, isActive } = useQuizStore();
    const currentQuestion = isActive ? questions[currentIndex] : null;

    const {
        messages, setMessages,
        sessions, setSessions,
        currentSessionId, setCurrentSessionId,
        inputText, setInputText,
        selectedImage, setSelectedImage,
        isLoading, setIsLoading,
        isSidebarOpen, setIsSidebarOpen,
        searchQuery, setSearchQuery,
        resetChat, appendMessage, updateLastMessage
    } = useChatStore();

    const [isDragging, setIsDragging] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const isProcessingRename = useRef(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && firebaseUser) {
            fetchSessions();
        }
    }, [isOpen, firebaseUser]);

    const fetchSessions = async () => {
        try {
            const token = await firebaseUser?.getIdToken();
            const res = await fetch('/api/quiz/chat/sessions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) setSessions(data);
        } catch (err) {
            console.error('Failed to fetch sessions', err);
        }
    };

    const loadSession = async (sessionId: string) => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const token = await firebaseUser?.getIdToken();
            const res = await fetch(`/api/quiz/chat/sessions/${sessionId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.messages) {
                setMessages(data.messages);
                setCurrentSessionId(sessionId);
            }
        } catch (err) {
            console.error('Failed to load session', err);
        } finally {
            setIsLoading(false);
        }
    };

    const createNewChat = async () => {
        if (isLoading) return;
        resetChat();
    };

    const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const token = await firebaseUser?.getIdToken();
            await fetch(`/api/quiz/chat/sessions/${sessionId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSessions((prev: ChatSession[]) => prev.filter((s: ChatSession) => s.id !== sessionId));
            if (currentSessionId === sessionId) createNewChat();
        } catch (err) {
            console.error('Failed to delete session', err);
        }
    };

    const renameSession = async (sessionId: string, newTitle: string) => {
        const trimmedTitle = newTitle.trim();
        if (!trimmedTitle || isProcessingRename.current) {
            setEditingSessionId(null);
            return;
        }

        // Optimistic update
        setSessions((prev: ChatSession[]) => prev.map((s: ChatSession) => s.id === sessionId ? { ...s, title: trimmedTitle } : s));
        setEditingSessionId(null);

        isProcessingRename.current = true;
        try {
            const token = await firebaseUser?.getIdToken();
            const res = await fetch(`/api/quiz/chat/sessions/${sessionId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: trimmedTitle })
            });

            if (!res.ok) {
                // Revert on error
                fetchSessions();
                console.error('Failed to rename session in DB');
            }
        } catch (err) {
            console.error('Rename error:', err);
            fetchSessions();
        } finally {
            isProcessingRename.current = false;
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const processFile = (file: File) => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const filteredSessions = sessions.filter(s =>
        (s.title || 'New Chat').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.types.includes('Files')) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const item = e.clipboardData.items[0];
        if (item?.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) processFile(file);
        }
    };

    const handleSend = async () => {
        if ((!inputText.trim() && !selectedImage) || isLoading || !firebaseUser) return;

        const userMessage = inputText.trim();
        const currentImage = selectedImage;

        // Use a small timeout to ensure the clear happens after any pending IME/input events
        setTimeout(() => setInputText(''), 10);
        setSelectedImage(null);

        const userMsg: Message = {
            role: 'user',
            content: userMessage,
            image: currentImage || undefined
        };

        appendMessage(userMsg);
        setIsLoading(true);

        try {
            const token = await firebaseUser.getIdToken();
            let sessionId = currentSessionId;

            if (!sessionId) {
                const sessionRes = await fetch('/api/quiz/chat/sessions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const sessionData = await sessionRes.json();
                sessionId = sessionData.id;
                setCurrentSessionId(sessionId);
            }

            const chatResponse = await fetch('/api/quiz/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    question: currentQuestion?.content,
                    explanation: currentQuestion?.explanation,
                    options: currentQuestion ? {
                        A: currentQuestion.optionA,
                        B: currentQuestion.optionB,
                        C: currentQuestion.optionC
                    } : undefined,
                    topic: currentQuestion?.topic?.name || 'General CFA Support',
                    isGlobal: true,
                    image: currentImage,
                    sessionId
                }),
            });

            if (!chatResponse.ok) {
                const data = await chatResponse.json();
                throw new Error(data.error || 'Failed to get response');
            }

            // Sync navbar credits
            window.dispatchEvent(new Event('chat-limit-updated'));

            setTimeout(fetchSessions, 5000);
            const reader = chatResponse.body?.getReader();
            if (!reader) throw new Error('No reader available');

            const decoder = new TextDecoder();
            appendMessage({ role: 'assistant', content: '' });

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                updateLastMessage(chunk);
            }
        } catch (err: any) {
            console.error('Chat error:', err);
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message || 'Something went wrong'}` }]);
        } finally {
            setIsLoading(false);
            fetchSessions();
        }
    };

    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        // Small delay to ensure Radix has mounted the content in its portal
        const timer = setTimeout(() => {
            const dialog = dialogRef.current;
            if (!dialog) return;

            const handleWheel = (e: WheelEvent) => {
                if (scrollRef.current) {
                    // Manually scroll the chat content container
                    scrollRef.current.scrollTop += e.deltaY;

                    // CRITICAL: Block scroll from bubbling up to background
                    e.preventDefault();
                    e.stopPropagation();
                }
            };

            // Attach non-passive listener to the whole dialog content area
            dialog.addEventListener('wheel', handleWheel, { passive: false });
            return () => dialog.removeEventListener('wheel', handleWheel);
        }, 50);

        return () => clearTimeout(timer);
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                ref={dialogRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="max-w-[98vw] w-[1600px] h-[90vh] p-0 overflow-hidden border border-border bg-background rounded-[2.5rem] shadow-2xl flex flex-col gap-0 outline-none select-none [&>button]:hidden z-[60]"
            >
                {/* Drag Overlay */}
                <AnimatePresence>
                    {isDragging && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 bg-indigo-600/20 backdrop-blur-sm border-4 border-dashed border-indigo-500 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 pointer-events-none"
                        >
                            <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center shadow-2xl animate-bounce">
                                <UploadCloud className="w-12 h-12 text-white" />
                            </div>
                            <h3 className="text-3xl font-black text-white drop-shadow-lg">Drop your image to analyze</h3>
                            <p className="text-indigo-100 font-medium">Any graph, chart, or question screenshot</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Sidebar (History/New Chat) */}
                    <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 280, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                className="bg-muted/30 dark:bg-[#171717] flex flex-col overflow-hidden border-r border-border shrink-0"
                            >
                                <div className="p-4 space-y-4">
                                    <Button
                                        onClick={createNewChat}
                                        className="w-full justify-between items-center h-11 rounded-xl bg-transparent hover:bg-accent text-foreground border border-border font-medium transition-all text-sm px-4 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                                                <Sparkles className="w-3.5 h-3.5" />
                                            </div>
                                            <span>New Chat</span>
                                        </div>
                                        <div className="p-1 rounded bg-accent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Send className="w-3 h-3" />
                                        </div>
                                    </Button>

                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search chats..."
                                            className="w-full bg-accent/50 dark:bg-white/5 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-indigo-500/20 pl-9 pr-8 h-9 outline-none transition-all"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:text-foreground text-muted-foreground/30 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 custom-scrollbar-thick">
                                    <div className="px-3 pt-4 pb-2 text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                        {searchQuery ? `Search Results (${filteredSessions.length})` : 'Chat History'}
                                    </div>
                                    {filteredSessions.map((s) => (
                                        <div
                                            key={s.id}
                                            onClick={() => editingSessionId !== s.id && loadSession(s.id)}
                                            className={`group relative py-2.5 px-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${currentSessionId === s.id
                                                ? 'bg-accent text-foreground'
                                                : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            <MessageCircle className={`w-4 h-4 shrink-0 ${currentSessionId === s.id ? 'text-indigo-500' : 'text-muted-foreground/30'}`} />
                                            {editingSessionId === s.id ? (
                                                <div className="flex-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        autoFocus
                                                        value={editingTitle}
                                                        onChange={(e) => setEditingTitle(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                renameSession(s.id, editingTitle);
                                                            }
                                                            if (e.key === 'Escape') {
                                                                setEditingSessionId(null);
                                                            }
                                                        }}
                                                        onBlur={() => {
                                                            // Only rename if we haven't already cancelled or submitted
                                                            if (editingSessionId === s.id) {
                                                                renameSession(s.id, editingTitle);
                                                            }
                                                        }}
                                                        className="flex-1 bg-accent border border-border rounded px-2 py-1 text-xs text-foreground focus:ring-1 focus:ring-indigo-500 outline-none w-full"
                                                    />
                                                    <button
                                                        onMouseDown={(e) => {
                                                            // Use onMouseDown to trigger before onBlur
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            renameSession(s.id, editingTitle);
                                                        }}
                                                        className="p-1 hover:bg-white/10 rounded-md transition-colors"
                                                    >
                                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="truncate text-xs flex-1 font-medium">{s.title || 'New Chat'}</span>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingSessionId(s.id);
                                                                setEditingTitle(s.title || '');
                                                            }}
                                                            className="p-1 hover:text-indigo-400 transition-all"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => deleteSession(s.id, e)}
                                                            className="p-1 hover:text-red-400 transition-all"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                    {sessions.length === 0 && !isLoading && (
                                        <div className="text-center py-12 px-4 opacity-40">
                                            <p className="text-[11px] italic">No conversations yet</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 border-t border-border">
                                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-accent transition-all group cursor-pointer">
                                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[11px] font-bold text-white uppercase ring-1 ring-border shadow-lg shrink-0">
                                            {getInitials(dbUser?.name || firebaseUser?.displayName)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-foreground truncate">{dbUser?.name || firebaseUser?.displayName || 'Guest User'}</p>
                                            <p className="text-[10px] text-muted-foreground truncate font-medium uppercase tracking-wider">
                                                {dbUser?.subscription === 'PRO' ? 'CFA Pro Member' : 'Free Account'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main Chat Area */}
                    <div className="flex-1 flex flex-col relative overflow-hidden bg-card/50 dark:bg-[#212121]">
                        {/* Compact Header */}
                        <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-background/80 backdrop-blur-md z-10 shrink-0">
                            <div className="flex items-center gap-3">
                                {!isSidebarOpen && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="text-muted-foreground hover:text-foreground hover:bg-accent"
                                    >
                                        <History className="w-5 h-5" />
                                    </Button>
                                )}
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent cursor-pointer transition-colors">
                                    <DialogTitle className="font-bold text-foreground text-sm">
                                        CFA AI Advisor
                                    </DialogTitle>
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                </div>

                                {isActive && currentQuestion && (
                                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-in fade-in slide-in-from-left-2 transition-all">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight">
                                            Linked: Q{currentIndex + 1} - {currentQuestion.topic?.name || 'Current Question'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>
                        </header>

                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto custom-scrollbar-thick select-auto overscroll-contain"
                        >
                            <div className="max-w-4xl mx-auto py-8">
                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
                                        <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center p-1.5 border border-border shadow-xl hover:scale-105 transition-transform duration-500">
                                            <img src="/images/ai-avatar.png" alt="AI Advisor" className="w-full h-full object-contain rounded-2xl" />
                                        </div>
                                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                                            How can I help you?
                                        </h2>
                                    </div>
                                )}

                                {messages.map((m, idx) => (
                                    <div key={idx} className={`group w-full border-b border-border/30 last:border-0 ${m.role === 'user' ? 'bg-muted/30' : ''}`}>
                                        <div className={`max-w-3xl mx-auto px-4 py-8 flex gap-4 md:gap-6 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                            <div className="shrink-0">
                                                {m.role === 'assistant' ? (
                                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 shadow-lg p-0.5 bg-background">
                                                        <img src="/images/ai-avatar.png" alt="AI Advisor" className="w-full h-full object-contain rounded-lg" />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center border border-white/10 shadow-lg text-[10px] font-bold text-white uppercase text-center">
                                                        {getInitials(dbUser?.name || firebaseUser?.displayName)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`flex-1 min-w-0 space-y-2 ${m.role === 'user' ? 'text-right' : ''}`}>
                                                <div className={`font-bold text-[13px] text-muted-foreground flex items-center gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                                    {m.role === 'assistant' ? 'AI Advisor' : 'You'}
                                                </div>
                                                <div className="prose dark:prose-invert prose-indigo max-w-none break-words text-[15px] leading-relaxed text-foreground antialiased shadow-indigo-500/10">
                                                    {m.image && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="mb-4 rounded-xl overflow-hidden border border-white/10 cursor-zoom-in group/img relative shadow-2xl inline-block"
                                                            onClick={() => setLightboxImage(m.image!)}
                                                        >
                                                            <img
                                                                src={m.image}
                                                                alt="Uploaded"
                                                                className="max-h-80 w-auto object-contain transition-transform group-hover/img:scale-[1.01]"
                                                            />
                                                        </motion.div>
                                                    )}
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkMath]}
                                                        rehypePlugins={[rehypeKatex]}
                                                    >
                                                        {formatMath(m.content)}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="group w-full">
                                        <div className="max-w-3xl mx-auto px-4 py-8 flex gap-6">
                                            <div className="shrink-0 animate-pulse">
                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-border p-0.5 bg-background shadow-sm">
                                                    <img src="/images/ai-avatar.png" alt="AI Advisor" className="w-full h-full object-contain rounded-lg opacity-90" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 py-2">
                                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s] shadow-sm" />
                                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s] shadow-sm" />
                                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce shadow-sm" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="h-40" />
                            </div>
                        </div>

                        {/* Floating Input Bar */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/90 to-transparent pt-12 pb-8 px-4">
                            <div className="max-w-3xl mx-auto relative">
                                <form
                                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                    className="relative flex items-end gap-2 bg-muted/80 dark:bg-[#2f2f2f] backdrop-blur-xl rounded-[24px] p-2 pl-4 pr-3 shadow-2xl border border-border focus-within:border-indigo-500/30 transition-all"
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                    />

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mb-1 h-9 w-9 text-muted-foreground/60 hover:text-foreground hover:bg-accent rounded-full shrink-0"
                                    >
                                        <Paperclip className="w-5 h-5" />
                                    </Button>

                                    <textarea
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                // Prevent sending while composing (Vietnamese/Chinese/Japanese IME)
                                                if (e.nativeEvent.isComposing) return;
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        onPaste={handlePaste}
                                        placeholder="Message CFA AI Advisor..."
                                        rows={1}
                                        className="flex-1 bg-transparent border-0 focus:ring-0 text-foreground placeholder:text-muted-foreground/30 py-3.5 resize-none max-h-48 custom-scrollbar min-h-[52px] text-[15px] leading-relaxed"
                                    />

                                    <Button
                                        type="submit"
                                        disabled={isLoading || (!inputText.trim() && !selectedImage)}
                                        size="icon"
                                        className="mb-1 h-9 w-9 rounded-full bg-foreground text-background hover:bg-foreground/90 disabled:bg-accent disabled:text-muted-foreground/30 shadow-lg shrink-0"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5" />
                                        )}
                                    </Button>

                                    {/* Image Preview */}
                                    <AnimatePresence>
                                        {selectedImage && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="absolute bottom-full mb-4 left-4 p-2 bg-card border border-border rounded-2xl shadow-2xl z-20 flex items-center gap-3 pr-4"
                                            >
                                                <div className="relative">
                                                    <img src={selectedImage} alt="Preview" className="h-12 w-12 object-cover rounded-lg" />
                                                    <button
                                                        onClick={() => setSelectedImage(null)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="w-2.5 h-2.5" />
                                                    </button>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-foreground">Image Attached</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Ready for AI</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </form>
                                <p className="text-[10px] text-muted-foreground/30 text-center mt-3 font-medium">
                                    CFA AI Bot can make mistakes. Always check important info.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lightbox */}
                <AnimatePresence>
                    {lightboxImage && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setLightboxImage(null)}
                            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-8 cursor-zoom-out"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="relative max-w-full max-h-full flex items-center justify-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <img
                                    src={lightboxImage}
                                    className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border border-white/10"
                                    alt="Enlarged view"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setLightboxImage(null)}
                                    className="absolute -top-12 right-0 text-white hover:bg-white/10 rounded-full w-10 h-10"
                                >
                                    <X className="w-8 h-8" />
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
