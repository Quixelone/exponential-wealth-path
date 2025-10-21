
import { InvestmentConfig, InvestmentData, PACConfig } from '@/types/investment';

// Calcola se è un giorno di PAC
export const isPACDay = (
  day: number,
  pacConfig: PACConfig
): boolean => {
  switch (pacConfig.frequency) {
    case 'daily':
      return day >= 1;
    case 'weekly':
      return day >= 7 && day % 7 === 0;
    case 'monthly':
      return day >= 30 && day % 30 === 0;
    case 'custom': {
      const customDays = pacConfig.customDays || 10;
      return day >= customDays && day % customDays === 0;
    }
    default:
      return false;
  }
};

interface CalculateInvestmentParams {
  config: InvestmentConfig;
  dailyReturns: { [day: number]: number };
  dailyPACOverrides: { [day: number]: number };
}
export const calculateInvestment = ({
  config,
  dailyReturns,
  dailyPACOverrides,
}: CalculateInvestmentParams): InvestmentData[] => {
  const results: InvestmentData[] = [];
  let currentCapital = config.initialCapital;
  let totalPACInvested = 0;
  // startDate deve essere la data di oggi per day 0
  const baseDate = new Date(
    typeof config.pacConfig.startDate === "string"
      ? config.pacConfig.startDate
      : config.pacConfig.startDate
  );
  baseDate.setHours(0, 0, 0, 0); // elimina possibili problemi di ora

  for (let day = 0; day <= config.timeHorizon; day++) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(baseDate.getDate() + day);
    // Deve essere sempre dalla baseDate

    const capitalBeforePAC = currentCapital;

    let pacAmount = 0;
    let isCustomPAC = false;
    if (dailyPACOverrides.hasOwnProperty(day)) {
      pacAmount = dailyPACOverrides[day];
      isCustomPAC = true;
    } else if (isPACDay(day, config.pacConfig)) {
      pacAmount = config.pacConfig.amount;
    }
    currentCapital += pacAmount;
    totalPACInvested += pacAmount;

    const capitalAfterPAC = currentCapital;

    const dailyReturn = dailyReturns[day] ?? config.dailyReturnRate;
    const isCustomReturn = dailyReturns.hasOwnProperty(day);

    const interestEarnedDaily = capitalAfterPAC * (dailyReturn / 100);
    currentCapital += interestEarnedDaily;

    const totalInterest = currentCapital - config.initialCapital - totalPACInvested;

    results.push({
      day,
      date: currentDate.toISOString().split('T')[0],
      capitalBeforePAC,
      pacAmount,
      capitalAfterPAC,
      dailyReturn,
      interestEarnedDaily,
      finalCapital: currentCapital,
      totalPACInvested,
      totalInterest,
      isCustomReturn,
      isCustomPAC,
    });
  }

  return results;
};

// Calcola investimento usando versamenti PAC reali registrati
interface CalculateInvestmentWithRealPaymentsParams {
  config: InvestmentConfig;
  dailyReturns: { [day: number]: number };
  realPayments: Array<{
    executed_date: string;
    executed_amount: number;
  }>;
}

export const calculateInvestmentWithRealPayments = ({
  config,
  dailyReturns,
  realPayments,
}: CalculateInvestmentWithRealPaymentsParams): InvestmentData[] => {
  const results: InvestmentData[] = [];
  let currentCapital = config.initialCapital;
  let totalPACInvested = 0;
  
  const baseDate = new Date(
    typeof config.pacConfig.startDate === "string"
      ? config.pacConfig.startDate
      : config.pacConfig.startDate
  );
  baseDate.setHours(0, 0, 0, 0);

  // Crea mappa dei versamenti per data
  const paymentsByDate = new Map<string, number>();
  realPayments.forEach(payment => {
    const dateKey = payment.executed_date;
    paymentsByDate.set(dateKey, (paymentsByDate.get(dateKey) || 0) + payment.executed_amount);
  });

  for (let day = 0; day <= config.timeHorizon; day++) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(baseDate.getDate() + day);
    const dateKey = currentDate.toISOString().split('T')[0];

    const capitalBeforePAC = currentCapital;

    // Usa i versamenti reali se disponibili per questa data
    const pacAmount = paymentsByDate.get(dateKey) || 0;
    const isCustomPAC = pacAmount > 0;
    
    currentCapital += pacAmount;
    totalPACInvested += pacAmount;

    const capitalAfterPAC = currentCapital;

    const dailyReturn = dailyReturns[day] ?? config.dailyReturnRate;
    const isCustomReturn = dailyReturns.hasOwnProperty(day);

    const interestEarnedDaily = capitalAfterPAC * (dailyReturn / 100);
    currentCapital += interestEarnedDaily;

    const totalInterest = currentCapital - config.initialCapital - totalPACInvested;

    results.push({
      day,
      date: dateKey,
      capitalBeforePAC,
      pacAmount,
      capitalAfterPAC,
      dailyReturn,
      interestEarnedDaily,
      finalCapital: currentCapital,
      totalPACInvested,
      totalInterest,
      isCustomReturn,
      isCustomPAC, // Indica che è un versamento reale
    });
  }

  return results;
};

// Mostra info su prossimo PAC:
export const getNextPACInfo = (pacConfig: PACConfig) => {
  const { frequency, customDays } = pacConfig;
  let nextPACDay = 0;
  let description = '';
  switch (frequency) {
    case 'daily':
      nextPACDay = 1;
      description = 'Il primo versamento PAC avverrà dal giorno 1';
      break;
    case 'weekly':
      nextPACDay = 7;
      description = 'Il primo versamento PAC avverrà al giorno 7, poi ogni settimana';
      break;
    case 'monthly':
      nextPACDay = 30;
      description = 'Il primo versamento PAC avverrà al giorno 30, poi ogni mese';
      break;
    case 'custom':
      nextPACDay = customDays || 10;
      description = `Il primo versamento PAC avverrà al giorno ${nextPACDay}, poi ogni ${nextPACDay} giorni`;
      break;
    default:
      description = '';
  }
  return { nextPACDay, description };
};
