import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'title' | 'circle' | 'card' | 'button' | 'avatar';
}

/**
 * Modern skeleton loader component with shimmer animation
 * Used for loading states throughout the application
 */
function Skeleton({ className, variant = 'text', ...props }: SkeletonProps) {
  const variantClasses = {
    text: 'skeleton-text',
    title: 'skeleton-title',
    circle: 'skeleton-circle w-12 h-12',
    card: 'skeleton-card',
    button: 'skeleton rounded-lg h-10 w-24',
    avatar: 'skeleton-circle w-10 h-10',
  };

  return (
    <div
      className={cn(
        'skeleton',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

/**
 * Skeleton for stat cards
 */
function SkeletonStatCard() {
  return (
    <div className="modern-card p-6 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <Skeleton variant="circle" className="w-12 h-12" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton variant="title" />
      <Skeleton className="h-8 w-32" />
    </div>
  );
}

/**
 * Skeleton for table rows
 */
function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}

/**
 * Skeleton for chart
 */
function SkeletonChart() {
  return (
    <div className="chart-container space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton variant="title" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="h-64 flex items-end justify-between gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${Math.random() * 100 + 50}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export { Skeleton, SkeletonStatCard, SkeletonTableRow, SkeletonChart }
