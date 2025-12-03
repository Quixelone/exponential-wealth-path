// Re-export all validation utilities from a single entry point
export { 
  useOptionValidation,
  validateSettlementConsistency,
  type OptionFormData,
  type ValidationResult,
  type ValidationWarning,
  type ValidationError,
  type SettlementConsistencyResult
} from '@/hooks/useOptionValidation';

export { 
  useBtcPriceHistory,
  clearBtcPriceCache,
  prefetchBtcPrices 
} from '@/hooks/useBtcPriceHistory';

export { 
  ValidationFeedback,
  SettlementFeedback 
} from '@/components/wheel-strategy/ValidationFeedback';

// Additional validation utilities

/**
 * Calculate expected premium based on capital, APY, and duration
 */
export function calculateExpectedPremium(
  capital: number,
  apy: number,
  durationDays: number
): number {
  return capital * (apy / 100) * (durationDays / 365);
}

/**
 * Calculate APY from premium, capital, and duration
 */
export function calculateApyFromPremium(
  premium: number,
  capital: number,
  durationDays: number
): number {
  if (capital === 0 || durationDays === 0) return 0;
  return (premium / capital) * (365 / durationDays) * 100;
}

/**
 * Check if a strike price is reasonable for the given option type and BTC price
 */
export function isStrikeReasonable(
  strike: number,
  btcPrice: number,
  optionType: 'SELL_PUT' | 'COVERED_CALL'
): { reasonable: boolean; reason: string } {
  const ratio = strike / btcPrice;

  if (optionType === 'SELL_PUT') {
    if (ratio > 1.1) {
      return {
        reasonable: false,
        reason: 'Strike troppo alto per una PUT - alto rischio di assignment'
      };
    }
    if (ratio < 0.7) {
      return {
        reasonable: false,
        reason: 'Strike troppo basso per una PUT - premium molto basso'
      };
    }
    return { reasonable: true, reason: 'Strike ragionevole per PUT' };
  } else {
    if (ratio < 0.9) {
      return {
        reasonable: false,
        reason: 'Strike troppo basso per una CALL - alto rischio di assignment'
      };
    }
    if (ratio > 1.3) {
      return {
        reasonable: false,
        reason: 'Strike troppo alto per una CALL - premium molto basso'
      };
    }
    return { reasonable: true, reason: 'Strike ragionevole per CALL' };
  }
}

/**
 * Validate a complete option before submission
 */
export interface CompleteOptionValidation {
  strikePrice: number;
  apy: number;
  premium: number;
  capital: number;
  expirationDate: string;
  optionType: 'SELL_PUT' | 'COVERED_CALL';
  durationDays: number;
  btcPrice: number;
}

export function validateCompleteOption(
  option: CompleteOptionValidation
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Basic validations
  if (option.strikePrice <= 0) errors.push('Strike price non valido');
  if (option.apy <= 0 || option.apy > 1000) errors.push('APY non valido');
  if (option.premium <= 0) errors.push('Premium non valido');
  if (option.capital < 100) errors.push('Capitale minimo: $100');
  if (option.durationDays <= 0 || option.durationDays > 30) errors.push('Durata non valida');

  // Date validation
  const expDate = new Date(option.expirationDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (expDate < today) errors.push('Data scadenza nel passato');

  // Strike vs BTC price
  if (option.btcPrice > 0) {
    const ratio = option.strikePrice / option.btcPrice;
    if (ratio > 2 || ratio < 0.5) {
      errors.push('Strike price fuori range ragionevole');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Format validation message for display
 */
export function formatValidationMessage(
  field: string,
  value: number | string,
  expected?: number | string
): string {
  const fieldNames: Record<string, string> = {
    strikePrice: 'Strike Price',
    apy: 'APY',
    premium: 'Premium',
    capital: 'Capitale',
    expirationDate: 'Data Scadenza',
    durationDays: 'Durata'
  };

  const fieldName = fieldNames[field] || field;
  
  if (expected !== undefined) {
    return `${fieldName}: ${value} (atteso: ${expected})`;
  }
  
  return `${fieldName}: ${value}`;
}
