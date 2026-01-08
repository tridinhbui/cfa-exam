"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface TabProps {
    text: string
    selected: boolean
    setSelected: (text: string) => void
    discount?: boolean
}

export function Tab({ text, selected, setSelected, discount }: TabProps) {
    return (
        <button
            onClick={() => setSelected(text)}
            className={cn(
                "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2",
                selected ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
        >
            {selected && (
                <motion.div
                    layoutId="pricing-tab"
                    className="absolute inset-0 z-0 rounded-full bg-primary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
            <span className="relative z-10 flex items-center gap-2 capitalize">
                {text}
                {discount && (
                    <span className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                        selected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-emerald-500/10 text-emerald-500"
                    )}>
                        -40%
                    </span>
                )}
            </span>
        </button>
    )
}
