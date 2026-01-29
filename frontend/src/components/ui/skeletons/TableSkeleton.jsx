/**
 * Table Skeleton
 * Loading placeholder for data tables
 */

import { cn } from '@/lib/utils';
import { Skeleton, TableRowSkeleton } from '../skeleton';

export function TableSkeleton({
    className,
    rows = 10,
    columns = 6,
    showHeader = true,
    showToolbar = true,
}) {
    return (
        <div className={cn('bg-card rounded-xl border border-border overflow-hidden', className)}>
            {/* Toolbar */}
            {showToolbar && (
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <Skeleton width={200} height={36} className="rounded-lg" />
                        <Skeleton width={100} height={36} className="rounded-lg" />
                        <Skeleton width={100} height={36} className="rounded-lg" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton width={120} height={36} className="rounded-lg" />
                    </div>
                </div>
            )}

            {/* Header */}
            {showHeader && (
                <div className="flex items-center gap-4 py-3 px-4 bg-muted/50 border-b border-border">
                    {Array.from({ length: columns }).map((_, i) => (
                        <Skeleton
                            key={i}
                            width={i === 0 ? 32 : i === 1 ? 150 : 100}
                            height={14}
                            className="flex-shrink-0"
                        />
                    ))}
                </div>
            )}

            {/* Rows */}
            <div className="divide-y divide-border">
                {Array.from({ length: rows }).map((_, i) => (
                    <TableRowSkeleton key={i} columns={columns} />
                ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-border">
                <Skeleton width={150} height={16} />
                <div className="flex items-center gap-2">
                    <Skeleton width={80} height={32} className="rounded-lg" />
                    <Skeleton width={32} height={32} className="rounded-lg" />
                    <Skeleton width={32} height={32} className="rounded-lg" />
                    <Skeleton width={32} height={32} className="rounded-lg" />
                    <Skeleton width={80} height={32} className="rounded-lg" />
                </div>
            </div>
        </div>
    );
}

export default TableSkeleton;
