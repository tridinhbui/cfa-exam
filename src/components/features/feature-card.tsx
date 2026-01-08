import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { GlowingEffect } from '@/components/ui/glowing-effect';

interface FeatureCardProps {
    title: string;
    description: string;
    children: ReactNode;
    icon?: LucideIcon;
    iconColor?: string; // Tailwind class for icon color
    className?: string; // For grid column/row spans
    delay?: number;
    glowingVariant?: "indigo" | "emerald" | "amber" | "rose" | "cyan";
}

export function FeatureCard({
    title,
    description,
    children,
    icon: Icon,
    iconColor = 'text-indigo-400',
    className = '',
    delay = 0,
    glowingVariant = "indigo"
}: FeatureCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay, duration: 0.5 }}
            className={`relative group rounded-[2.5rem] bg-slate-900/40 border border-white/5 overflow-hidden ${className}`}
        >
            <GlowingEffect
                spread={40}
                proximity={64}
                inactiveZone={0.01}
                variant={glowingVariant}
                borderWidth={1.5}
            />

            {/* Content Container */}
            <div className="relative h-full flex flex-col z-10">
                {/* Visual Mockup Area - grows to fill space, but pushes text down */}
                <div className="flex-grow relative min-h-[200px] overflow-hidden">
                    {children}

                    {/* Fade Overlay at bottom of visual to blend with text area if needed */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900/90 to-transparent pointer-events-none" />
                </div>

                {/* Text Details */}
                <div className="p-8 relative z-10 bg-slate-900/20 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors flex items-center gap-3">
                        {Icon && <Icon className={`w-6 h-6 ${iconColor}`} />}
                        {title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed text-sm">
                        {description}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
