/**
 * Dashboard Skeleton
 * Loading placeholder for the WorkloadSummary dashboard
 */

import { cn } from '@/lib/utils';
import { Skeleton, StatCardSkeleton, ChartSkeleton, MemberCardSkeleton } from '../skeleton';

export function DashboardSkeleton({ className }) {
    return (
        <div className={cn('space-y-8 animate-in fade-in duration-300', className)}>
            {/* Action Bar Skeleton */}
            <div className="flex justify-between items-center bg-card p-4 px-6 rounded-2xl border border-border">
                <Skeleton width={150} height={24} />
                <div className="flex gap-3">
                    <Skeleton width={120} height={36} className="rounded-xl" />
                    <Skeleton width={140} height={36} className="rounded-xl" />
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>

            {/* Heatmap Skeleton */}
            <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex justify-between items-center mb-4">
                    <Skeleton width={200} height={20} />
                    <div className="flex gap-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} width={70} height={16} />
                        ))}
                    </div>
                </div>
                <Skeleton variant="card" height={200} className="border-0" />
            </div>

            {/* Charts Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ChartSkeleton />
                <ChartSkeleton />
                <ChartSkeleton />
            </div>

            {/* Team Overview Skeleton */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Skeleton width={150} height={24} />
                    <Skeleton width={100} height={16} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <MemberCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DashboardSkeleton;
