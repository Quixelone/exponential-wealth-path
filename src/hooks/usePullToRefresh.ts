import { useRef, useState, useCallback, useEffect, TouchEvent } from 'react';

interface PullToRefreshConfig {
  onRefresh: () => Promise<void>;
  threshold?: number; // Distance to trigger refresh
  disabled?: boolean;
}

interface PullState {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
}

/**
 * Hook for pull-to-refresh functionality on mobile
 * Works when user is at the top of the scroll container
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  disabled = false,
}: PullToRefreshConfig) {
  const touchStartY = useRef<number>(0);
  const scrollTop = useRef<number>(0);
  const [pullState, setPullState] = useState<PullState>({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
  });

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled) return;
    
    const target = e.currentTarget as HTMLElement;
    scrollTop.current = target.scrollTop;
    touchStartY.current = e.touches[0].clientY;
  }, [disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || scrollTop.current > 0) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;

    // Only pull down, and only when at top
    if (diff > 0 && scrollTop.current === 0) {
      // Apply resistance effect (slower pull as distance increases)
      const resistance = Math.min(diff * 0.5, threshold * 1.5);
      
      setPullState({
        isPulling: true,
        pullDistance: resistance,
        isRefreshing: false,
      });
    }
  }, [disabled, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled) return;

    const { pullDistance } = pullState;

    if (pullDistance > threshold) {
      setPullState({
        isPulling: false,
        pullDistance: 0,
        isRefreshing: true,
      });

      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh error:', error);
      } finally {
        setPullState({
          isPulling: false,
          pullDistance: 0,
          isRefreshing: false,
        });
      }
    } else {
      setPullState({
        isPulling: false,
        pullDistance: 0,
        isRefreshing: false,
      });
    }

    touchStartY.current = 0;
  }, [pullState, threshold, onRefresh, disabled]);

  return {
    pullState,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
