'use client';

import React, { useEffect, useRef } from 'react';

interface Star {
    x: number;
    y: number;
    z: number;
    pz: number;
    speed?: number;
}

export function Starfield() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0;
        let height = 0;
        let stars: Star[] = [];
        let animationFrameId: number;

        const initStars = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            stars = Array.from({ length: 800 }, () => ({
                x: Math.random() * width - width / 2,
                y: Math.random() * height - height / 2,
                z: Math.random() * width,
                pz: 0,
                // Variable speed for each star to create more organic depth
                speed: 0.2 + Math.random() * 0.8
            }));
        };

        const update = () => {
            // Clear with semi-transparent dark blue/black for trail effect
            // Matching Lumist's deep space tone
            ctx.fillStyle = "rgba(6, 3, 19, 0.4)";
            ctx.fillRect(0, 0, width, height);

            const cx = width / 2;
            const cy = height / 2;

            stars.forEach((star) => {
                // Use individual star speed
                star.z -= star.speed || 0.5;

                if (star.z <= 0) {
                    star.z = width;
                    star.x = Math.random() * width - width / 2;
                    star.y = Math.random() * height - height / 2;
                    star.pz = width;
                }

                const x = (star.x / star.z) * width + cx;
                const y = (star.y / star.z) * height + cy;

                const size = (1 - star.z / width) * 2.5;

                // Slightly blue-ish white stars
                ctx.fillStyle = `rgba(220, 230, 255, ${0.8 - (star.z / width) * 0.5})`;
                ctx.beginPath();
                ctx.arc(x, y, size > 0 ? size : 0, 0, Math.PI * 2);
                ctx.fill();

                star.pz = star.z;
            });

            animationFrameId = requestAnimationFrame(update);
        };

        initStars();
        update();

        const handleResize = () => initStars();
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none"
            style={{ background: '#060313' }} // Specific dark background
        />
    );
}
