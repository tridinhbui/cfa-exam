'use client';

import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

interface LoadingScreenProps {
    isExiting: boolean;
}

export function LoadingScreen({ isExiting }: LoadingScreenProps) {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            initial={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* 
        Logo Container 
        layoutId="brand-logo" connects this to the navbar logo.
        bg-transparent ensures no purple box initially.
      */}
            <motion.div
                layoutId="brand-logo"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                className="flex h-24 w-24 items-center justify-center rounded-3xl bg-transparent relative z-20"
                style={{ opacity: 1 }}
                transition={{
                    duration: 0.8,
                    ease: [0.4, 0, 0.2, 1]
                }}
            >
                <GraduationCap className="h-12 w-12 text-white" />
            </motion.div>

            {/* Text Container - Fades out separately */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{
                    opacity: isExiting ? 0 : 1,
                    y: isExiting ? -10 : 0
                }}
                transition={{ duration: 0.5 }}
                className="mt-8 text-center"
            >
                <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">Aligning the stars...</p>
            </motion.div>
        </motion.div>
    );
}
