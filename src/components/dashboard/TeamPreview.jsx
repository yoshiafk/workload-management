/**
 * TeamPreview Component
 * Compact team member list with availability indicators
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberCardSkeleton } from "@/components/ui/skeleton";
import { useDensity } from "@/context/DensityContext";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export function TeamPreview({ members, workloads, availability, heatmap, loading }) {
    const navigate = useNavigate();
    const { isDense } = useDensity();

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <MemberCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    return (
        <div className="section space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className={cn("font-bold tracking-tight", isDense ? "text-lg" : "text-2xl")}>Team Overview</h2>
                    <p className="text-sm text-muted-foreground">7-day availability at a glance (max 5 concurrent tasks)</p>
                </div>
            </div>

            <div className={cn(
                "grid gap-4",
                isDense ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            )}>
                {members.map(member => {
                    const workload = workloads?.find(w => w.name === member.name);
                    const avail = availability?.find(a => a.memberName === member.name);
                    const memberHeatmap = heatmap?.find(h => h.member === member.name);

                    const status = avail?.status || 'available';
                    const isBusy = !avail?.hasCapacity;

                    return (
                        <Card
                            key={member.id}
                            className={cn(
                                "group relative hover:shadow-md transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm cursor-pointer overflow-hidden",
                                isBusy ? "hover:border-rose-200" : "hover:border-emerald-200"
                            )}
                            onClick={() => navigate(`/member/${member.id}`)}
                        >
                            <div className={cn(
                                "flex items-start gap-3",
                                isDense ? "p-3" : "p-4"
                            )}>
                                {/* Avatar */}
                                <div className={cn(
                                    "flex-shrink-0 flex items-center justify-center rounded-full font-bold text-white shadow-sm transition-transform duration-500 group-hover:scale-110",
                                    isBusy ? "bg-rose-500" : "bg-emerald-500",
                                    isDense ? "h-10 w-10 text-sm" : "h-12 w-12 text-base"
                                )}>
                                    {member.name.charAt(0).toUpperCase()}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className={cn("font-bold truncate group-hover:text-primary transition-colors", isDense ? "text-sm" : "text-base")}>
                                            {member.name}
                                        </h3>
                                        <div className={cn(
                                            "flex-shrink-0 h-2 w-2 rounded-full",
                                            isBusy ? "bg-rose-500 animate-pulse" : "bg-emerald-500"
                                        )} />
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate mb-2">{member.type}</p>

                                    {/* Mini Heatmap */}
                                    <div className="flex gap-1">
                                        {memberHeatmap?.days.map((day, idx) => (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "flex-1 h-1.5 rounded-full transition-all duration-300",
                                                    getMiniStatusClass(day.status)
                                                )}
                                                title={`${day.date}: ${day.count} tasks`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <ChevronRight className="h-4 w-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                            </div>

                            {/* Progress bar at the bottom */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-1000",
                                        isBusy ? "bg-rose-500" : "bg-emerald-500"
                                    )}
                                    style={{ width: `${Math.min(100, workload?.percentage || 0)}%` }}
                                />
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

function getMiniStatusClass(status) {
    switch (status) {
        case 'available': return 'bg-emerald-500/20 group-hover:bg-emerald-500/40';
        case 'busy': return 'bg-sky-500/30';
        case 'limited': return 'bg-amber-500/40';
        case 'at-capacity': return 'bg-rose-500/50';
        case 'leave': return 'bg-slate-200 dark:bg-slate-800';
        default: return 'bg-muted';
    }
}
