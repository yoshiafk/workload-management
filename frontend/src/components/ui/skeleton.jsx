/**
 * Skeleton Component (shadcn-style)
 * Lightweight skeleton primitives styled with Tailwind CSS to mimic shadcn/ui
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Skeleton Component (shadcn-style)
 * Implements a forwardRef component and variants per the shadcn pattern.
 */
const Skeleton = React.forwardRef(({ className, variant = 'rect', width, height, lines = 1, animate = true, ...props }, ref) => {
  const base = cn(
    'bg-muted dark:bg-slate-700/40',
    animate ? 'motion-safe:animate-pulse' : null,
    'motion-reduce:animate-none'
  );

  if (variant === 'text') {
    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(base, 'h-4 rounded', i === lines - 1 && lines > 1 && 'w-3/4')}
            style={{ width: i === lines - 1 && lines > 1 ? '75%' : width, height }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div ref={ref} className={cn(base, 'rounded-full', className)} style={{ width: width || 40, height: height || width || 40 }} {...props} />
    );
  }

  if (variant === 'card') {
    return (
      <div ref={ref} className={cn(base, 'rounded-xl border border-border', className)} style={{ width: width || '100%', height: height || 120 }} {...props} />
    );
  }

  // default rect
  return (
    <div ref={ref} className={cn(base, 'rounded-md', className)} style={{ width, height }} {...props} />
  );
});
Skeleton.displayName = 'Skeleton';

function StatCardSkeleton({ className }) {
  return (
    <div className={cn('p-4 lg:p-6 rounded-xl border border-border bg-card', className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="text" width={80} height={16} />
        <Skeleton variant="circle" width={20} height={20} />
      </div>
      <Skeleton width={120} height={32} className="mb-2" />
      <Skeleton variant="text" width={100} height={14} />
    </div>
  );
}

function ChartSkeleton({ className, height = 250 }) {
  return (
    <div className={cn('p-6 rounded-xl border border-border bg-card', className)}>
      <Skeleton width={150} height={20} className="mb-4" />
      <Skeleton variant="card" height={height} className="border-0" />
    </div>
  );
}

function TableRowSkeleton({ columns = 5, className }) {
  return (
    <div className={cn('flex items-center gap-4 py-3 px-4 border-b border-border', className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} width={i === 0 ? 150 : 100} height={16} className="flex-shrink-0" />
      ))}
    </div>
  );
}

function MemberCardSkeleton({ className }) {
  return (
    <div className={cn('p-4 rounded-xl border border-border bg-card flex items-center gap-3', className)}>
      <Skeleton variant="circle" width={40} height={40} />
      <div className="flex-1">
        <Skeleton width={120} height={16} className="mb-2" />
        <Skeleton width={80} height={12} />
      </div>
      <Skeleton width={60} height={24} className="rounded-full" />
    </div>
  );
}

export { Skeleton, StatCardSkeleton, ChartSkeleton, TableRowSkeleton, MemberCardSkeleton };
