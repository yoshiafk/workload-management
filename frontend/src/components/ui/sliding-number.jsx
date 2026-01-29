"use client"

import * as React from "react"
import { motion, useSpring, useTransform, useInView } from "framer-motion"
import { cn } from "@/lib/utils"

const DIGIT_HEIGHT = 32
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

const Digit = ({ digit, transition }) => {
    const y = useSpring(digit * -DIGIT_HEIGHT, transition)

    React.useEffect(() => {
        y.set(digit * -DIGIT_HEIGHT)
    }, [digit, y])

    return (
        <div
            className="relative overflow-hidden"
            style={{ height: DIGIT_HEIGHT, width: "0.65em" }}
        >
            <motion.div style={{ y }}>
                {DIGITS.map((d) => (
                    <div
                        key={d}
                        className="flex items-center justify-center"
                        style={{ height: DIGIT_HEIGHT }}
                    >
                        {d}
                    </div>
                ))}
            </motion.div>
        </div>
    )
}

const formatNumber = (num, decimalPlaces, decimalSeparator, thousandSeparator) => {
    const [intPart, decPart] = num.toFixed(decimalPlaces).split(".")

    const formattedInt = thousandSeparator
        ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator)
        : intPart

    return decimalPlaces > 0
        ? `${formattedInt}${decimalSeparator}${decPart}`
        : formattedInt
}

const SlidingNumber = React.forwardRef(({
    number,
    fromNumber,
    padStart = false,
    decimalSeparator = ".",
    decimalPlaces = 0,
    thousandSeparator,
    transition = { stiffness: 200, damping: 20, mass: 0.4 },
    delay = 0,
    initiallyStable = false,
    inView = false,
    inViewMargin = "0px",
    inViewOnce = true,
    className,
    ...props
}, ref) => {
    const containerRef = React.useRef(null)
    const isInView = useInView(containerRef, {
        margin: inViewMargin,
        once: inViewOnce,
        amount: "some"
    })

    const [displayNumber, setDisplayNumber] = React.useState(
        initiallyStable ? number : (fromNumber ?? 0)
    )

    React.useEffect(() => {
        if (inView && !isInView) return

        const timer = setTimeout(() => {
            setDisplayNumber(number)
        }, delay * 1000)

        return () => clearTimeout(timer)
    }, [number, delay, inView, isInView])

    const formattedNumber = formatNumber(
        displayNumber,
        decimalPlaces,
        decimalSeparator,
        thousandSeparator
    )

    const chars = formattedNumber.split("")

    return (
        <motion.span
            ref={ref}
            className={cn("inline-flex items-center font-tabular-nums", className)}
            {...props}
        >
            <span ref={containerRef} className="inline-flex">
                {chars.map((char, index) => {
                    const isDigit = /\d/.test(char)

                    if (isDigit) {
                        return (
                            <Digit
                                key={`${index}-${char}`}
                                digit={parseInt(char, 10)}
                                transition={transition}
                            />
                        )
                    }

                    return (
                        <span key={`${index}-${char}`} className="inline-block">
                            {char}
                        </span>
                    )
                })}
            </span>
        </motion.span>
    )
})
SlidingNumber.displayName = "SlidingNumber"

export { SlidingNumber }
