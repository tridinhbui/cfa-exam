"use client"

import { useEffect, useRef } from "react"
import { useMotionValue, useSpring, useTransform, motion } from "framer-motion"

export function NumberFlow({ value }: { value: number }) {
    const motionValue = useMotionValue(0)
    const springValue = useSpring(motionValue, {
        damping: 20,
        stiffness: 100,
    })
    const displayValue = useTransform(springValue, (latest) => Math.round(latest))

    useEffect(() => {
        motionValue.set(value)
    }, [value, motionValue])

    return <motion.span>{displayValue}</motion.span>
}
