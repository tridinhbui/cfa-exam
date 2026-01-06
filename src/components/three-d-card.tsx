'use client';

import React, { useRef, useState } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

interface ThreeDCardProps {
    children: React.ReactNode;
    perspective?: number;
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
    scale?: number;
    className?: string;
}

export function ThreeDCard({
    children,
    perspective = 1200,
    rotateX = 10,
    rotateY = -15,
    rotateZ = 0,
    scale = 1,
    className = '',
}: ThreeDCardProps) {
    const ref = useRef<HTMLDivElement>(null);

    // Mouse interpolation for interactive effect
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 50, damping: 20 });
    const mouseY = useSpring(y, { stiffness: 50, damping: 20 });

    function onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXPos = event.clientX - rect.left;
        const mouseYPos = event.clientY - rect.top;

        const xPct = mouseXPos / width - 0.5;
        const yPct = mouseYPos / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    }

    function onMouseLeave() {
        x.set(0);
        y.set(0);
    }

    // Combine base rotation with mouse interaction
    const rotateXValue = useTransform(mouseY, [-0.5, 0.5], [rotateX - 5, rotateX + 5]);
    const rotateYValue = useTransform(mouseX, [-0.5, 0.5], [rotateY - 5, rotateY + 5]);

    return (
        <motion.div
            ref={ref}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            className={`${className || 'relative'}`}
            style={{
                perspective: `${perspective}px`,
                transformStyle: 'preserve-3d',
            }}
        >
            <motion.div
                style={{
                    rotateX: rotateXValue,
                    rotateY: rotateYValue,
                    rotateZ: rotateZ,
                    scale: scale,
                    transformStyle: 'preserve-3d',
                }}
                className="w-full h-full"
                initial={{ rotateX: 25, rotateY: -25, opacity: 0, scale: 0.9 }}
                animate={{ rotateX: rotateX, rotateY: rotateY, opacity: 1, scale: scale }}
                transition={{ duration: 1.2, ease: "easeOut" }}
            >
                {/* Shadow Layers for Depth */}
                <div
                    className="absolute inset-0 bg-black/50 blur-2xl rounded-[1.5rem]"
                    style={{
                        transform: 'translateZ(-50px) translateY(40px) translateX(20px)',
                        opacity: 0.4
                    }}
                />
                <div
                    className="absolute inset-0 bg-indigo-900/30 blur-3xl rounded-[1.5rem]"
                    style={{
                        transform: 'translateZ(-80px) translateY(60px) translateX(40px)',
                        opacity: 0.3
                    }}
                />

                {/* Shine/Reflection effect */}
                <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-50 border border-white/10" />

                {children}
            </motion.div>
        </motion.div>
    );
}
