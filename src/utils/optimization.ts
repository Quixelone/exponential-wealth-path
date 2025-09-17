/**
 * @fileoverview Utility per ottimizzazioni delle performance e calcoli
 * Contiene funzioni ottimizzate per operazioni comuni nel sistema di investimento
 * 
 * @author Wealth Compass Team
 * @version 1.0.0
 */

import { InvestmentConfig, InvestmentData } from '@/types/investment';

/**
 * Cache per i calcoli di investimento per evitare ricalcoli inutili
 */
const calculationCache = new Map<string, InvestmentData[]>();
const CACHE_SIZE_LIMIT = 50;

/**
 * Genera una chiave univoca per il cache basata sui parametri di input
 * 
 * @param config - Configurazione dell'investimento
 * @param dailyReturns - Rendimenti giornalieri personalizzati
 * @param dailyPACOverrides - Override PAC personalizzati
 * @returns Chiave hash per il cache
 */
export const generateCacheKey = (
  config: InvestmentConfig,
  dailyReturns: { [day: number]: number },
  dailyPACOverrides: { [day: number]: number }
): string => {
  try {
    const configKey = JSON.stringify({
      initialCapital: config.initialCapital,
      timeHorizon: config.timeHorizon,
      dailyReturnRate: config.dailyReturnRate,
      pacConfig: {
        amount: config.pacConfig.amount,
        frequency: config.pacConfig.frequency,
        startDate: typeof config.pacConfig.startDate === 'string' 
          ? config.pacConfig.startDate 
          : config.pacConfig.startDate.toISOString().split('T')[0]
      }
    });
    
    const returnsKey = JSON.stringify(dailyReturns);
    const overridesKey = JSON.stringify(dailyPACOverrides);
    
    return `${configKey}-${returnsKey}-${overridesKey}`;
  } catch (error) {
    console.warn('⚠️ Cache key generation failed:', error);
    return `fallback-${Date.now()}-${Math.random()}`;
  }
};

/**
 * Gestisce il cache dei calcoli con limite di dimensione
 * 
 * @param key - Chiave del cache
 * @param data - Dati da memorizzare
 */
export const setCachedCalculation = (key: string, data: InvestmentData[]): void => {
  try {
    // Pulisce il cache se supera il limite
    if (calculationCache.size >= CACHE_SIZE_LIMIT) {
      const firstKey = calculationCache.keys().next().value;
      if (firstKey) {
        calculationCache.delete(firstKey);
      }
    }
    
    calculationCache.set(key, data);
  } catch (error) {
    console.warn('⚠️ Cache set failed:', error);
  }
};

/**
 * Recupera i dati dal cache se disponibili
 * 
 * @param key - Chiave del cache
 * @returns Dati cached o null se non disponibili
 */
export const getCachedCalculation = (key: string): InvestmentData[] | null => {
  try {
    return calculationCache.get(key) || null;
  } catch (error) {
    console.warn('⚠️ Cache get failed:', error);
    return null;
  }
};

/**
 * Pulisce completamente il cache dei calcoli
 */
export const clearCalculationCache = (): void => {
  try {
    calculationCache.clear();
    console.log('🧹 Calculation cache cleared');
  } catch (error) {
    console.warn('⚠️ Cache clear failed:', error);
  }
};

/**
 * Debounce function per ottimizzare le chiamate frequenti
 * 
 * @param func - Funzione da eseguire con debounce
 * @param wait - Tempo di attesa in millisecondi
 * @returns Funzione con debounce applicato
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function per limitare l'esecuzione di funzioni
 * 
 * @param func - Funzione da limitare
 * @param limit - Limite di tempo in millisecondi
 * @returns Funzione con throttle applicato
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Confronto profondo ottimizzato per oggetti semplici
 * Utilizza JSON.stringify per performance migliori su oggetti piccoli
 * 
 * @param a - Primo oggetto da confrontare
 * @param b - Secondo oggetto da confrontare
 * @returns True se gli oggetti sono uguali
 */
export const deepEqual = (a: any, b: any): boolean => {
  try {
    // Quick reference check
    if (a === b) return true;
    
    // Null/undefined check
    if (a == null || b == null) return a === b;
    
    // Type check
    if (typeof a !== typeof b) return false;
    
    // For objects, use JSON stringify for performance
    if (typeof a === 'object') {
      return JSON.stringify(a) === JSON.stringify(b);
    }
    
    return a === b;
  } catch (error) {
    console.warn('⚠️ Deep equal comparison failed:', error);
    return false;
  }
};

/**
 * Validatore per configurazioni di investimento
 * 
 * @param config - Configurazione da validare
 * @returns Oggetto con risultato validazione ed eventuali errori
 */
export const validateInvestmentConfig = (config: InvestmentConfig): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  try {
    // Validazione capitale iniziale
    if (!config.initialCapital || config.initialCapital <= 0) {
      errors.push('Il capitale iniziale deve essere maggiore di 0');
    }
    
    if (config.initialCapital > 10000000) {
      errors.push('Il capitale iniziale non può superare i 10 milioni');
    }
    
    // Validazione orizzonte temporale
    if (!config.timeHorizon || config.timeHorizon <= 0) {
      errors.push('L\'orizzonte temporale deve essere maggiore di 0');
    }
    
    if (config.timeHorizon > 36500) { // 100 anni
      errors.push('L\'orizzonte temporale non può superare i 100 anni');
    }
    
    // Validazione tasso di rendimento
    if (config.dailyReturnRate == null) {
      errors.push('Il tasso di rendimento giornaliero è obbligatorio');
    }
    
    if (config.dailyReturnRate < -50) {
      errors.push('Il tasso di rendimento non può essere inferiore a -50%');
    }
    
    if (config.dailyReturnRate > 50) {
      errors.push('Il tasso di rendimento non può essere superiore a 50%');
    }
    
    // Validazione PAC
    if (config.pacConfig) {
      if (!config.pacConfig.amount || config.pacConfig.amount <= 0) {
        errors.push('L\'importo PAC deve essere maggiore di 0');
      }
      
      if (config.pacConfig.amount > 1000000) {
        errors.push('L\'importo PAC non può superare 1 milione');
      }
      
      if (!config.pacConfig.frequency) {
        errors.push('La frequenza PAC è obbligatoria');
      }
      
      if (!config.pacConfig.startDate) {
        errors.push('La data di inizio PAC è obbligatoria');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    console.error('❌ Validation failed:', error);
    return {
      isValid: false,
      errors: ['Errore durante la validazione della configurazione']
    };
  }
};

/**
 * Formattatore per valute con ottimizzazioni
 * 
 * @param amount - Importo da formattare
 * @param currency - Valuta da utilizzare
 * @param locale - Locale per la formattazione
 * @returns Stringa formattata
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'EUR',
  locale: string = 'it-IT'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.warn('⚠️ Currency formatting failed:', error);
    return `${amount.toFixed(2)} ${currency}`;
  }
};

/**
 * Formattatore per percentuali
 * 
 * @param value - Valore da formattare come percentuale
 * @param decimals - Numero di decimali
 * @returns Stringa formattata
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  try {
    return `${value.toFixed(decimals)}%`;
  } catch (error) {
    console.warn('⚠️ Percentage formatting failed:', error);
    return `${value}%`;
  }
};