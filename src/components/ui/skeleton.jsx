/**
 * Enhanced Skeleton Component
 * Provides various skeleton shapes for loading states
 */

import { cn } from '@/lib/utils';

/**
 * Base skeleton component with configurable shape and animation
 */
function Skeleton({
  className,
  variant = 'rect',
  width,
  height,
  lines = 1,
  animate = true,
  ...props
}) {
  const baseClasses = cn(
    'bg-muted',
    animate && 'animate-pulse',
    className
  );

  // Text variant - multiple lines
  if (variant === 'text') {
    return (
      <div className="space-y-2" {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              'h-4 rounded',
              // Last line is shorter
              i === lines - 1 && lines > 1 && 'w-3/4'
            )}
            style={{
              width: i === lines - 1 && lines > 1 ? '75%' : width,
              height
            }}
          />
        ))}
      </div>
    );
  }

  // Circle variant - for avatars
  if (variant === 'circle') {
    return (
      <div
        className={cn(baseClasses, 'rounded-full')}
        style={{
          width: width || 40,
          height: height || width || 40
        }}
        {...props}
      />
    );
  }

  // Card variant - full card placeholder
  if (variant === 'card') {
    return (
      <div
        className={cn(
          baseClasses,
          'rounded-xl border border-border'
        )}
        style={{
          width: width || '100%',
          height: height || 120
        }}
        {...props}
      />
    );
  }

  // Default rect variant
  return (
    <div
      className={cn(baseClasses, 'rounded-md')}
      style={{ width, height }}
      {...props}
    />
  );
}

/**
 * Skeleton for stat/KPI cards
 */
function StatCardSkeleton({ className }) {
  return (
    <div className={cn('p-4 lg:p-6 rounded-xl border border-border bg-card animate-pulse', className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="text" width={80} height={16} />
        <Skeleton variant="circle" width={20} height={20} />
      </div>
      <Skeleton width={120} height={32} className="mb-2" />
      <Skeleton variant="text" width={100} height={14} />
    </div>
  );
}

/**
 * Skeleton for chart containers
 */
function ChartSkeleton({ className, height = 250 }) {
  return (
    <div className={cn('p-6 rounded-xl border border-border bg-card', className)}>
      <Skeleton width={150} height={20} className="mb-4" />
      <Skeleton variant="card" height={height} className="border-0" />
    </div>
  );
}

/**
 * Skeleton for table rows
 */
function TableRowSkeleton({ columns = 5, className }) {
  return (
    <div className={cn('flex items-center gap-4 py-3 px-4 border-b border-border', className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === 0 ? 150 : 100}
          height={16}
          className="flex-shrink-0"
        />
      ))}
    </div>
  );
}

/**
 * Skeleton for member/avatar cards
 */
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

export {
  Skeleton,
  StatCardSkeleton,
  ChartSkeleton,
  TableRowSkeleton,
  MemberCardSkeleton
};
