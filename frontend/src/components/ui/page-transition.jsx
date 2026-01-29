import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1]
        }
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: { duration: 0.2 }
    }
}

const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
}

const staggerItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1]
        }
    }
}

const PageTransition = React.forwardRef(({
    children,
    className,
    ...props
}, ref) => {
    return (
        <motion.div
            ref={ref}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(className)}
            {...props}
        >
            {children}
        </motion.div>
    )
})
PageTransition.displayName = "PageTransition"

const StaggerContainer = React.forwardRef(({
    children,
    className,
    ...props
}, ref) => {
    return (
        <motion.div
            ref={ref}
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            className={cn(className)}
            {...props}
        >
            {children}
        </motion.div>
    )
})
StaggerContainer.displayName = "StaggerContainer"

const StaggerItem = React.forwardRef(({
    children,
    className,
    ...props
}, ref) => {
    return (
        <motion.div
            ref={ref}
            variants={staggerItemVariants}
            className={cn(className)}
            {...props}
        >
            {children}
        </motion.div>
    )
})
StaggerItem.displayName = "StaggerItem"

export {
    PageTransition,
    StaggerContainer,
    StaggerItem,
    pageVariants,
    staggerContainerVariants,
    staggerItemVariants
}
