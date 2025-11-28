import { useAuth } from "@/contexts/AuthContext";

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export type ProtectedFeature = 
  | 'advanced_courses'
  | 'unlimited_simulations'
  | 'ai_coach'
  | 'leaderboard_details'
  | 'advanced_analytics';

const FEATURE_REQUIREMENTS: Record<ProtectedFeature, SubscriptionTier[]> = {
  advanced_courses: ['pro', 'enterprise'],
  unlimited_simulations: ['pro', 'enterprise'],
  ai_coach: ['pro', 'enterprise'],
  leaderboard_details: ['enterprise'],
  advanced_analytics: ['enterprise'],
};

// Mapping Stripe product IDs to tiers
const PRODUCT_TO_TIER: Record<string, SubscriptionTier> = {
  'prod_TVWGTAfnyka83R': 'pro',      // BitQuant Pro
  'prod_TVWkIBXmcKVgqn': 'enterprise', // BitQuant Enterprise
};

export const PRICE_IDS = {
  pro: 'price_1SYVDrFMRGazSV2gFSx7NNEb',
  enterprise: 'price_1SYVgaFMRGazSV2gER6pAmLp',
};

export const useSubscriptionGate = (feature: ProtectedFeature) => {
  const { subscriptionProductId, isSubscribed } = useAuth();

  const currentTier: SubscriptionTier = subscriptionProductId 
    ? (PRODUCT_TO_TIER[subscriptionProductId] || 'free')
    : 'free';

  const requiredTiers = FEATURE_REQUIREMENTS[feature];
  const hasAccess = requiredTiers.includes(currentTier);

  const upgradeTier = hasAccess ? null : requiredTiers[0];

  return {
    hasAccess,
    currentTier,
    upgradeTier,
    isSubscribed,
  };
};
