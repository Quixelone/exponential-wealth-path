import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  type: 'card' | 'table' | 'list' | 'stat' | 'chart';
  count?: number;
  className?: string;
}

/**
 * Professional skeleton loaders with shimmer effect
 * Uses CSS animations for better performance
 */
export function SkeletonLoader({ type, count = 1, className }: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return <SkeletonCard />;
      case 'table':
        return <SkeletonTable />;
      case 'list':
        return <SkeletonListItem />;
      case 'stat':
        return <SkeletonStat />;
      case 'chart':
        return <SkeletonChart />;
      default:
        return <SkeletonCard />;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="animate-fade-in"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="modern-card p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton variant="circle" className="w-10 h-10" />
      </div>
      
      <div className="space-y-3 pt-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-border">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 border-b border-border">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

function SkeletonListItem() {
  return (
    <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
      <Skeleton variant="circle" className="w-12 h-12 flex-shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-8 w-24" />
    </div>
  );
}

function SkeletonStat() {
  return (
    <div className="modern-card p-6 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton variant="circle" className="w-12 h-12" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="modern-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="h-64 flex items-end justify-between gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${Math.random() * 60 + 40}%` }}
          />
        ))}
      </div>
    </div>
  );
}
