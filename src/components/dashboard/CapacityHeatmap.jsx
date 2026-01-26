/**
 * CapacityHeatmap Component
 * specialized dashboard component for team availability visualization
 */

import React from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDensity } from "@/context/DensityContext";
import { cn } from "@/lib/utils";

export function CapacityHeatmap({ data, title, className }) {
    const { isDense } = useDensity();

    if (!data || data.length === 0) return null;

    return (
        <div className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
            <div className={cn(
                "flex flex-wrap items-center justify-between gap-4 border-b border-border bg-muted/30",
                isDense ? "px-4 py-2" : "px-6 py-4"
            )}>
                <h3 className={cn("font-semibold", isDense ? "text-sm" : "text-lg")}>
                    {title || "Team Capacity - Next 7 Days"}
                </h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <LegendItem status="available" label="Available" />
                    <LegendItem status="light" label="Light" />
                    <LegendItem status="moderate" label="Moderate" />
                    <LegendItem status="heavy" label="Heavy" />
                    <LegendItem status="over-capacity" label="Over Capacity" />
                    <LegendItem status="leave" label="Leave" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-[640px]">
                    {/* Header Row */}
                    <div className="grid grid-cols-[180px_repeat(7,1fr)] border-b border-border bg-muted/20">
                        <div className={cn("font-medium text-muted-foreground", isDense ? "p-2 px-4 text-xs" : "p-3 px-6 text-sm")}>
                            Team Member
                        </div>
                        {data[0]?.days.map((day, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "flex flex-col items-center justify-center font-medium text-muted-foreground border-l border-border",
                                    isDense ? "p-1 py-2 text-[10px]" : "p-2 py-3 text-xs"
                                )}
                            >
                                {day.date.split(',')[0]}
                                <span className="text-foreground">{day.date.split(',')[1]}</span>
                            </div>
                        ))}
                    </div>

                    {/* Member Rows */}
                    <TooltipProvider delayDuration={100}>
                        {data.map((row, rowIdx) => (
                            <div
                                key={rowIdx}
                                className="grid grid-cols-[180px_repeat(7,1fr)] border-b border-border last:border-0 hover:bg-muted/10 transition-colors"
                            >
                                <div className={cn(
                                    "flex items-center font-medium",
                                    isDense ? "p-2 px-4 text-sm" : "p-3 px-6 text-base"
                                )}>
                                    {row.member}
                                </div>
                                {row.days.map((day, dayIdx) => (
                                    <Tooltip key={dayIdx}>
                                        <TooltipTrigger asChild>
                                            <div
                                                className={cn(
                                                    "flex items-center justify-center border-l border-border transition-all duration-200 cursor-default",
                                                    isDense ? "h-10 text-xs" : "h-14 text-sm",
                                                    getStatusClass(day.status),
                                                    "hover:brightness-95 hover:z-10 relative"
                                                )}
                                            >
                                                {day.status === 'leave' ? (
                                                    <span className="text-[10px] font-bold opacity-60">OFF</span>
                                                ) : (
                                                    day.count > 0 ? day.count : ''
                                                )}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[200px] p-3 shadow-xl">
                                            <div className="space-y-1.5">
                                                <div className="font-bold border-b border-border pb-1 mb-1">
                                                    {row.member}
                                                </div>
                                                <div className="text-xs flex justify-between">
                                                    <span className="text-muted-foreground">Date:</span>
                                                    <span>{day.date}</span>
                                                </div>
                                                <div className="text-xs flex justify-between">
                                                    <span className="text-muted-foreground">Status:</span>
                                                    <span className={cn("font-bold capitalize", getStatusTextClass(day.status))}>
                                                        {day.status.replace('-', ' ')}
                                                    </span>
                                                </div>
                                                {day.status !== 'leave' && (
                                                    <div className="text-xs flex justify-between">
                                                        <span className="text-muted-foreground">Active Tasks:</span>
                                                        <span className="font-bold">{day.count}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        ))}
                    </TooltipProvider>
                </div>
            </div>
        </div>
    );
}

function LegendItem({ status, label }) {
    return (
        <div className="flex items-center gap-1.5">
            <div className={cn("h-3 w-3 rounded-sm", getStatusClass(status))} />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
    );
}

function getStatusClass(status) {
    switch (status) {
        case 'available': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
        case 'light': return 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400';
        case 'moderate': return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';
        case 'heavy': return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
        case 'over-capacity': return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400';
        case 'leave': return 'bg-slate-100 dark:bg-slate-800 text-slate-400';
        default: return 'bg-muted/50';
    }
}

function getStatusTextClass(status) {
    switch (status) {
        case 'available': return 'text-emerald-600';
        case 'light': return 'text-sky-600';
        case 'moderate': return 'text-blue-600';
        case 'heavy': return 'text-amber-600';
        case 'over-capacity': return 'text-rose-600';
        case 'leave': return 'text-slate-500';
        default: return 'text-muted-foreground';
    }
}
