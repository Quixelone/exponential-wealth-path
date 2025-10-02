export const formatCurrency = (value: number, currency: 'EUR' | 'USD' | 'USDT' = 'EUR'): string => {
  const currencySymbols = {
    EUR: '€',
    USD: '$',
    USDT: 'USDT',
  };

  const formatted = new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return `${formatted} ${currencySymbols[currency]}`;
};
