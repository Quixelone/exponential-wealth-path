/**
 * Feature Flags System
 * Centralized feature toggles for progressive rollout and A/B testing
 */

export interface FeatureFlags {
  // UI/UX Features
  newDashboardLayout: boolean;
  modernStatisticsCards: boolean;
  enhancedCharts: boolean;
  
  // Functional Features
  paperTrading: boolean;
  aiSignals: boolean;
  advancedAnalytics: boolean;
  
  // Experimental Features
  realtimeSync: boolean;
  darkModeV2: boolean;
  mobileAppBanner: boolean;
}

// Default feature flags (production settings)
const defaultFlags: FeatureFlags = {
  newDashboardLayout: false,
  modernStatisticsCards: false,
  enhancedCharts: false,
  paperTrading: true,
  aiSignals: false,
  advancedAnalytics: false,
  realtimeSync: false,
  darkModeV2: false,
  mobileAppBanner: false,
};

// Development overrides (enable features in dev)
const devFlags: Partial<FeatureFlags> = {
  modernStatisticsCards: true,
  enhancedCharts: true,
  advancedAnalytics: true,
};

// Get feature flags based on environment
export function getFeatureFlags(): FeatureFlags {
  const isDev = import.meta.env.DEV;
  
  // In development, merge dev overrides
  if (isDev) {
    return { ...defaultFlags, ...devFlags };
  }
  
  // In production, check for user-specific overrides from localStorage
  try {
    const stored = localStorage.getItem('featureFlags');
    if (stored) {
      const userFlags = JSON.parse(stored) as Partial<FeatureFlags>;
      return { ...defaultFlags, ...userFlags };
    }
  } catch (error) {
    console.warn('Failed to load feature flags from localStorage:', error);
  }
  
  return defaultFlags;
}

// Check if a specific feature is enabled
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature] ?? false;
}

// Enable/disable features at runtime (for admins/testing)
export function setFeatureFlag(feature: keyof FeatureFlags, enabled: boolean): void {
  try {
    const flags = getFeatureFlags();
    flags[feature] = enabled;
    localStorage.setItem('featureFlags', JSON.stringify(flags));
  } catch (error) {
    console.error('Failed to save feature flag:', error);
  }
}

// Reset all flags to defaults
export function resetFeatureFlags(): void {
  try {
    localStorage.removeItem('featureFlags');
  } catch (error) {
    console.error('Failed to reset feature flags:', error);
  }
}
