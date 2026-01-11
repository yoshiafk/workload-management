import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-indigo-600 text-white shadow hover:bg-indigo-700 active:scale-95",
        destructive:
          "bg-rose-500 text-white shadow-sm hover:bg-rose-600 active:scale-95",
        outline:
          "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100 active:scale-95",
        secondary:
          "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95",
        ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 active:scale-95",
        link: "text-indigo-600 underline-offset-4 hover:underline",
        success: "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 active:scale-95",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
