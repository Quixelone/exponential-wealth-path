
import { useMemo } from 'react';
import { InvestmentConfig, InvestmentData } from '@/types/investment';
import { calculateInvestment, getNextPACInfo } from './investmentCalculationUtils';

interface UseInvestmentDataProps {
  config: InvestmentConfig;
  dailyReturns: { [day: number]: number };
  dailyPACOverrides: { [day: number]: number };
}

export const useInvestmentData = ({ config, dailyReturns, dailyPACOverrides }: UseInvestmentDataProps) => {
  // Calcolo investimento
  const investmentData: InvestmentData[] = useMemo(() => {
    return calculateInvestment({
      config,
      dailyReturns,
      dailyPACOverrides
    });
  }, [config, dailyReturns, dailyPACOverrides]);

  // Calcolo del giorno attuale basato sulla data di inizio
  const currentDayIndex = useMemo(() => {
    const startDate = new Date(
      typeof config.pacConfig.startDate === "string"
        ? config.pacConfig.startDate
        : config.pacConfig.startDate
    );
    startDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, Math.min(diffDays, config.timeHorizon));
  }, [config.pacConfig.startDate, config.timeHorizon]);

  // Calcola info prossimo PAC
  const nextPACInfo = useMemo(
    () => getNextPACInfo(config.pacConfig),
    [config.pacConfig]
  );

  // Dati attuali e finali
  const currentData = investmentData[currentDayIndex] || investmentData[0];
  const finalData = investmentData[investmentData.length - 1] || investmentData[0];

  const summary = {
    current: {
      finalCapital: currentData?.finalCapital || 0,
      totalInvested: config.initialCapital + (currentData?.totalPACInvested || 0),
      totalInterest: currentData?.totalInterest || 0,
      totalReturn: currentData 
        ? ((currentData.finalCapital / (config.initialCapital + currentData.totalPACInvested) - 1) * 100)
        : 0,
      day: currentDayIndex
    },
    final: {
      finalCapital: finalData?.finalCapital || 0,
      totalInvested: config.initialCapital + (finalData?.totalPACInvested || 0),
      totalInterest: finalData?.totalInterest || 0,
      totalReturn: finalData
        ? ((finalData.finalCapital / (config.initialCapital + finalData.totalPACInvested) - 1) * 100)
        : 0,
      day: config.timeHorizon
    }
  };

  return {
    investmentData,
    currentDayIndex,
    nextPACInfo,
    summary
  };
};
