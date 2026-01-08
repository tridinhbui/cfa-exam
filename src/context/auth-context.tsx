'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    preloaderSeen: boolean;
    setPreloaderSeen: (seen: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    preloaderSeen: false,
    setPreloaderSeen: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [preloaderSeen, setPreloaderSeen] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            setLoading(false);

            if (user) {
                // Sync user with our database
                try {
                    await fetch('/api/user/sync', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            uid: user.uid,
                            email: user.email,
                            name: user.displayName,
                            image: user.photoURL,
                        }),
                    });
                } catch (error) {
                    console.error('Failed to sync user:', error);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, preloaderSeen, setPreloaderSeen }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
