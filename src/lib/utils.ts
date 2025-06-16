
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type Currency = 'EUR' | 'USD' | 'USDT';

// Mappa dei simboli per ogni valuta
const currencySymbols: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
  USDT: '₮'
};

// Mappa delle configurazioni locali per ogni valuta
const currencyLocales: Record<Currency, string> = {
  EUR: 'it-IT',
  USD: 'en-US',
  USDT: 'en-US'
};

// Central utility for formatting currency with support for multiple currencies
export function formatCurrency(
  value: number,
  currency: Currency = 'EUR',
  options?: { decimals?: number }
): string {
  const locale = currencyLocales[currency];
  const symbol = currencySymbols[currency];
  
  // Per USDT usiamo un formato personalizzato dato che non è una valuta ISO standard
  if (currency === 'USDT') {
    return `${symbol}${new Intl.NumberFormat(locale, {
      minimumFractionDigits: options?.decimals ?? 2,
      maximumFractionDigits: options?.decimals ?? 2,
      useGrouping: true,
    }).format(value)}`;
  }
  
  // Per EUR e USD usiamo il formato standard Intl
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: options?.decimals ?? 2,
    maximumFractionDigits: options?.decimals ?? 2,
    useGrouping: true,
  }).format(value);
}

// Utility function to format whole numbers as currency (no decimals)
export function formatCurrencyWhole(value: number, currency: Currency = 'EUR'): string {
  return formatCurrency(value, currency, { decimals: 0 });
}

// Utility per ottenere il simbolo della valuta
export function getCurrencySymbol(currency: Currency): string {
  return currencySymbols[currency];
}
