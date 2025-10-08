
/**
 * @fileoverview Hook principale per il calcolatore di investimenti
 * 
 * Questo hook orchestrale fornisce un'API completa per gestire calcoli di investimento,
 * configurazioni, persistenza dei dati e cronologia delle modifiche. Rappresenta il punto
 * di ingresso principale per tutte le operazioni relative agli investimenti.
 * 
 * @author Wealth Compass Team
 * @version 1.0.0
 */

import React, { useRef, useMemo, useCallback } from 'react';
import { useConfigurationManager } from './useConfigurationManager';
import { useInvestmentData } from './useInvestmentData';
import { useInvestmentOperations } from './useInvestmentOperations';
import { usePersistedConfigLoader } from './usePersistedConfigLoader';
import { useAuth } from '@/contexts/AuthContext';
import { logger, useContextLogger } from '@/utils/logger';
import { handleError, safeAsync } from '@/utils/errorHandler';

/**
 * Hook principale per il sistema di calcolo degli investimenti
 * 
 * Questo hook coordina tutti gli aspetti del sistema di investimento:
 * - Gestione delle configurazioni e persistenza
 * - Calcoli di investimento in tempo reale
 * - Operazioni su rendimenti e PAC personalizzati
 * - Cronologia delle modifiche con undo/redo
 * - Caricamento e salvataggio su Supabase
 * 
 * @returns {Object} API completa del calcolatore di investimenti
 * 
 * @example
 * ```typescript
 * const {
 *   config,
 *   updateConfig,
 *   investmentData,
 *   saveCurrentConfiguration,
 *   undoConfiguration
 * } = useInvestmentCalculator();
 * 
 * // Aggiorna configurazione
 * updateConfig({ initialCapital: 5000 });
 * 
 * // Salva configurazione
 * await saveCurrentConfiguration('La mia strategia');
 * ```
 */
export const useInvestmentCalculator = () => {
  // Logger con contesto specifico per questo hook
  const contextLogger = useContextLogger('InvestmentCalculator');
  
  // Stato di autenticazione
  const { user, loading: authLoading } = useAuth();
  
  // Manager delle configurazioni con tutte le operazioni CRUD e cronologia
  const {
    configState,
    setConfig,
    setDailyReturns,
    setDailyPACOverrides,
    setCurrentConfigId,
    setCurrentConfigName,
    createNewConfiguration,
    supabaseLoading,
    savedConfigs,
    loadConfigurations,
    deleteConfiguration,
    loadSavedConfiguration,
    hasUnsavedChanges,
    saveCurrentConfiguration,
    updateCurrentConfiguration,
    // History operations
    saveConfigurationToHistory,
    undoConfiguration,
    redoConfiguration,
    canUndo,
    canRedo,
    clearHistory,
    getCurrentSnapshot,
  } = useConfigurationManager();

  // Ref per evitare caricamenti multipli delle configurazioni
  const loadInitialized = useRef(false);

  /**
   * Carica le configurazioni salvate una sola volta al mount, dopo l'autenticazione
   * Include gestione degli errori e creazione automatica di una strategia di esempio
   */
  React.useEffect(() => {
    if (!loadInitialized.current && !authLoading && user) {
      loadInitialized.current = true;
      contextLogger.info('User authenticated, loading configurations', { userId: user.id });
      
      // Caricamento safe delle configurazioni con gestione errori
      safeAsync(
        () => loadConfigurations(),
        'Load Configurations',
        {
          fallbackValue: undefined,
          showToast: true,
          logError: true
        }
      ).then(() => {
        // Crea strategia di esempio se necessario (con leggero delay per evitare race conditions)
        setTimeout(() => {
          if (savedConfigs.length === 0 && !configState.currentConfigId) {
            contextLogger.info('Creating example strategy since no saved configs exist');
            createNewConfiguration();
          }
        }, 100);
      });
    }
  }, [
    loadConfigurations, 
    authLoading, 
    user, 
    savedConfigs.length, 
    configState.currentConfigId, 
    createNewConfiguration,
    contextLogger
  ]);

  /**
   * Utilizza il loader delle configurazioni persistenti per ripristinare
   * l'ultima strategia selezionata dall'utente
   */
  const { persistedConfigLoadAttempted } = usePersistedConfigLoader({
    savedConfigs,
    currentConfigId: configState.currentConfigId,
    supabaseLoading,
    loadSavedConfiguration,
    setCurrentConfigId,
    setCurrentConfigName
  });

  /**
   * Logging dello stato corrente per debugging e monitoraggio
   * Solo quando i dati sono completamente caricati
   */
  React.useEffect(() => {
    if (!supabaseLoading && savedConfigs.length > 0) {
      contextLogger.debug('Current calculator state', {
        currentConfigId: configState.currentConfigId,
        currentConfigName: configState.currentConfigName,
        savedConfigsCount: savedConfigs.length,
        persistedConfigLoadAttempted,
        loadInitialized: loadInitialized.current,
        hasUnsavedChanges
      });
    }
  }, [
    configState.currentConfigId, 
    configState.currentConfigName, 
    savedConfigs.length, 
    supabaseLoading, 
    persistedConfigLoadAttempted,
    hasUnsavedChanges,
    contextLogger
  ]);

  /**
   * Hook per i calcoli di investimento con memoization ottimizzata
   * Calcola automaticamente dati di investimento, indice giorno corrente,
   * informazioni PAC e sommari finanziari
   */
  const { investmentData, currentDayIndex, nextPACInfo, summary } = useInvestmentData({
    config: configState.config,
    dailyReturns: configState.dailyReturns,
    dailyPACOverrides: configState.dailyPACOverrides
  });

  /**
   * Hook per le operazioni di modifica dei dati di investimento
   * Fornisce funzioni ottimizzate per aggiornare configurazioni,
   * rendimenti giornalieri, PAC personalizzati ed esportazione
   */
  const {
    updateConfig,
    updateDailyReturn,
    removeDailyReturn,
    updatePACForDay,
    removePACOverride,
    exportToCSV
  } = useInvestmentOperations({
    configState,
    setConfig,
    setDailyReturns,
    setDailyPACOverrides,
    setCurrentConfigId,
    investmentData,
    saveConfigurationToHistory,
    updateCurrentConfiguration,
    saveCurrentConfiguration
  });

  /**
   * Funzione memoizzata per ottenere informazioni sul prossimo PAC
   * Evita ricalcoli inutili quando i dati PAC non cambiano
   */
  const getNextPACInfo = useCallback(() => {
    try {
      return nextPACInfo;
    } catch (error) {
      handleError(error, 'Get Next PAC Info', { 
        fallbackValue: null, 
        showToast: false 
      });
      return null;
    }
  }, [nextPACInfo]);

  /**
   * API pubblica del calcolatore di investimenti
   * Tutte le funzioni e dati necessari per gestire il sistema di investimento
   */
  return useMemo(() => ({
    // Configurazione corrente e operazioni di modifica
    config: configState.config,
    updateConfig,
    createNewConfiguration,
    
    // Dati di investimento calcolati
    investmentData,
    currentDayIndex,
    summary,
    
    // Rendimenti personalizzati
    dailyReturns: configState.dailyReturns,
    updateDailyReturn,
    removeDailyReturn,
    
    // PAC personalizzati
    dailyPACOverrides: configState.dailyPACOverrides,
    updatePACForDay,
    removePACOverride,
    getNextPACInfo,
    
    // Gestione configurazioni salvate
    currentConfigId: configState.currentConfigId,
    currentConfigName: configState.currentConfigName,
    savedConfigs,
    saveCurrentConfiguration,
    updateCurrentConfiguration,
    loadSavedConfiguration,
    deleteConfiguration,
    
    // Stati di caricamento e modifiche
    supabaseLoading,
    hasUnsavedChanges,
    
    // Operazioni di cronologia (undo/redo)
    undoConfiguration,
    redoConfiguration,
    canUndo,
    canRedo,
    clearHistory,
    getCurrentSnapshot,
    
    // Utilità
    exportToCSV
  }), [
    // Dipendenze per memoization ottimizzata
    configState.config,
    configState.dailyReturns,
    configState.dailyPACOverrides,
    configState.currentConfigId,
    configState.currentConfigName,
    investmentData,
    currentDayIndex,
    summary,
    savedConfigs,
    supabaseLoading,
    hasUnsavedChanges,
    canUndo,
    canRedo,
    // Funzioni stabili
    updateConfig,
    createNewConfiguration,
    updateDailyReturn,
    removeDailyReturn,
    updatePACForDay,
    removePACOverride,
    getNextPACInfo,
    saveCurrentConfiguration,
    updateCurrentConfiguration,
    loadSavedConfiguration,
    deleteConfiguration,
    undoConfiguration,
    redoConfiguration,
    clearHistory,
    getCurrentSnapshot,
    exportToCSV
  ]);
};
