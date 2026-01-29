import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const EmptyState = React.forwardRef(({
    icon: Icon,
    title,
    description,
    action,
    className,
    ...props
}, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "flex flex-col items-center justify-center text-center py-12 px-4",
                className
            )}
            {...props}
        >
            {Icon && (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-muted-foreground" />
                </div>
            )}
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
            )}
            {action && (
                <Button onClick={action.onClick} variant={action.variant || "default"} size="sm">
                    {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                    {action.label}
                </Button>
            )}
        </div>
    )
})
EmptyState.displayName = "EmptyState"

export { EmptyState }
