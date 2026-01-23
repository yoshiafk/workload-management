import * as React from "react"
import { cn } from "@/lib/utils"

const PageHeader = React.forwardRef(({
    title,
    description,
    actions,
    className,
    ...props
}, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-6",
                className
            )}
            {...props}
        >
            <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight">{title}</h1>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    {actions}
                </div>
            )}
        </div>
    )
})
PageHeader.displayName = "PageHeader"

export { PageHeader }
