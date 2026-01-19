import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Message {
    role: 'user' | 'assistant';
    content: string;
    image?: string;
}

export interface ChatSession {
    id: string;
    title: string;
    updatedAt: string;
}

interface ChatState {
    // Common State
    sessions: ChatSession[];
    currentSessionId: string | null;
    messages: Message[];
    isLoading: boolean;
    isSidebarOpen: boolean;

    // UI State
    isOpen: boolean;
    inputText: string;
    selectedImage: string | null;
    searchQuery: string;

    // Actions
    setIsOpen: (isOpen: boolean) => void;
    setSessions: (sessions: ChatSession[] | ((prev: ChatSession[]) => ChatSession[])) => void;
    setCurrentSessionId: (id: string | null) => void;
    setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
    setIsLoading: (isLoading: boolean) => void;
    setIsSidebarOpen: (isOpen: boolean) => void;
    setInputText: (text: string) => void;
    setSelectedImage: (image: string | null) => void;
    setSearchQuery: (query: string) => void;

    // Complex Actions
    resetChat: () => void;
    appendMessage: (message: Message) => void;
    updateLastMessage: (content: string) => void;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set) => ({
            sessions: [],
            currentSessionId: null,
            messages: [],
            isLoading: false,
            isSidebarOpen: true,
            isOpen: false,
            inputText: '',
            selectedImage: null,
            searchQuery: '',

            setIsOpen: (isOpen) => set({ isOpen }),
            setSessions: (sessionsOrFn) => set((state) => ({
                sessions: typeof sessionsOrFn === 'function' ? sessionsOrFn(state.sessions) : sessionsOrFn
            })),
            setCurrentSessionId: (currentSessionId) => set({ currentSessionId }),

            setMessages: (messagesOrFn) => set((state) => ({
                messages: typeof messagesOrFn === 'function' ? messagesOrFn(state.messages) : messagesOrFn
            })),

            setIsLoading: (isLoading) => set({ isLoading }),
            setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
            setInputText: (inputText) => set({ inputText }),
            setSelectedImage: (selectedImage) => set({ selectedImage }),
            setSearchQuery: (searchQuery) => set({ searchQuery }),

            resetChat: () => set({
                currentSessionId: null,
                messages: [],
                inputText: '',
                selectedImage: null
            }),

            appendMessage: (message) => set((state) => ({
                messages: [...state.messages, message]
            })),

            updateLastMessage: (content) => set((state) => {
                if (state.messages.length === 0) return state;
                const newMessages = [...state.messages];
                const lastMessage = { ...newMessages[newMessages.length - 1] };
                if (lastMessage.role === 'assistant') {
                    lastMessage.content += content;
                    newMessages[newMessages.length - 1] = lastMessage;
                    return { messages: newMessages };
                }
                return state;
            }),
        }),
        {
            name: 'mentis-chat-store',
            storage: createJSONStorage(() => localStorage),
            // Only persist specific UI states if needed, but for now we'll persist messages 
            // so turning off the page doesn't lose the local chat history until refreshed from DB.
            partialize: (state) => ({
                isSidebarOpen: state.isSidebarOpen,
                inputText: state.inputText, // Persist current typed message
                messages: state.messages,   // Persist current session messages
                currentSessionId: state.currentSessionId,
            }),
        }
    )
);
