import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const metricBarVariants = cva(
    "relative overflow-hidden rounded-full bg-muted",
    {
        variants: {
            size: {
                sm: "h-1.5",
                default: "h-2",
                lg: "h-3",
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
)

const getColorClass = (value, thresholds = { warning: 70, danger: 90 }) => {
    if (value >= thresholds.danger) return "bg-destructive"
    if (value >= thresholds.warning) return "bg-warning"
    return "bg-success"
}

const MetricBar = React.forwardRef(({
    value = 0,
    max = 100,
    label,
    showValue = false,
    showPercentage = false,
    size,
    colorMode = "auto", // 'auto', 'primary', 'success', 'warning', 'destructive', 'info'
    thresholds,
    className,
    barClassName,
    ...props
}, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const getBarColor = () => {
        if (colorMode === "auto") {
            return getColorClass(percentage, thresholds)
        }
        const colorMap = {
            primary: "bg-primary",
            success: "bg-success",
            warning: "bg-warning",
            destructive: "bg-destructive",
            info: "bg-info",
        }
        return colorMap[colorMode] || "bg-primary"
    }

    return (
        <div ref={ref} className={cn("w-full", className)} {...props}>
            {(label || showValue || showPercentage) && (
                <div className="flex items-center justify-between mb-1 text-xs">
                    {label && <span className="text-muted-foreground">{label}</span>}
                    <span className="text-foreground font-medium">
                        {showValue && `${value}/${max}`}
                        {showValue && showPercentage && " · "}
                        {showPercentage && `${Math.round(percentage)}%`}
                    </span>
                </div>
            )}
            <div className={cn(metricBarVariants({ size }))}>
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-500 ease-out",
                        getBarColor(),
                        barClassName
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
})
MetricBar.displayName = "MetricBar"

export { MetricBar, metricBarVariants }
