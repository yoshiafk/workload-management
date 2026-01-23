import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full transition-colors",
  {
    variants: {
      status: {
        available: "bg-success/10 text-success border border-success/20",
        busy: "bg-primary/10 text-primary border border-primary/20",
        limited: "bg-warning/10 text-warning border border-warning/20",
        "at-capacity": "bg-destructive/10 text-destructive border border-destructive/20",
        leave: "bg-muted text-muted-foreground border border-border",
        active: "bg-success/10 text-success border border-success/20",
        inactive: "bg-muted text-muted-foreground border border-border",
        pending: "bg-warning/10 text-warning border border-warning/20",
        completed: "bg-success/10 text-success border border-success/20",
        overdue: "bg-destructive/10 text-destructive border border-destructive/20",
        info: "bg-info/10 text-info border border-info/20",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      status: "available",
      size: "default",
    },
  }
)

const StatusBadge = React.forwardRef(({
  status,
  label,
  showDot = true,
  size,
  className,
  ...props
}, ref) => {
  // Auto-generate label from status if not provided
  const displayLabel = label || status?.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
  
  return (
    <span 
      ref={ref}
      className={cn(statusBadgeVariants({ status, size }), className)}
      {...props}
    >
      {showDot && (
        <span 
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            status === "available" && "bg-success",
            status === "active" && "bg-success",
            status === "completed" && "bg-success",
            status === "busy" && "bg-primary",
            status === "limited" && "bg-warning",
            status === "pending" && "bg-warning",
            status === "at-capacity" && "bg-destructive",
            status === "overdue" && "bg-destructive",
            status === "leave" && "bg-muted-foreground",
            status === "inactive" && "bg-muted-foreground",
            status === "info" && "bg-info",
          )}
        />
      )}
      {displayLabel}
    </span>
  )
})
StatusBadge.displayName = "StatusBadge"

export { StatusBadge, statusBadgeVariants }
