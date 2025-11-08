import { useRef, useState, useCallback, TouchEvent } from 'react';

interface SwipeGestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // Minimum distance for a swipe
}

interface SwipeState {
  isSwiping: boolean;
  swipeDirection: 'left' | 'right' | null;
  swipeDistance: number;
}

/**
 * Hook for handling swipe gestures on mobile
 * Uses native touch events for optimal performance
 */
export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  threshold = 80,
}: SwipeGestureConfig) {
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwiping: false,
    swipeDirection: null,
    swipeDistance: 0,
  });

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartX.current) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    // Only consider horizontal swipes (ignore vertical scrolling)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      e.preventDefault(); // Prevent scroll
      
      const direction = diffX > 0 ? 'right' : 'left';
      setSwipeState({
        isSwiping: true,
        swipeDirection: direction,
        swipeDistance: Math.abs(diffX),
      });
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    const { swipeDirection, swipeDistance } = swipeState;

    // Trigger callbacks if threshold is met
    if (swipeDistance > threshold) {
      if (swipeDirection === 'left' && onSwipeLeft) {
        onSwipeLeft();
      } else if (swipeDirection === 'right' && onSwipeRight) {
        onSwipeRight();
      }
    }

    // Reset state
    touchStartX.current = 0;
    touchStartY.current = 0;
    setSwipeState({
      isSwiping: false,
      swipeDirection: null,
      swipeDistance: 0,
    });
  }, [swipeState, threshold, onSwipeLeft, onSwipeRight]);

  return {
    swipeState,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
