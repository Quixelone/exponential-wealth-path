/**
 * Utility to clear app cache and service workers
 * Useful for forcing users to load the latest version of the app
 */

export const clearAppCache = async (): Promise<void> => {
  try {
    console.log('🧹 Clearing app cache...');
    
    // Clear service worker cache
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('✅ Service worker unregistered');
      }
    }
    
    // Clear cache storage
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log(`✅ Cleared ${cacheNames.length} cache(s)`);
    }
    
    // Clear localStorage (optional - uncomment if needed)
    // localStorage.clear();
    // console.log('✅ LocalStorage cleared');
    
    // Clear sessionStorage (optional - uncomment if needed)
    // sessionStorage.clear();
    // console.log('✅ SessionStorage cleared');
    
    console.log('✅ Cache cleared successfully');
    
    // Force reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 500);
    
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    throw error;
  }
};

/**
 * Check if service workers are registered
 */
export const hasServiceWorker = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    return registrations.length > 0;
  }
  return false;
};

/**
 * Get cache info
 */
export const getCacheInfo = async (): Promise<{ count: number; names: string[] }> => {
  if ('caches' in window) {
    const names = await caches.keys();
    return { count: names.length, names };
  }
  return { count: 0, names: [] };
};
