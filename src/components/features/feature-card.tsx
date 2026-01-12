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
            className={`relative group rounded-[2.5rem] bg-slate-900/40 light:bg-white/40 border border-white/5 light:border-slate-200 overflow-hidden ${className}`}
        >
            <GlowingEffect
                spread={40}
                proximity={64}
                inactiveZone={0.01}
                variant={glowingVariant}
                borderWidth={1.5}
            />

            {/* Content Container */}
            <div className="relative p-8 h-full flex flex-col z-10">
                <div className="flex-grow">
                    <div className="mb-6 relative h-48 rounded-2xl overflow-hidden bg-slate-950/50 light:bg-slate-50 border border-white/5 light:border-slate-100 group-hover:border-indigo-500/30 transition-colors">
                        {children}
                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900/90 light:from-slate-50/90 to-transparent pointer-events-none" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-white light:text-slate-900 mb-2 group-hover:text-indigo-400 light:group-hover:text-indigo-600 transition-colors flex items-center gap-3">
                            {Icon && <Icon className={`w-6 h-6 ${iconColor}`} />}
                            {title}
                        </h3>
                        <p className="text-slate-400 light:text-slate-600 leading-relaxed text-sm">
                            {description}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
