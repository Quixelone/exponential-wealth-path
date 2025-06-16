
import { useState, useCallback } from 'react';
import { InvestmentConfig } from '@/types/investment';
import { Currency } from '@/lib/utils';

// Stato di default configurazione investimento
export const getDefaultConfig = (): InvestmentConfig & { currency: Currency } => ({
  initialCapital: 1000,
  timeHorizon: 1000,
  dailyReturnRate: 0.2,
  currency: 'EUR' as Currency,
  pacConfig: {
    amount: 100,
    frequency: 'weekly',
    startDate: new Date(), // Sempre oggi
  }
});

export const useInvestmentConfigState = () => {
  const [config, setConfig] = useState<InvestmentConfig & { currency: Currency }>(getDefaultConfig());
  const [dailyReturns, setDailyReturns] = useState<{ [day: number]: number }>({});
  const [dailyPACOverrides, setDailyPACOverrides] = useState<{ [day: number]: number }>({});
  const [currentConfigId, setCurrentConfigId] = useState<string | null>(null);
  const [currentConfigName, setCurrentConfigName] = useState<string>('');

  // Resetta completamente i dati personalizzati
  const resetCustomData = useCallback(() => {
    setDailyReturns({});
    setDailyPACOverrides({});
  }, []);

  // Quando vuoi azzerare tutto e ripartire da 0
  const createNewConfiguration = useCallback(() => {
    resetCustomData();
    setCurrentConfigId(null);
    setCurrentConfigName('');
    setConfig({
      ...getDefaultConfig(),
      pacConfig: { ...getDefaultConfig().pacConfig, startDate: new Date() }, // startDate sempre oggi
    });
  }, [resetCustomData]);

  return {
    configState: { config, dailyReturns, dailyPACOverrides, currentConfigId, currentConfigName },
    setConfig,
    setDailyReturns,
    setDailyPACOverrides,
    setCurrentConfigId,
    setCurrentConfigName,
    createNewConfiguration,
    resetCustomData,
  };
};
