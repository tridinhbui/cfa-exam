"use client";

import { useEffect, useRef } from "react";
import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

export const LoadingScreen = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let stars: Star[] = [];
        const numStars = 200;
        const speed = 0.5;

        // Set canvas size
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initStars();
        };

        class Star {
            x: number;
            y: number;
            z: number;
            prevZ: number;

            constructor() {
                this.x = (Math.random() - 0.5) * 2 * canvas!.width;
                this.y = (Math.random() - 0.5) * 2 * canvas!.height;
                this.z = Math.random() * canvas!.width;
                this.prevZ = this.z;
            }

            update() {
                this.z = this.z - speed * 10; // Move closer
                if (this.z <= 1) {
                    // Reset star
                    this.z = canvas!.width;
                    this.prevZ = this.z;
                    this.x = (Math.random() - 0.5) * 2 * canvas!.width;
                    this.y = (Math.random() - 0.5) * 2 * canvas!.height;
                }
            }

            show() {
                if (!ctx || !canvas) return;

                const x = (this.x / this.z) * canvas.width * 0.5 + canvas.width / 2;
                const y = (this.y / this.z) * canvas.height * 0.5 + canvas.height / 2;

                const r = (1 - this.z / canvas.width) * 3; // Size based on distance

                const prevX = (this.x / this.prevZ) * canvas.width * 0.5 + canvas.width / 2;
                const prevY = (this.y / this.prevZ) * canvas.height * 0.5 + canvas.height / 2;

                this.prevZ = this.z;

                // Draw star trail
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 255, 255, ${1 - this.z / canvas.width})`;
                ctx.lineWidth = r;
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
        }

        const initStars = () => {
            stars = [];
            for (let i = 0; i < numStars; i++) {
                stars.push(new Star());
            }
        };

        const animate = () => {
            if (!ctx || !canvas) return;

            // Clear with trail effect
            ctx.fillStyle = "rgba(10, 10, 15, 0.4)"; // Slight trail
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            stars.forEach((star) => {
                star.update();
                star.show();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener("resize", handleResize);
        handleResize(); // Initial setup
        animate();

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0f]"
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
        >
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

            <div className="relative z-10 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: 1,
                    }}
                    transition={{
                        scale: {
                            repeat: Infinity,
                            duration: 2,
                            ease: "easeInOut"
                        },
                        opacity: { duration: 0.5 }
                    }}
                    className="relative"
                >
                    {/* Glow effect behind logo */}
                    <div className="absolute inset-0 blur-2xl bg-indigo-500/30 rounded-full scale-150 animate-pulse" />

                    <GraduationCap
                        className="w-24 h-24 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                        strokeWidth={1.5}
                    />
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mt-8 text-sm font-medium tracking-[0.2em] text-indigo-200/70 uppercase"
                >
                    Aligning the stars...
                </motion.p>
            </div>
        </motion.div>
    );
};
