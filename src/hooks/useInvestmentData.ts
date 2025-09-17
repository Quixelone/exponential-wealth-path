
/**
 * @fileoverview Hook per il calcolo e la gestione dei dati di investimento
 * 
 * Questo hook si occupa di calcolare in tempo reale tutti i dati relativi agli investimenti,
 * inclusi i valori giornalieri, l'indice del giorno corrente, le informazioni PAC e i riassunti
 * finanziari. Utilizza memoization avanzata per ottimizzare le performance.
 * 
 * @author Wealth Compass Team
 * @version 1.0.0
 */

import { useMemo } from 'react';
import { InvestmentConfig, InvestmentData } from '@/types/investment';
import { calculateInvestment, getNextPACInfo } from './investmentCalculationUtils';
import { generateCacheKey, getCachedCalculation, setCachedCalculation } from '@/utils/optimization';
import { useContextLogger } from '@/utils/logger';
import { handleError } from '@/utils/errorHandler';

/**
 * Proprietà richieste dal hook useInvestmentData
 */
interface UseInvestmentDataProps {
  /** Configurazione dell'investimento */
  config: InvestmentConfig;
  /** Rendimenti personalizzati per giorni specifici */
  dailyReturns: { [day: number]: number };
  /** Override PAC personalizzati per giorni specifici */
  dailyPACOverrides: { [day: number]: number };
}

/**
 * Risultato del calcolo del giorno corrente
 */
interface CurrentDayCalculation {
  /** Indice del giorno corrente basato sulla data di inizio */
  currentDayIndex: number;
  /** Data di inizio normalizzata */
  normalizedStartDate: Date;
  /** Giorni trascorsi dall'inizio */
  daysPassed: number;
}

/**
 * Hook per la gestione e il calcolo dei dati di investimento
 * 
 * Questo hook fornisce tutti i calcoli necessari per visualizzare e analizzare
 * un investimento, con ottimizzazioni di performance attraverso memoization
 * e caching intelligente dei calcoli pesanti.
 * 
 * @param props - Proprietà del hook contenenti configurazione e personalizzazioni
 * @returns Oggetto con tutti i dati di investimento calcolati
 * 
 * @example
 * ```typescript
 * const { investmentData, currentDayIndex, summary } = useInvestmentData({
 *   config: investmentConfig,
 *   dailyReturns: { 100: 0.5, 200: -0.2 },
 *   dailyPACOverrides: { 150: 200 }
 * });
 * ```
 */
export const useInvestmentData = ({ config, dailyReturns, dailyPACOverrides }: UseInvestmentDataProps) => {
  // Logger con contesto specifico
  const contextLogger = useContextLogger('InvestmentData');

  /**
   * Calcolo ottimizzato dei dati di investimento con caching intelligente
   * Utilizza una chiave di cache basata sui parametri per evitare ricalcoli inutili
   */
  const investmentData: InvestmentData[] = useMemo(() => {
    try {
      // Genera chiave per il cache
      const cacheKey = generateCacheKey(config, dailyReturns, dailyPACOverrides);
      
      // Controlla se i dati sono già in cache
      const cachedData = getCachedCalculation(cacheKey);
      if (cachedData) {
        contextLogger.debug('Using cached investment calculation', { cacheKey });
        return cachedData;
      }

      // Calcola i nuovi dati
      contextLogger.debug('Calculating investment data', {
        timeHorizon: config.timeHorizon,
        dailyReturnsCount: Object.keys(dailyReturns).length,
        pacOverridesCount: Object.keys(dailyPACOverrides).length
      });

      const calculatedData = calculateInvestment({
        config,
        dailyReturns,
        dailyPACOverrides
      });

      // Salva nel cache
      setCachedCalculation(cacheKey, calculatedData);
      
      contextLogger.debug('Investment calculation completed', {
        dataPoints: calculatedData.length,
        finalCapital: calculatedData[calculatedData.length - 1]?.finalCapital
      });

      return calculatedData;
    } catch (error) {
      handleError(error, 'Investment Data Calculation', {
        showToast: false,
        logError: true
      });
      return []; // Fallback sicuro in caso di errore
    }
  }, [config, dailyReturns, dailyPACOverrides, contextLogger]);

  /**
   * Calcolo ottimizzato del giorno corrente basato sulla data di inizio
   * Include validazione e normalizzazione delle date per evitare problemi di timezone
   */
  const currentDayCalculation: CurrentDayCalculation = useMemo(() => {
    try {
      // Normalizza la data di inizio a mezzanotte
      const startDate = new Date(
        typeof config.pacConfig.startDate === "string"
          ? config.pacConfig.startDate
          : config.pacConfig.startDate
      );
      startDate.setHours(0, 0, 0, 0);
      
      // Normalizza la data corrente a mezzanotte
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Calcola la differenza in giorni
      const diffTime = today.getTime() - startDate.getTime();
      const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // Assicura che l'indice sia nei limiti validi
      const currentDayIndex = Math.max(0, Math.min(daysPassed, config.timeHorizon - 1));
      
      return {
        currentDayIndex,
        normalizedStartDate: startDate,
        daysPassed
      };
    } catch (error) {
      contextLogger.error('Failed to calculate current day', error);
      return {
        currentDayIndex: 0,
        normalizedStartDate: new Date(),
        daysPassed: 0
      };
    }
  }, [config.pacConfig.startDate, config.timeHorizon, contextLogger]);

  // Estrae l'indice del giorno corrente dal calcolo
  const currentDayIndex = currentDayCalculation.currentDayIndex;

  /**
   * Calcolo ottimizzato delle informazioni del prossimo PAC
   * Memoizzato per evitare ricalcoli quando la configurazione PAC non cambia
   */
  const nextPACInfo = useMemo(() => {
    try {
      return getNextPACInfo(config.pacConfig);
    } catch (error) {
      return handleError(error, 'Next PAC Info Calculation', {
        fallbackValue: null,
        showToast: false,
        logError: true
      });
    }
  }, [config.pacConfig]);

  /**
   * Calcolo ottimizzato dei dati attuali e finali con gestione sicura degli indici
   * Include validazione per evitare accessi fuori dai limiti dell'array
   */
  const { currentData, finalData } = useMemo(() => {
    try {
      // Validazione degli indici per evitare errori
      const safeCurrentIndex = Math.max(0, Math.min(currentDayIndex, investmentData.length - 1));
      const safeFinalIndex = Math.max(0, investmentData.length - 1);
      
      const current = investmentData[safeCurrentIndex] || investmentData[0];
      const final = investmentData[safeFinalIndex] || investmentData[0];
      
      return {
        currentData: current,
        finalData: final
      };
    } catch (error) {
      contextLogger.error('Failed to extract current/final data', error);
      return {
        currentData: null,
        finalData: null
      };
    }
  }, [investmentData, currentDayIndex, contextLogger]);

  /**
   * Calcolo ottimizzato del sommario finanziario con gestione degli errori
   * Include metriche per lo stato attuale e finale dell'investimento
   */
  const summary = useMemo(() => {
    try {
      // Calcoli sicuri per lo stato attuale
      const currentFinalCapital = currentData?.finalCapital || 0;
      const currentTotalInvested = config.initialCapital + (currentData?.totalPACInvested || 0);
      const currentTotalInterest = currentData?.totalInterest || 0;
      const currentTotalReturn = currentTotalInvested > 0
        ? ((currentFinalCapital / currentTotalInvested - 1) * 100)
        : 0;

      // Calcoli sicuri per lo stato finale
      const finalFinalCapital = finalData?.finalCapital || 0;
      const finalTotalInvested = config.initialCapital + (finalData?.totalPACInvested || 0);
      const finalTotalInterest = finalData?.totalInterest || 0;
      const finalTotalReturn = finalTotalInvested > 0
        ? ((finalFinalCapital / finalTotalInvested - 1) * 100)
        : 0;

      return {
        current: {
          finalCapital: currentFinalCapital,
          totalInvested: currentTotalInvested,
          totalInterest: currentTotalInterest,
          totalReturn: currentTotalReturn,
          day: currentDayIndex
        },
        final: {
          finalCapital: finalFinalCapital,
          totalInvested: finalTotalInvested,
          totalInterest: finalTotalInterest,
          totalReturn: finalTotalReturn,
          day: config.timeHorizon
        }
      };
    } catch (error) {
      contextLogger.error('Failed to calculate summary', error);
      // Ritorna un sommario vuoto sicuro in caso di errore
      return {
        current: {
          finalCapital: 0,
          totalInvested: config.initialCapital,
          totalInterest: 0,
          totalReturn: 0,
          day: currentDayIndex
        },
        final: {
          finalCapital: 0,
          totalInvested: config.initialCapital,
          totalInterest: 0,
          totalReturn: 0,
          day: config.timeHorizon
        }
      };
    }
  }, [currentData, finalData, config.initialCapital, config.timeHorizon, currentDayIndex, contextLogger]);

  /**
   * Ritorna tutti i dati calcolati in un oggetto ottimizzato
   * Memoizzato per evitare re-render inutili nei componenti consumer
   */
  return useMemo(() => ({
    /** Dati di investimento giornalieri completi */
    investmentData,
    /** Indice del giorno corrente nell'investimento */
    currentDayIndex,
    /** Informazioni sul prossimo pagamento PAC */
    nextPACInfo,
    /** Riassunto finanziario con dati attuali e finali */
    summary
  }), [investmentData, currentDayIndex, nextPACInfo, summary]);
};
