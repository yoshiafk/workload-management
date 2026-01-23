/**
 * Timeline Skeleton
 * Loading placeholder for timeline/Gantt views
 */

import { cn } from '@/lib/utils';
import { Skeleton } from '../skeleton';

export function TimelineSkeleton({
    className,
    rows = 8,
    days = 7,
}) {
    return (
        <div className={cn('bg-card rounded-xl border border-border overflow-hidden', className)}>
            {/* Header Controls */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <Skeleton width={100} height={36} className="rounded-lg" />
                    <Skeleton width={100} height={36} className="rounded-lg" />
                    <Skeleton width={100} height={36} className="rounded-lg" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton width={36} height={36} className="rounded-lg" />
                    <Skeleton width={120} height={36} className="rounded-lg" />
                    <Skeleton width={36} height={36} className="rounded-lg" />
                </div>
            </div>

            {/* Timeline Grid */}
            <div className="overflow-x-auto">
                {/* Date Headers */}
                <div className="flex border-b border-border bg-muted/30">
                    <div className="w-48 flex-shrink-0 p-3 border-r border-border">
                        <Skeleton width={80} height={16} />
                    </div>
                    {Array.from({ length: days }).map((_, i) => (
                        <div key={i} className="w-24 flex-shrink-0 p-3 border-r border-border text-center">
                            <Skeleton width={60} height={14} className="mx-auto" />
                        </div>
                    ))}
                </div>

                {/* Resource Rows */}
                {Array.from({ length: rows }).map((_, rowIdx) => (
                    <div key={rowIdx} className="flex border-b border-border">
                        {/* Resource Name */}
                        <div className="w-48 flex-shrink-0 p-3 border-r border-border flex items-center gap-2">
                            <Skeleton variant="circle" width={32} height={32} />
                            <div>
                                <Skeleton width={80} height={14} className="mb-1" />
                                <Skeleton width={50} height={10} />
                            </div>
                        </div>
                        {/* Timeline Cells */}
                        <div className="flex flex-1">
                            {Array.from({ length: days }).map((_, dayIdx) => (
                                <div
                                    key={dayIdx}
                                    className="w-24 flex-shrink-0 p-2 border-r border-border"
                                >
                                    {/* Random allocation bars */}
                                    {Math.random() > 0.6 && (
                                        <Skeleton
                                            height={24}
                                            className="rounded-md"
                                            style={{
                                                width: Math.random() > 0.5 ? '100%' : '80%',
                                                opacity: 0.6 + Math.random() * 0.4
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-4 p-4 border-t border-border">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <Skeleton width={12} height={12} className="rounded-sm" />
                        <Skeleton width={60} height={12} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TimelineSkeleton;
