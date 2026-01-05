import { ReactNode } from 'react';
import { motion } from 'framer-motion';

import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
    title: string;
    description: string;
    children: ReactNode;
    icon?: LucideIcon;
    className?: string; // For grid column/row spans
    delay?: number;
}

export function FeatureCard({ title, description, children, icon: Icon, className = '', delay = 0 }: FeatureCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay, duration: 0.5 }}
            className={`relative group rounded-[2.5rem] bg-slate-900/40 border border-white/5 overflow-hidden ${className}`}
        >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />

            {/* Content Container */}
            <div className="relative h-full flex flex-col">
                {/* Visual Mockup Area - grows to fill space, but pushes text down */}
                <div className="flex-grow relative min-h-[200px] overflow-hidden">
                    {children}

                    {/* Fade Overlay at bottom of visual to blend with text area if needed */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900/90 to-transparent pointer-events-none" />
                </div>

                {/* Text Details */}
                <div className="p-8 relative z-10 bg-slate-900/20 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors flex items-center gap-3">
                        {Icon && <Icon className="w-6 h-6 text-indigo-400" />}
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
