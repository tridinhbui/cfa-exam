'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Coins } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface LeaderboardUser {
    id: string;
    name: string | null;
    image: string | null;
    coins: number;
}

export function Leaderboard() {
    const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch('/api/user/leaderboard');
                if (response.ok) {
                    const data = await response.json();
                    setTopUsers(data);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0:
                return <Trophy className="h-5 w-5 text-amber-400 fill-amber-400" />;
            case 1:
                return <Medal className="h-5 w-5 text-slate-300 fill-slate-300" />;
            case 2:
                return <Medal className="h-5 w-5 text-amber-700 fill-amber-700" />;
            default:
                return null;
        }
    };

    const getRankColor = (index: number) => {
        switch (index) {
            case 0: return 'border-amber-400/50 bg-amber-400/5';
            case 1: return 'border-slate-300/50 bg-slate-300/5';
            case 2: return 'border-amber-700/50 bg-amber-700/5';
            default: return 'border-slate-800 bg-slate-800/50';
        }
    };

    if (loading) {
        return (
            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl">
                <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-400" />
                        Top Performers
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-[150px]" />
                                <Skeleton className="h-3 w-[80px]" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-400" />
                    Global Leaderboard
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="space-y-3">
                    {topUsers.map((user, index) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-center gap-4 p-3 rounded-xl border ${getRankColor(index)} relative group transition-all duration-300 hover:scale-[1.02]`}
                        >
                            <div className="flex items-center justify-center w-8 font-bold text-slate-500">
                                {index + 1}
                            </div>

                            <Avatar className="h-10 w-10 border-2 border-slate-700">
                                <AvatarImage src={user.image || ''} />
                                <AvatarFallback className="bg-slate-800 text-slate-400">
                                    {user.name?.[0] || '?'}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white truncate">
                                    {user.name || 'Anonymous User'}
                                </p>
                                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                                    <Coins className="h-3 w-3 fill-amber-400" />
                                    {user.coins.toLocaleString()} Coins
                                </div>
                            </div>

                            <div className="flex items-center pr-1">
                                {getRankIcon(index)}
                            </div>

                            {/* Decorative background glow for top 1 */}
                            {index === 0 && (
                                <div className="absolute inset-0 bg-amber-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                        </motion.div>
                    ))}

                    {topUsers.length === 0 && (
                        <div className="text-center py-8 text-slate-500 text-sm">
                            No data available yet
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
