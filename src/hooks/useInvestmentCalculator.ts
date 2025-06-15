import React from 'react';
import { useMemo, useCallback } from 'react';
import { InvestmentConfig, InvestmentData } from '@/types/investment';
import { useSupabaseConfig } from '@/hooks/useSupabaseConfig';
import { useInvestmentConfigState, getDefaultConfig } from './investmentConfigState';
import { calculateInvestment, isPACDay, getNextPACInfo } from './investmentCalculationUtils';

// funzione di deep compare (shallow per oggetti semplici)
const deepEqual = (a: any, b: any): boolean => {
  return JSON.stringify(a) === JSON.stringify(b);
};

// Custom hook principale per usare il calcolatore d'investimento e tutte le sue API
export const useInvestmentCalculator = () => {
  const {
    configState,
    setConfig,
    setDailyReturns,
    setDailyPACOverrides,
    setCurrentConfigId,
    setCurrentConfigName,
    createNewConfiguration,
    resetCustomData,
  } = useInvestmentConfigState();

  const {
    loading: supabaseLoading,
    savedConfigs,
    saveConfiguration,
    updateConfiguration,
    loadConfigurations,
    deleteConfiguration
  } = useSupabaseConfig();

  React.useEffect(() => { loadConfigurations(); }, [loadConfigurations]);

  // Calcolo investimento
  const investmentData: InvestmentData[] = useMemo(() => {
    return calculateInvestment({
      config: configState.config,
      dailyReturns: configState.dailyReturns,
      dailyPACOverrides: configState.dailyPACOverrides
    });
  }, [configState.config, configState.dailyReturns, configState.dailyPACOverrides]);

  // Determina configurazione "salvata" attuale
  const savedConfig = React.useMemo(() =>
    configState.currentConfigId
      ? savedConfigs.find(c => c.id === configState.currentConfigId)
      : null,
    [savedConfigs, configState.currentConfigId]
  );

  // True se lo stato corrente differisce dalla versione salvata
  const hasUnsavedChanges = React.useMemo(() => {
    if (!savedConfig) return false;
    const stateToCompare = {
      config: {
        ...configState.config,
        // for deep compare, stringifiy PAC startDate for safety
        pacConfig: {
          ...configState.config.pacConfig,
          startDate: (typeof configState.config.pacConfig.startDate === "string"
            ? configState.config.pacConfig.startDate
            : configState.config.pacConfig.startDate.toISOString().split('T')[0])
        },
      },
      dailyReturns: configState.dailyReturns,
    };
    const savedToCompare = {
      config: {
        ...savedConfig.config,
        pacConfig: {
          ...savedConfig.config.pacConfig,
          startDate: (typeof savedConfig.config.pacConfig.startDate === "string"
            ? savedConfig.config.pacConfig.startDate
            : savedConfig.config.pacConfig.startDate.toISOString().split('T')[0])
        },
      },
      dailyReturns: savedConfig.dailyReturns,
    };
    return !deepEqual(stateToCompare, savedToCompare);
  }, [configState.config, configState.dailyReturns, savedConfig]);

  const updateConfig = useCallback((newConfig: Partial<InvestmentConfig>, reset: boolean = false) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    setCurrentConfigId(null);
    if (
      reset ||
      newConfig.initialCapital !== undefined ||
      newConfig.timeHorizon !== undefined ||
      newConfig.pacConfig?.frequency !== undefined
    ) {
      setDailyReturns({});
      setDailyPACOverrides({});
    }
  }, [setConfig, setDailyReturns, setDailyPACOverrides, setCurrentConfigId]);

  const updateDailyReturn = useCallback((day: number, returnRate: number) => {
    setDailyReturns(prev => ({
      ...prev,
      [day]: returnRate
    }));
    setCurrentConfigId(null);
  }, [setDailyReturns, setCurrentConfigId]);

  const removeDailyReturn = useCallback((day: number) => {
    setDailyReturns(prev => {
      const newReturns = { ...prev };
      delete newReturns[day];
      return newReturns;
    });
    setCurrentConfigId(null);
  }, [setDailyReturns, setCurrentConfigId]);

  const exportToCSV = useCallback(() => {
    const csvContent = [
      ['Giorno', 'Data', 'Capitale Iniziale', 'PAC', 'Capitale Post-PAC', 'Ricavo Giorno', '% Ricavo', 'Custom', 'Capitale Finale', 'PAC Totale', 'Interessi Totali'],
      ...investmentData.map(row => [
        row.day,
        row.date,
        row.capitalBeforePAC.toFixed(2),
        row.pacAmount.toFixed(2),
        row.capitalAfterPAC.toFixed(2),
        row.interestEarnedDaily.toFixed(2),
        row.dailyReturn.toFixed(4),
        row.isCustomReturn ? 'Sì' : 'No',
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
  }, [investmentData]);

  const updatePACForDay = useCallback((day: number, pacAmount: number) => {
    setDailyPACOverrides(prev => ({
      ...prev,
      [day]: pacAmount
    }));
    setCurrentConfigId(null);
  }, [setDailyPACOverrides, setCurrentConfigId]);

  const removePACOverride = useCallback((day: number) => {
    setDailyPACOverrides(prev => {
      const updated = { ...prev };
      delete updated[day];
      return updated;
    });
    setCurrentConfigId(null);
  }, [setDailyPACOverrides, setCurrentConfigId]);

  // Salva una nuova configurazione nelle tabelle
  const saveCurrentConfiguration = useCallback(async (name: string) => {
    const configId = await saveConfiguration(name, configState.config, configState.dailyReturns);
    if (configId) {
      setCurrentConfigId(configId);
      setCurrentConfigName(name);
      loadConfigurations();
    }
  }, [saveConfiguration, configState.config, configState.dailyReturns, setCurrentConfigId, setCurrentConfigName, loadConfigurations]);

  // Aggiorna una configurazione esistente
  const updateCurrentConfiguration = useCallback(async (configId: string, name: string) => {
    const success = await updateConfiguration(configId, name, configState.config, configState.dailyReturns);
    if (success) {
      setCurrentConfigId(configId);
      setCurrentConfigName(name);
      loadConfigurations();
    }
  }, [updateConfiguration, configState.config, configState.dailyReturns, setCurrentConfigId, setCurrentConfigName, loadConfigurations]);

  // Carica config salvata da DB
  const loadSavedConfiguration = useCallback((savedConfig: any) => {
    setConfig(savedConfig.config);
    setDailyReturns(savedConfig.dailyReturns);
    setDailyPACOverrides({});
    setCurrentConfigId(savedConfig.id);
    setCurrentConfigName(savedConfig.name);
  }, [setConfig, setDailyReturns, setDailyPACOverrides, setCurrentConfigId, setCurrentConfigName]);

  // Calcola info prossimo PAC
  const nextPACInfo = useMemo(
    () => getNextPACInfo(configState.config.pacConfig),
    [configState.config.pacConfig]
  );

  return {
    config: configState.config,
    updateConfig,
    createNewConfiguration,
    investmentData,
    dailyReturns: configState.dailyReturns,
    updateDailyReturn,
    removeDailyReturn,
    exportToCSV,
    dailyPACOverrides: configState.dailyPACOverrides,
    updatePACForDay,
    removePACOverride,
    currentConfigId: configState.currentConfigId,
    currentConfigName: configState.currentConfigName,
    savedConfigs,
    saveCurrentConfiguration,
    updateCurrentConfiguration,
    loadSavedConfiguration,
    deleteConfiguration,
    supabaseLoading,
    getNextPACInfo: () => nextPACInfo,
    hasUnsavedChanges,
    summary: {
      finalCapital: investmentData[investmentData.length - 1]?.finalCapital || 0,
      totalInvested:
        configState.config.initialCapital +
        (investmentData[investmentData.length - 1]?.totalPACInvested || 0),
      totalInterest: investmentData[investmentData.length - 1]?.totalInterest || 0,
      totalReturn:
        ((investmentData[investmentData.length - 1]?.finalCapital || 0) /
          (configState.config.initialCapital +
            (investmentData[investmentData.length - 1]?.totalPACInvested || 0)) -
          1) *
          100 || 0,
    }
  };
};
