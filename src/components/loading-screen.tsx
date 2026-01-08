'use client';

import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { useEffect, useState } from 'react';
import LiquidCrystalLogo from './liquid-crystal-logo';
import { PreloaderShaderBackground } from './preloader-background';

interface LoadingScreenProps {
    isExiting: boolean;
}

export function LoadingScreen({ isExiting }: LoadingScreenProps) {
    const [morph, setMorph] = useState(0);
    const [showIcon, setShowIcon] = useState(false);

    useEffect(() => {
        // Start morphing after 3.2 seconds of free movement
        const morphTimer = setTimeout(() => {
            let start = Date.now();
            const duration = 1500; // 1.5s morph duration for a smoother feel

            const update = () => {
                const elapsed = Date.now() - start;
                const progress = Math.min(elapsed / duration, 1);
                // Ease in out
                const eased = progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                setMorph(eased);

                if (progress > 0.7) setShowIcon(true);

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            };
            requestAnimationFrame(update);
        }, 3200);

        return () => clearTimeout(morphTimer);
    }, []);

    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            {/* Dynamic Shader Background from a.tsx */}
            <motion.div
                className="absolute inset-0 z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
            >
                <PreloaderShaderBackground />
                {/* Minimal overlay for depth without losing clarity */}
                <div className="absolute inset-0 bg-black/10" />
            </motion.div>

            {/* 
                Main Logo Flight Container
                Starting as fullscreen so shapes can be anywhere.
                Framer Motion will transition this from fixed inset-0 to the tiny navbar dimensions.
            */}
            <motion.div
                layoutId="brand-logo"
                className="fixed inset-0 z-20 flex items-center justify-center overflow-hidden"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 1 }}
                transition={{
                    duration: 0.8,
                    ease: [0.4, 0, 0.2, 1]
                }}
            >
                {/* Fullscreen Shader Background */}
                <div className="absolute inset-0">
                    <LiquidCrystalLogo morph={morph} speed={0.8} />
                </div>

                {/* Central Icon */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                        opacity: showIcon ? 1 : 0,
                        scale: showIcon ? 1 : 0.5
                    }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10"
                >
                    <GraduationCap className="h-16 w-16 text-white" />
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
