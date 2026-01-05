'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WORDS = ['ENGAGING', 'AI-POWERED', 'ADAPTIVE', 'PERSONAL'];

export function CyclingBadge() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % WORDS.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.span
            className="inline-block relative ml-3 px-4 py-1.5 bg-violet-600 text-white rounded-2xl text-2xl sm:text-3xl lg:text-4xl font-black shadow-xl shadow-violet-500/20 align-middle rotate-[-2deg] overflow-hidden min-w-[180px] text-center"
        >
            <AnimatePresence mode="wait">
                <motion.span
                    key={WORDS[index]}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="inline-block w-full"
                >
                    {WORDS[index]}
                </motion.span>
            </AnimatePresence>
        </motion.span>
    );
}
