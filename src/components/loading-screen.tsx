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
                className="flex h-48 w-48 items-center justify-center rounded-[3rem] bg-transparent relative z-20"
                style={{ opacity: 1 }}
                transition={{
                    duration: 0.8,
                    ease: [0.4, 0, 0.2, 1]
                }}
            >
                <GraduationCap className="h-24 w-24 text-white" />
            </motion.div>


        </motion.div>
    );
}
