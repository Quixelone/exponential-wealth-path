
import { InvestmentConfig, InvestmentData, PACConfig } from '@/types/investment';

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

  for (let day = 0; day <= config.timeHorizon; day++) {
    const currentDate = new Date(config.pacConfig.startDate);
    currentDate.setDate(currentDate.getDate() + day);

    const capitalBeforePAC = currentCapital;

    // Use custom PAC amount if set for this day, else default logic
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

    // Calculate interest earned for the day
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
