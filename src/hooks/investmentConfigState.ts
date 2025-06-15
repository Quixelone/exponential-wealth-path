
import { useState, useCallback } from 'react';
import { InvestmentConfig } from '@/types/investment';

// Stato di default configurazione investimento
export const getDefaultConfig = (): InvestmentConfig => ({
  initialCapital: 1000,
  timeHorizon: 1000,
  dailyReturnRate: 0.2,
  pacConfig: {
    amount: 100,
    frequency: 'weekly',
    startDate: new Date() // <-- sempre oggi
  }
});

export const useInvestmentConfigState = () => {
  const [config, setConfig] = useState<InvestmentConfig>(getDefaultConfig());
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
      pacConfig: { ...getDefaultConfig().pacConfig, startDate: new Date() }, // aggiorna anche startDate
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
