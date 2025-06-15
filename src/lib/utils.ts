import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Central utility for formatting currency in Italian style
export function formatCurrency(
  value: number,
  options?: { decimals?: number }
): string {
  // Use "it-IT" locale and force grouping/decimal
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: options?.decimals ?? 2,
    maximumFractionDigits: options?.decimals ?? 2,
    useGrouping: true,
  }).format(value)
}

// Utility function to format whole numbers as currency (no decimals)
export function formatCurrencyWhole(value: number): string {
  // Explicitly force 0 decimals
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(value)
}
