/**
 * Performance Utilities
 * 
 * Utilities per monitorare e ottimizzare le performance dei componenti React
 */

import { useEffect, useRef } from 'react';

/**
 * Hook per tracciare il tempo di rendering di un componente
 */
export const useRenderTracking = (componentName: string, enabled = false) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    if (!enabled) return;

    renderCount.current += 1;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    if (renderTime > 16) { // Slow render (>16ms = <60fps)
      console.warn(
        `🐌 Slow render detected: ${componentName}`,
        `\n  Render #${renderCount.current}`,
        `\n  Time: ${renderTime.toFixed(2)}ms`
      );
    }

    startTime.current = performance.now();
  });
};

/**
 * Wrapper per misurare le performance di una funzione
 */
export const measurePerformance = <T extends (...args: any[]) => any>(
  fn: T,
  label: string
): T => {
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    if (end - start > 10) {
      console.warn(`⏱️ ${label} took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  }) as T;
};

/**
 * Debounce function per ottimizzare chiamate frequenti
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function per limitare la frequenza di esecuzione
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Check if component should update (for debug)
 */
export const shouldComponentUpdate = (
  prevProps: Record<string, any>,
  nextProps: Record<string, any>,
  componentName: string,
  debug = false
): boolean => {
  const changedProps: string[] = [];

  Object.keys(nextProps).forEach((key) => {
    if (prevProps[key] !== nextProps[key]) {
      changedProps.push(key);
    }
  });

  if (debug && changedProps.length > 0) {
    console.log(`🔄 ${componentName} updating due to:`, changedProps);
  }

  return changedProps.length > 0;
};

/**
 * Memoization helper per calcoli costosi
 */
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    
    // Limit cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return result;
  }) as T;
};

/**
 * Report Web Vitals (per monitoring production)
 * Note: Requires 'web-vitals' package to be installed
 */
export const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Optional: install web-vitals package for production monitoring
    // npm install web-vitals
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Basic performance metrics without web-vitals
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const metrics = {
          dns: navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
          tcp: navigationEntry.connectEnd - navigationEntry.connectStart,
          ttfb: navigationEntry.responseStart - navigationEntry.requestStart,
          download: navigationEntry.responseEnd - navigationEntry.responseStart,
          domInteractive: navigationEntry.domInteractive - navigationEntry.fetchStart,
          domComplete: navigationEntry.domComplete - navigationEntry.fetchStart,
        };
        console.log('Performance Metrics:', metrics);
      }
    }
  }
};
