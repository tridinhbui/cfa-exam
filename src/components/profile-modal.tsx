'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, User, Mail, Pencil, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useUserStore } from '@/store/user-store';
import { updateUserProfile } from '@/lib/auth-utils';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { user } = useAuth();
    const { user: dbUser, setUser } = useUserStore();
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        if (user?.displayName) {
            setName(user.displayName);
        } else if (dbUser?.name) {
            setName(dbUser.name);
        }
    }, [user, dbUser, isOpen]);

    const handleSave = async () => {
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            // 1. Update Firebase
            await updateUserProfile(name);

            // 2. Update Supabase via API
            const token = await user?.getIdToken();
            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name })
            });

            if (!response.ok) throw new Error('Failed to update profile in database');

            const updatedDbUser = await response.json();

            // 3. Update local store
            if (dbUser) {
                setUser({ ...dbUser, name });
            }

            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-card border-border p-0 overflow-hidden rounded-[2rem]">
                <DialogHeader className="pt-8 px-8 pb-4 text-center">
                    <DialogTitle className="text-2xl font-bold tracking-tight">Edit Profile</DialogTitle>
                </DialogHeader>

                <div className="px-8 pb-8 space-y-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group cursor-pointer">
                            <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-indigo-500/20 bg-accent flex items-center justify-center shadow-xl transition-all group-hover:border-indigo-500/40">
                                {user?.photoURL && !imgError ? (
                                    <img
                                        src={user.photoURL}
                                        alt="Avatar"
                                        className="h-full w-full object-cover"
                                        onError={() => setImgError(true)}
                                    />
                                ) : (
                                    <User className="h-12 w-12 text-muted-foreground" />
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 h-9 w-9 bg-indigo-600 rounded-full flex items-center justify-center border-4 border-card shadow-lg text-white transform transition-transform group-hover:scale-110">
                                <Camera className="h-4 w-4" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Personal Info Label */}
                        <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-muted-foreground/60 uppercase">
                            <User className="h-3 w-3" />
                            <span>Personal Info</span>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            <div className="space-y-2 relative">
                                <Label htmlFor="name" className="text-xs font-bold text-muted-foreground ml-1">NAME</Label>
                                <div className="relative group">
                                    <Pencil className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-indigo-500" />
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-14 pl-12 bg-accent/30 border-border/50 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium"
                                        placeholder="Enter your name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground ml-1">EMAIL</Label>
                                <div className="relative opacity-60">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                                    <Input
                                        value={user?.email || ''}
                                        disabled
                                        className="h-14 pl-12 bg-accent/20 border-border/30 rounded-2xl cursor-not-allowed font-medium"
                                    />
                                </div>
                            </div>

                            {/* Subscription Status */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground ml-1">SUBSCRIPTION</Label>
                                <div className={cn(
                                    "flex items-center gap-3 h-14 px-4 rounded-2xl border border-dashed transition-all",
                                    dbUser?.subscription === 'PRO'
                                        ? "bg-indigo-500/5 border-indigo-500/30 text-indigo-400"
                                        : "bg-muted/30 border-border text-muted-foreground"
                                )}>
                                    <ShieldCheck className={cn("h-5 w-5", dbUser?.subscription === 'PRO' ? "text-indigo-500" : "text-muted-foreground/50")} />
                                    <span className="font-bold tracking-tight">
                                        {dbUser?.subscription === 'PRO' ? 'MentisAI PRO Member' : 'Free Learning Access'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="bg-accent/30 p-6 sm:flex-row gap-3 border-t border-border/50">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl font-bold hover:bg-background/80"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isLoading || !name.trim()}
                        className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
