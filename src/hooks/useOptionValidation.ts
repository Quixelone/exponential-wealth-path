import { useMemo } from 'react';

export interface OptionFormData {
  strikePrice: number;
  apy: number;
  premium: number;
  capital: number;
  expirationDate: string;
  optionType: 'SELL_PUT' | 'COVERED_CALL';
  durationDays: number;
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  warnings: ValidationWarning[];
  errors: ValidationError[];
  hasHighWarnings: boolean;
}

// Expected APY ranges by duration (in days)
const APY_EXPECTATIONS = {
  1: { min: 20, max: 200, typical: 80 },
  2: { min: 12, max: 120, typical: 48 },
  3: { min: 8, max: 80, typical: 32 },
  7: { min: 6, max: 60, typical: 24 },
  14: { min: 5, max: 50, typical: 18 },
  30: { min: 4, max: 40, typical: 12 },
};

function getApyExpectation(durationDays: number) {
  // Find the closest duration key
  const durations = Object.keys(APY_EXPECTATIONS).map(Number).sort((a, b) => a - b);
  let closest = durations[0];
  
  for (const d of durations) {
    if (Math.abs(d - durationDays) < Math.abs(closest - durationDays)) {
      closest = d;
    }
  }
  
  return APY_EXPECTATIONS[closest as keyof typeof APY_EXPECTATIONS];
}

export function useOptionValidation(
  data: Partial<OptionFormData>,
  btcPrice: number
): ValidationResult {
  return useMemo(() => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const { strikePrice, apy, premium, capital, expirationDate, optionType, durationDays } = data;

    // === STRIKE PRICE VALIDATION ===
    if (strikePrice !== undefined) {
      if (strikePrice <= 0) {
        errors.push({
          field: 'strikePrice',
          message: 'Lo strike price deve essere maggiore di 0'
        });
      } else if (btcPrice > 0) {
        if (strikePrice > btcPrice * 2) {
          errors.push({
            field: 'strikePrice',
            message: `Strike price troppo alto (>${(btcPrice * 2).toLocaleString()} USD)`
          });
        }

        const ratio = strikePrice / btcPrice;

        if (optionType === 'SELL_PUT') {
          // PUT: strike should typically be below current price
          if (ratio > 1.2) {
            warnings.push({
              field: 'strikePrice',
              message: `Strike ${((ratio - 1) * 100).toFixed(0)}% sopra BTC attuale - molto rischioso per PUT`,
              severity: 'high'
            });
          } else if (ratio < 0.8) {
            warnings.push({
              field: 'strikePrice',
              message: `Strike ${((1 - ratio) * 100).toFixed(0)}% sotto BTC - premium potrebbe essere basso`,
              severity: 'medium'
            });
          }
        } else if (optionType === 'COVERED_CALL') {
          // CALL: strike should typically be above current price
          if (ratio < 0.8) {
            warnings.push({
              field: 'strikePrice',
              message: `Strike ${((1 - ratio) * 100).toFixed(0)}% sotto BTC - alta probabilità di assignment`,
              severity: 'high'
            });
          } else if (ratio > 1.2) {
            warnings.push({
              field: 'strikePrice',
              message: `Strike ${((ratio - 1) * 100).toFixed(0)}% sopra BTC - premium potrebbe essere basso`,
              severity: 'medium'
            });
          }
        }
      }
    }

    // === APY VALIDATION ===
    if (apy !== undefined) {
      if (apy <= 0) {
        errors.push({
          field: 'apy',
          message: 'APY deve essere maggiore di 0'
        });
      } else if (apy > 1000) {
        errors.push({
          field: 'apy',
          message: 'APY non può superare 1000% (valore irrealistico)'
        });
      } else if (durationDays) {
        const expected = getApyExpectation(durationDays);
        
        if (apy < expected.min) {
          warnings.push({
            field: 'apy',
            message: `APY ${apy.toFixed(0)}% basso per ${durationDays}D (tipico: ${expected.typical}%)`,
            severity: 'medium'
          });
        } else if (apy > expected.max) {
          warnings.push({
            field: 'apy',
            message: `APY ${apy.toFixed(0)}% molto alto per ${durationDays}D - verifica i dati`,
            severity: 'high'
          });
        }
      }
    }

    // === PREMIUM VALIDATION ===
    if (premium !== undefined) {
      if (premium <= 0) {
        errors.push({
          field: 'premium',
          message: 'Il premium deve essere maggiore di 0'
        });
      } else if (capital && apy && durationDays) {
        // Calculate expected premium: capital * (apy/100) * (durationDays/365)
        const expectedPremium = capital * (apy / 100) * (durationDays / 365);
        const deviation = Math.abs(premium - expectedPremium) / expectedPremium;
        
        if (deviation > 0.1) {
          warnings.push({
            field: 'premium',
            message: `Premium inserito ($${premium.toFixed(2)}) differisce del ${(deviation * 100).toFixed(0)}% dal calcolato ($${expectedPremium.toFixed(2)})`,
            severity: 'medium'
          });
        }
      }
    }

    // === CAPITAL VALIDATION ===
    if (capital !== undefined) {
      if (capital <= 0) {
        errors.push({
          field: 'capital',
          message: 'Il capitale deve essere maggiore di 0'
        });
      } else if (capital < 100) {
        errors.push({
          field: 'capital',
          message: 'Capitale minimo richiesto: $100 (limite Pionex)'
        });
      } else if (capital > 100000) {
        warnings.push({
          field: 'capital',
          message: `Capitale elevato: $${capital.toLocaleString()} - conferma l'importo`,
          severity: 'low'
        });
      }
    }

    // === EXPIRATION DATE VALIDATION ===
    if (expirationDate) {
      const expDate = new Date(expirationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + 30);

      if (expDate < today) {
        errors.push({
          field: 'expirationDate',
          message: 'La data di scadenza non può essere nel passato'
        });
      } else if (expDate > maxDate) {
        errors.push({
          field: 'expirationDate',
          message: 'Scadenza massima: 30 giorni da oggi'
        });
      } else {
        const dayOfWeek = expDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          warnings.push({
            field: 'expirationDate',
            message: 'Scadenza nel weekend - verifica orari di settlement',
            severity: 'low'
          });
        }
      }
    }

    const hasHighWarnings = warnings.some(w => w.severity === 'high');

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
      hasHighWarnings
    };
  }, [data, btcPrice]);
}

// === SETTLEMENT CONSISTENCY UTILITY ===
export interface SettlementConsistencyResult {
  consistent: boolean;
  expectedAssignment: boolean;
  message: string;
}

export function validateSettlementConsistency(
  strike: number,
  settlementPrice: number,
  userSaidAssigned: boolean,
  optionType: 'SELL_PUT' | 'COVERED_CALL'
): SettlementConsistencyResult {
  let expectedAssignment: boolean;
  let reason: string;

  if (optionType === 'SELL_PUT') {
    // PUT is assigned when settlement price <= strike
    expectedAssignment = settlementPrice <= strike;
    reason = expectedAssignment
      ? `BTC ($${settlementPrice.toLocaleString()}) ≤ Strike ($${strike.toLocaleString()})`
      : `BTC ($${settlementPrice.toLocaleString()}) > Strike ($${strike.toLocaleString()})`;
  } else {
    // CALL is assigned when settlement price >= strike
    expectedAssignment = settlementPrice >= strike;
    reason = expectedAssignment
      ? `BTC ($${settlementPrice.toLocaleString()}) ≥ Strike ($${strike.toLocaleString()})`
      : `BTC ($${settlementPrice.toLocaleString()}) < Strike ($${strike.toLocaleString()})`;
  }

  const consistent = expectedAssignment === userSaidAssigned;

  let message: string;
  if (consistent) {
    message = userSaidAssigned
      ? `✓ Assegnazione corretta: ${reason}`
      : `✓ Non assegnato corretto: ${reason}`;
  } else {
    const expected = expectedAssignment ? 'ASSEGNATO' : 'NON ASSEGNATO';
    const userSaid = userSaidAssigned ? 'assegnato' : 'non assegnato';
    message = `⚠️ Inconsistenza: ${reason} → dovrebbe essere ${expected}, ma hai indicato ${userSaid}`;
  }

  return {
    consistent,
    expectedAssignment,
    message
  };
}
