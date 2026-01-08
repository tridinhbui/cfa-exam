'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import LiquidCrystalLogo from './liquid-crystal-logo';
import { PreloaderShaderBackground } from './preloader-background';

interface LoadingScreenProps {
    isExiting: boolean;
}

export function LoadingScreen({ isExiting }: LoadingScreenProps) {
    const [morph, setMorph] = useState(0);
    const [showLogo, setShowLogo] = useState(false);

    useEffect(() => {
        // Start morphing after 1.7 seconds of free movement
        const morphTimer = setTimeout(() => {
            let start = Date.now();
            const duration = 1500;

            const update = () => {
                const elapsed = Date.now() - start;
                const progress = Math.min(elapsed / duration, 1);

                // Smother ease
                const eased = progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                setMorph(eased);

                // Show brain slightly before morph completes
                if (progress > 0.6) setShowLogo(true);

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            };
            requestAnimationFrame(update);
        }, 1700);

        return () => clearTimeout(morphTimer);
    }, []);

    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
        >
            {/* Dynamic Shader Background */}
            <motion.div
                className="absolute inset-0 z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
            >
                <PreloaderShaderBackground />
                <div className="absolute inset-0 bg-black/20" />
            </motion.div>

            {/* 
                Main Logo Flight Container
            */}
            <motion.div
                layoutId="brand-logo"
                className="fixed inset-0 z-20 flex items-center justify-center overflow-hidden"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 1 }}
                transition={{
                    duration: 0.7,
                    ease: [0.4, 0, 0.2, 1]
                }}
            >
                {/* Fullscreen Morphing Shapes */}
                <div className="absolute inset-0">
                    <LiquidCrystalLogo morph={morph} speed={0.8} />
                </div>

                {/* Central Brain Logo - scaled up to be large */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, filter: "blur(12px)" }}
                    animate={{
                        opacity: showLogo ? 1 : 0,
                        scale: showLogo ? 1 : 0.8,
                        filter: showLogo ? "blur(0px)" : "blur(12px)"
                    }}
                    transition={{
                        duration: 1.0,
                        ease: "easeOut"
                    }}
                    className="relative z-10"
                >
                    <Image
                        src="/logo-brain-v3.png"
                        alt="Logo"
                        width={192}
                        height={192}
                        className="h-48 w-48 brightness-150 saturate-150 contrast-125 drop-shadow-[0_0_40px_rgba(34,197,253,0.8)]"
                    />
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
