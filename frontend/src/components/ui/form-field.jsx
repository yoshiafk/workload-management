import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function FormField({ 
  label, 
  children, 
  error, 
  className,
  required = false,
  ...props 
}) {
  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-[10px] text-red-500 font-bold">{error}</p>}
    </div>
  )
}

export function FormGrid({ children, className, ...props }) {
  return (
    <div className={cn("grid grid-cols-2 gap-4", className)} {...props}>
      {children}
    </div>
  )
}

export function FormSection({ children, className, ...props }) {
  return (
    <div className={cn("p-8 space-y-6 pt-4", className)} {...props}>
      {children}
    </div>
  )
}