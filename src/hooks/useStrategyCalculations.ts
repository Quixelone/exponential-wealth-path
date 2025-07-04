import { useMemo } from 'react';
import { StrategyConfig, StrategyData } from '@/types/strategy';

export const useStrategyCalculations = (
  config: StrategyConfig,
  dailyReturns: { [day: number]: number },
  dailyPACOverrides: { [day: number]: number }
) => {
  const strategyData = useMemo((): StrategyData[] => {
    const data: StrategyData[] = [];
    let currentCapital = config.initialCapital;
    let totalPACInvested = 0;
    let totalInterest = 0;

    for (let day = 1; day <= config.timeHorizon; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day - 1);

      // Determina l'ammontare PAC per questo giorno
      let pacAmount = 0;
      const hasCustomPAC = dailyPACOverrides[day] !== undefined;
      
      if (hasCustomPAC) {
        pacAmount = dailyPACOverrides[day];
      } else {
        // Calcola PAC in base alla frequenza
        const daysSinceStart = day - 1;
        const startDate = config.pacConfig.startDate;
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + daysSinceStart);

        switch (config.pacConfig.frequency) {
          case 'daily':
            pacAmount = config.pacConfig.amount;
            break;
          case 'weekly':
            if (currentDate.getDay() === startDate.getDay()) {
              pacAmount = config.pacConfig.amount;
            }
            break;
          case 'monthly':
            if (currentDate.getDate() === startDate.getDate()) {
              pacAmount = config.pacConfig.amount;
            }
            break;
          case 'custom':
            if (config.pacConfig.customDays && daysSinceStart % config.pacConfig.customDays === 0) {
              pacAmount = config.pacConfig.amount;
            }
            break;
        }
      }

      const capitalBeforePAC = currentCapital;
      const capitalAfterPAC = currentCapital + pacAmount;
      totalPACInvested += pacAmount;

      // Determina il tasso di rendimento per questo giorno
      const hasCustomReturn = dailyReturns[day] !== undefined;
      const dailyReturn = hasCustomReturn ? dailyReturns[day] : config.dailyReturnRate;
      
      // Calcola gli interessi
      const interestEarnedDaily = (capitalAfterPAC * dailyReturn) / 100;
      totalInterest += interestEarnedDaily;
      
      // Aggiorna il capitale
      currentCapital = capitalAfterPAC + interestEarnedDaily;

      data.push({
        day,
        date: date.toLocaleDateString('it-IT'),
        capitalBeforePAC,
        pacAmount,
        capitalAfterPAC,
        dailyReturn,
        interestEarnedDaily,
        finalCapital: currentCapital,
        totalPACInvested,
        totalInterest,
        isCustomReturn: hasCustomReturn,
        isCustomPAC: hasCustomPAC,
      });
    }

    return data;
  }, [config, dailyReturns, dailyPACOverrides]);

  const summary = useMemo(() => {
    if (strategyData.length === 0) return null;
    
    const lastDay = strategyData[strategyData.length - 1];
    return {
      finalCapital: lastDay.finalCapital,
      totalInvested: config.initialCapital + lastDay.totalPACInvested,
      totalProfit: lastDay.finalCapital - (config.initialCapital + lastDay.totalPACInvested),
      totalPACInvested: lastDay.totalPACInvested,
      totalInterest: lastDay.totalInterest,
      profitPercentage: ((lastDay.finalCapital - (config.initialCapital + lastDay.totalPACInvested)) / (config.initialCapital + lastDay.totalPACInvested)) * 100,
    };
  }, [strategyData, config.initialCapital]);

  const currentDayIndex = useMemo(() => {
    const today = new Date();
    const startDate = config.pacConfig.startDate;
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(diffDays, config.timeHorizon);
  }, [config.pacConfig.startDate, config.timeHorizon]);

  const nextPACInfo = useMemo(() => {
    for (let day = currentDayIndex + 1; day <= config.timeHorizon; day++) {
      let pacAmount = 0;
      const daysSinceStart = day - 1;
      const startDate = config.pacConfig.startDate;
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + daysSinceStart);

      if (dailyPACOverrides[day] !== undefined) {
        pacAmount = dailyPACOverrides[day];
      } else {
        switch (config.pacConfig.frequency) {
          case 'daily':
            pacAmount = config.pacConfig.amount;
            break;
          case 'weekly':
            if (currentDate.getDay() === startDate.getDay()) {
              pacAmount = config.pacConfig.amount;
            }
            break;
          case 'monthly':
            if (currentDate.getDate() === startDate.getDate()) {
              pacAmount = config.pacConfig.amount;
            }
            break;
          case 'custom':
            if (config.pacConfig.customDays && daysSinceStart % config.pacConfig.customDays === 0) {
              pacAmount = config.pacConfig.amount;
            }
            break;
        }
      }

      if (pacAmount > 0) {
        return {
          day,
          date: currentDate.toLocaleDateString('it-IT'),
          amount: pacAmount,
        };
      }
    }
    return null;
  }, [config, dailyPACOverrides, currentDayIndex]);

  return {
    strategyData,
    summary,
    currentDayIndex,
    nextPACInfo,
  };
};