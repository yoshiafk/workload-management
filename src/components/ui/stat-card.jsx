/**
 * Enhanced StatCard Component
 * Features: density support, trend icons, sparklines, loading states.
 */

import * as React from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCardSkeleton } from "@/components/ui/skeleton"
import { useDensity } from "@/context/DensityContext"
import { cn } from "@/lib/utils"

const colorVariants = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
  muted: "bg-muted text-muted-foreground",
}

const StatCard = React.forwardRef(({
  title,
  value,
  subValue,
  icon: Icon,
  description,
  trend,
  trendLabel = "vs last period",
  color = "primary",
  sparklineData,
  loading = false,
  className,
  onClick,
  variants,
  ...props
}, ref) => {
  const { isDense } = useDensity()

  if (loading) return <StatCardSkeleton className={className} />

  const isPositiveTrend = trend >= 0
  const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown

  const chartData = React.useMemo(() =>
    sparklineData?.map((v, i) => ({ value: v, index: i })) || [],
    [sparklineData]
  )

  const strokeColor = {
    primary: "hsl(var(--primary))",
    success: "#10b981",
    warning: "#f59e0b",
    destructive: "#f43f5e",
    info: "#0ea5e9",
  }[color] || "hsl(var(--primary))"

  return (
    <motion.div
      variants={variants}
      className="h-full"
    >
      <Card
        ref={ref}
        className={cn(
          "h-full transition-all duration-300 hover:shadow-lg hover:border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden group",
          onClick && "cursor-pointer active:scale-[0.98] select-none",
          className
        )}
        onClick={onClick}
        {...props}
      >
        <CardHeader className={cn(
          "flex flex-row items-center justify-between space-y-0 pb-1.5",
          isDense ? "px-3 pt-3" : "px-6 pt-6"
        )}>
          <CardTitle className={cn(
            "font-semibold text-muted-foreground/80 transition-colors group-hover:text-foreground",
            isDense ? "text-[10px] uppercase tracking-wider" : "text-sm"
          )}>
            {title}
          </CardTitle>
          {Icon && (
            <div className={cn(
              "rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-md",
              colorVariants[color],
              isDense ? "p-1.5" : "p-2.5"
            )}>
              <Icon className={isDense ? "h-3.5 w-3.5" : "h-5 w-5"} />
            </div>
          )}
        </CardHeader>

        <CardContent className={cn(
          isDense ? "px-3 pb-3" : "px-6 pb-6"
        )}>
          <div className="flex items-baseline gap-2">
            <div className={cn(
              "font-extrabold tracking-tight text-foreground transition-all duration-300",
              isDense ? "text-xl" : "text-3xl"
            )}>
              {value}
            </div>
            {subValue && (
              <div className="text-xs text-muted-foreground/70 font-semibold">
                {subValue}
              </div>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between gap-4">
            <div className="flex flex-col min-w-0">
              {(trend !== undefined || description) && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {trend !== undefined && (
                    <div className={cn(
                      "flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md",
                      isPositiveTrend
                        ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10"
                        : "text-rose-600 bg-rose-50 dark:bg-rose-500/10"
                    )}>
                      <TrendIcon className="h-3 w-3 stroke-[2.5]" />
                      <span>{Math.abs(trend)}%</span>
                    </div>
                  )}
                  {description && (
                    <span className="text-[11px] text-muted-foreground/80 line-clamp-1 font-medium italic">
                      {description}
                    </span>
                  )}
                </div>
              )}
              {trend !== undefined && trendLabel && (
                <span className="text-[9px] text-muted-foreground/40 mt-1 font-bold uppercase tracking-[0.1em]">
                  {trendLabel}
                </span>
              )}
            </div>

            {sparklineData && sparklineData.length > 0 && (
              <div className={cn(
                "flex-1 max-w-[100px]",
                isDense ? "h-6" : "h-12"
              )}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={strokeColor}
                      strokeWidth={2.5}
                      fill={`url(#gradient-${color})`}
                      isAnimationActive={true}
                      dot={false}
                    />
                    <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
})
StatCard.displayName = "StatCard"

export { StatCard, colorVariants }
