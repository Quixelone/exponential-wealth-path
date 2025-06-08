
import { useState, useMemo, useCallback } from 'react';
import { InvestmentConfig, InvestmentData, PACConfig } from '@/types/investment';

export const useInvestmentCalculator = () => {
  const [config, setConfig] = useState<InvestmentConfig>({
    initialCapital: 10000,
    timeHorizon: 1000,
    dailyReturnRate: 0.2, // 0.2% giornaliero
    pacConfig: {
      amount: 100,
      frequency: 'weekly',
      startDate: new Date()
    }
  });

  const [dailyReturns, setDailyReturns] = useState<{ [day: number]: number }>({});

  const isPACDay = useCallback((day: number, pacConfig: PACConfig): boolean => {
    switch (pacConfig.frequency) {
      case 'daily':
        return true;
      case 'weekly':
        return day % 7 === 0;
      case 'monthly':
        return day % 30 === 0;
      case 'custom':
        return pacConfig.customDays ? day % pacConfig.customDays === 0 : false;
      default:
        return false;
    }
  }, []);

  const calculateInvestment = useMemo((): InvestmentData[] => {
    const results: InvestmentData[] = [];
    let currentCapital = config.initialCapital;
    let totalPACInvested = 0;

    for (let day = 0; day <= config.timeHorizon; day++) {
      const currentDate = new Date(config.pacConfig.startDate);
      currentDate.setDate(currentDate.getDate() + day);

      const capitalBeforePAC = currentCapital;
      
      // Aggiungi PAC se è il giorno giusto
      const pacAmount = isPACDay(day, config.pacConfig) ? config.pacConfig.amount : 0;
      currentCapital += pacAmount;
      totalPACInvested += pacAmount;

      const capitalAfterPAC = currentCapital;

      // Applica il rendimento giornaliero (custom o standard)
      const dailyReturn = dailyReturns[day] ?? config.dailyReturnRate;
      const interestGained = currentCapital * (dailyReturn / 100);
      currentCapital += interestGained;

      const totalInterest = currentCapital - config.initialCapital - totalPACInvested;

      results.push({
        day,
        date: currentDate.toISOString().split('T')[0],
        capitalBeforePAC,
        pacAmount,
        capitalAfterPAC,
        dailyReturn,
        finalCapital: currentCapital,
        totalPACInvested,
        totalInterest
      });
    }

    return results;
  }, [config, dailyReturns, isPACDay]);

  const updateConfig = useCallback((newConfig: Partial<InvestmentConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const updateDailyReturn = useCallback((day: number, returnRate: number) => {
    setDailyReturns(prev => ({
      ...prev,
      [day]: returnRate
    }));
  }, []);

  const exportToCSV = useCallback(() => {
    const csvContent = [
      ['Giorno', 'Data', 'Capitale Iniziale', 'PAC', 'Capitale Post-PAC', 'Rendimento %', 'Capitale Finale', 'PAC Totale', 'Interessi'],
      ...calculateInvestment.map(row => [
        row.day,
        row.date,
        row.capitalBeforePAC.toFixed(2),
        row.pacAmount.toFixed(2),
        row.capitalAfterPAC.toFixed(2),
        row.dailyReturn.toFixed(4),
        row.finalCapital.toFixed(2),
        row.totalPACInvested.toFixed(2),
        row.totalInterest.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wealth-compass-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }, [calculateInvestment]);

  return {
    config,
    updateConfig,
    investmentData: calculateInvestment,
    updateDailyReturn,
    exportToCSV,
    summary: {
      finalCapital: calculateInvestment[calculateInvestment.length - 1]?.finalCapital || 0,
      totalInvested: config.initialCapital + calculateInvestment[calculateInvestment.length - 1]?.totalPACInvested || 0,
      totalInterest: calculateInvestment[calculateInvestment.length - 1]?.totalInterest || 0,
      totalReturn: ((calculateInvestment[calculateInvestment.length - 1]?.finalCapital || 0) / (config.initialCapital + (calculateInvestment[calculateInvestment.length - 1]?.totalPACInvested || 0)) - 1) * 100
    }
  };
};
