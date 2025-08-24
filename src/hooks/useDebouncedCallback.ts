import { useCallback, useRef } from 'react';

/**
 * Hook per creare callback con debouncing
 * Previene chiamate multiple in rapida successione
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);
  
  // Mantieni sempre il callback più recente
  callbackRef.current = callback;

  return useCallback(
    ((...args: any[]) => {
      // Cancella il timeout precedente se esiste
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Crea un nuovo timeout
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay] // Rimuovi callback dalle dependencies per stabilità
  );
}