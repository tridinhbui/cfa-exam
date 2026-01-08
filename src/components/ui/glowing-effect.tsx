"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { animate } from "framer-motion";

interface GlowingEffectProps {
    blur?: number;
    inactiveZone?: number;
    proximity?: number;
    spread?: number;
    variant?: "default" | "white" | "indigo" | "emerald" | "amber" | "rose" | "cyan";
    glow?: boolean;
    className?: string;
    disabled?: boolean;
    movementDuration?: number;
    borderWidth?: number;
}
const GlowingEffect = memo(
    ({
        blur = 0,
        inactiveZone = 0.7,
        proximity = 500,
        spread = 80, // Even wider for maximum impact
        variant = "default",
        glow = false,
        className,
        movementDuration = 1.5, // Faster movement for more responsiveness
        borderWidth = 2.5, // Slightly thicker border
        disabled = false,
    }: GlowingEffectProps) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const lastPosition = useRef({ x: 0, y: 0 });
        const animationFrameRef = useRef<number>(0);

        const handleMove = useCallback(
            (e?: MouseEvent | { x: number; y: number }) => {
                if (!containerRef.current) return;

                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }

                animationFrameRef.current = requestAnimationFrame(() => {
                    const element = containerRef.current;
                    if (!element) return;

                    const { left, top, width, height } = element.getBoundingClientRect();
                    const mouseX = e?.x ?? lastPosition.current.x;
                    const mouseY = e?.y ?? lastPosition.current.y;

                    if (e) {
                        lastPosition.current = { x: mouseX, y: mouseY };
                    }

                    const center = [left + width * 0.5, top + height * 0.5];
                    const distanceFromCenter = Math.hypot(
                        mouseX - center[0],
                        mouseY - center[1]
                    );
                    const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

                    if (distanceFromCenter < inactiveRadius) {
                        element.style.setProperty("--active", "0");
                        return;
                    }

                    const isActive =
                        mouseX > left - proximity &&
                        mouseX < left + width + proximity &&
                        mouseY > top - proximity &&
                        mouseY < top + height + proximity;

                    element.style.setProperty("--active", isActive ? "1" : "0");

                    if (!isActive) return;

                    const currentAngle =
                        parseFloat(element.style.getPropertyValue("--start")) || 0;
                    let targetAngle =
                        (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) /
                        Math.PI +
                        90;

                    const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
                    const newAngle = currentAngle + angleDiff;

                    animate(currentAngle, newAngle, {
                        duration: movementDuration,
                        ease: [0.16, 1, 0.3, 1],
                        onUpdate: (value) => {
                            element.style.setProperty("--start", String(value));
                        },
                    });
                });
            },
            [inactiveZone, proximity, movementDuration]
        );

        useEffect(() => {
            if (disabled) return;

            const handleScroll = () => handleMove();
            const handlePointerMove = (e: PointerEvent) => handleMove(e);

            window.addEventListener("scroll", handleScroll, { passive: true });
            document.body.addEventListener("pointermove", handlePointerMove, {
                passive: true,
            });

            return () => {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
                window.removeEventListener("scroll", handleScroll);
                document.body.removeEventListener("pointermove", handlePointerMove);
            };
        }, [handleMove, disabled]);

        const getGradientColor = () => {
            switch (variant) {
                case "white": return "#ffffff";
                case "indigo": return "#818cf8"; // Lighter version for more glow
                case "emerald": return "#34d399";
                case "amber": return "#fbbf24";
                case "rose": return "#fb7185";
                case "cyan": return "#22d3ee";
                default: return "#f472b6";
            }
        };

        const color = getGradientColor();

        return (
            <div
                ref={containerRef}
                style={
                    {
                        "--blur": `${blur}px`,
                        "--spread": spread,
                        "--start": "0",
                        "--active": "0",
                        "--glowingeffect-border-width": `${borderWidth}px`,
                        "--beam-color": color,
                    } as React.CSSProperties
                }
                className={cn(
                    "pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300",
                    className,
                    disabled && "hidden"
                )}
            >
                <div
                    className={cn(
                        "rounded-[inherit] absolute inset-0 overflow-hidden translate-z-0",
                        // The primary beam (high intensity)
                        "after:content-[''] after:absolute after:inset-0 after:rounded-[inherit]",
                        "after:opacity-[var(--active)] after:transition-opacity after:duration-500",
                        "after:[background-image:var(--beam-gradient)]",
                        "after:[mask-image:linear-gradient(black,black),linear-gradient(black,black)]",
                        "after:[mask-clip:padding-box,border-box]",
                        "after:[mask-composite:exclude]",
                        "after:[border:var(--glowingeffect-border-width)_solid_transparent]",

                        // The massive glow (boosted opacity and blur)
                        "before:content-[''] before:absolute before:inset-0 before:rounded-[inherit]",
                        "before:opacity-[calc(var(--active)*0.8)] before:transition-opacity before:duration-500",
                        "before:[background-image:var(--beam-gradient)] before:blur-2xl"
                    )}
                    style={{
                        "--beam-gradient": `conic-gradient(from calc(var(--start) * 1deg - ${spread / 2}deg), transparent 0deg, var(--beam-color) ${spread / 2}deg, transparent ${spread}deg)`
                    } as React.CSSProperties}
                />
            </div>
        );
    }
);

GlowingEffect.displayName = "GlowingEffect";

export { GlowingEffect };
