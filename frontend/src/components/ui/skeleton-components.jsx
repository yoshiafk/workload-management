/**
 * Skeleton Loading Components
 * Provides loading states for various UI components
 */

import { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Table Skeleton
 */
export function TableSkeleton({ 
    rows = 5, 
    columns = 4, 
    className,
    showHeader = true 
}) {
    return (
        <div className={cn("rounded-xl border border-border bg-card shadow-sm overflow-hidden", className)}>
            {/* Header Skeleton */}
            {showHeader && (
                <div className="bg-muted/50 p-4 border-b border-border">
                    <div className="flex gap-4">
                        {Array.from({ length: columns }).map((_, index) => (
                            <Skeleton key={index} className="h-4 flex-1" />
                        ))}
                    </div>
                </div>
            )}
            
            {/* Rows Skeleton */}
            <div className="divide-y divide-border">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="p-4">
                        <div className="flex gap-4 items-center">
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <Skeleton 
                                    key={colIndex} 
                                    className={cn(
                                        "h-4",
                                        colIndex === 0 ? "w-16" : "flex-1"
                                    )} 
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Card Grid Skeleton
 */
export function CardGridSkeleton({ 
    cards = 6, 
    columns = 3, 
    className 
}) {
    return (
        <div className={cn(`grid grid-cols-1 md:grid-cols-${columns} gap-6`, className)}>
            {Array.from({ length: cards }).map((_, index) => (
                <Card key={index} className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-3 w-2/3" />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}

/**
 * Form Skeleton
 */
export function FormSkeleton({ 
    fields = 4, 
    className,
    showButtons = true 
}) {
    return (
        <div className={cn("space-y-6", className)}>
            {Array.from({ length: fields }).map((_, index) => (
                <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ))}
            
            {showButtons && (
                <div className="flex gap-3 pt-4">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-24" />
                </div>
            )}
        </div>
    );
}

/**
 * Chart Skeleton
 */
export function ChartSkeleton({ 
    height = 300, 
    className,
    showLegend = true 
}) {
    return (
        <Card className={cn("p-6", className)}>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    {showLegend && (
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3 w-3 rounded-full" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3 w-3 rounded-full" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="relative" style={{ height }}>
                    {/* Chart bars/lines simulation */}
                    <div className="absolute inset-0 flex items-end justify-between gap-2">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <Skeleton 
                                key={index} 
                                className="w-full"
                                style={{ 
                                    height: `${Math.random() * 80 + 20}%` 
                                }}
                            />
                        ))}
                    </div>
                </div>
                
                {/* X-axis labels */}
                <div className="flex justify-between">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <Skeleton key={index} className="h-3 w-8" />
                    ))}
                </div>
            </div>
        </Card>
    );
}

/**
 * Metrics Cards Skeleton
 */
export function MetricsCardsSkeleton({ 
    cards = 4, 
    className 
}) {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
            {Array.from({ length: cards }).map((_, index) => (
                <Card key={index} className="p-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-3 w-full" />
                    </div>
                </Card>
            ))}
        </div>
    );
}

/**
 * List Item Skeleton
 */
export function ListItemSkeleton({ 
    items = 5, 
    className,
    showAvatar = true,
    showActions = true 
}) {
    return (
        <div className={cn("space-y-4", className)}>
            {Array.from({ length: items }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                    {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    {showActions && (
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

/**
 * Page Header Skeleton
 */
export function PageHeaderSkeleton({ className }) {
    return (
        <div className={cn("bg-card p-6 rounded-2xl border border-border shadow-sm", className)}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
        </div>
    );
}

/**
 * Filter Bar Skeleton
 */
export function FilterBarSkeleton({ className }) {
    return (
        <div className={cn("bg-card p-4 rounded-xl border border-border shadow-sm", className)}>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Skeleton className="h-10 flex-1" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-20" />
                </div>
            </div>
        </div>
    );
}

/**
 * Dashboard Skeleton
 */
export function DashboardSkeleton({ className }) {
    return (
        <div className={cn("space-y-6", className)}>
            <PageHeaderSkeleton />
            <MetricsCardsSkeleton />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartSkeleton />
                <ChartSkeleton />
            </div>
            <TableSkeleton />
        </div>
    );
}

/**
 * Report Skeleton
 */
export function ReportSkeleton({ className }) {
    return (
        <div className={cn("space-y-6", className)}>
            <PageHeaderSkeleton />
            <FilterBarSkeleton />
            <MetricsCardsSkeleton cards={3} />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <ChartSkeleton height={400} />
                </div>
                <div>
                    <Card className="p-6">
                        <div className="space-y-4">
                            <Skeleton className="h-5 w-24" />
                            <ListItemSkeleton items={6} showAvatar={false} showActions={false} />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

/**
 * Loading Overlay Component
 */
export function LoadingOverlay({ 
    isLoading, 
    children, 
    message = "Loading...",
    className 
}) {
    if (!isLoading) return children;
    
    return (
        <div className={cn("relative", className)}>
            <div className="opacity-50 pointer-events-none">
                {children}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-sm text-slate-500">{message}</p>
                </div>
            </div>
        </div>
    );
}

/**
 * Progressive Loading Component
 */
export function ProgressiveLoader({ 
    isLoading, 
    skeleton, 
    children, 
    delay = 200,
    className 
}) {
    const [showSkeleton, setShowSkeleton] = useState(false);
    
    useEffect(() => {
        let timer;
        if (isLoading) {
            timer = setTimeout(() => setShowSkeleton(true), delay);
        } else {
            setShowSkeleton(false);
        }
        
        return () => clearTimeout(timer);
    }, [isLoading, delay]);
    
    if (isLoading && showSkeleton) {
        return <div className={className}>{skeleton}</div>;
    }
    
    if (isLoading) {
        return null; // Brief loading period without skeleton
    }
    
    return <div className={className}>{children}</div>;
}