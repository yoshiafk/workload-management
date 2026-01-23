"use client"

import * as React from "react"
import { motion, useInView } from "framer-motion"
import { cn } from "@/lib/utils"

const BlurFade = React.forwardRef(({
    children,
    className,
    delay = 0,
    duration = 0.4,
    yOffset = 6,
    blur = "6px",
    inView = true,
    inViewMargin = "-50px",
    inViewOnce = true,
    ...props
}, ref) => {
    const containerRef = React.useRef(null)
    const isInView = useInView(containerRef, {
        margin: inViewMargin,
        once: inViewOnce
    })

    const shouldAnimate = !inView || isInView

    const variants = {
        hidden: {
            opacity: 0,
            y: yOffset,
            filter: `blur(${blur})`,
        },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
        },
    }

    return (
        <motion.div
            ref={ref || containerRef}
            variants={variants}
            initial="hidden"
            animate={shouldAnimate ? "visible" : "hidden"}
            transition={{
                duration,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
            className={cn(className)}
            {...props}
        >
            <span ref={containerRef}>{children}</span>
        </motion.div>
    )
})
BlurFade.displayName = "BlurFade"

const FadeIn = React.forwardRef(({
    children,
    className,
    delay = 0,
    duration = 0.4,
    direction = "up", // up, down, left, right
    distance = 24,
    once = true,
    ...props
}, ref) => {
    const containerRef = React.useRef(null)
    const isInView = useInView(containerRef, { once, margin: "-10%" })

    const directionOffset = {
        up: { y: distance },
        down: { y: -distance },
        left: { x: distance },
        right: { x: -distance },
    }

    const variants = {
        hidden: {
            opacity: 0,
            ...directionOffset[direction],
        },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
        },
    }

    return (
        <motion.div
            ref={ref || containerRef}
            variants={variants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{
                duration,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
            className={cn(className)}
            {...props}
        >
            <span ref={containerRef}>{children}</span>
        </motion.div>
    )
})
FadeIn.displayName = "FadeIn"

const ScaleIn = React.forwardRef(({
    children,
    className,
    delay = 0,
    duration = 0.4,
    scale = 0.95,
    once = true,
    ...props
}, ref) => {
    const containerRef = React.useRef(null)
    const isInView = useInView(containerRef, { once, margin: "-10%" })

    const variants = {
        hidden: {
            opacity: 0,
            scale,
        },
        visible: {
            opacity: 1,
            scale: 1,
        },
    }

    return (
        <motion.div
            ref={ref || containerRef}
            variants={variants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{
                duration,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
            className={cn(className)}
            {...props}
        >
            <span ref={containerRef}>{children}</span>
        </motion.div>
    )
})
ScaleIn.displayName = "ScaleIn"

export { BlurFade, FadeIn, ScaleIn }
