
import { useState, useCallback, useRef } from 'react';
import { InvestmentConfig } from '@/types/investment';

interface ConfigurationSnapshot {
  id: string;
  timestamp: Date;
  config: InvestmentConfig;
  dailyReturns: { [day: number]: number };
  dailyPACOverrides: { [day: number]: number };
  description: string;
}

const MAX_HISTORY_SIZE = 15;

export const useConfigurationHistory = () => {
  const [history, setHistory] = useState<ConfigurationSnapshot[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const snapshotIdCounter = useRef(0);

  const createSnapshot = useCallback((
    config: InvestmentConfig,
    dailyReturns: { [day: number]: number },
    dailyPACOverrides: { [day: number]: number },
    description: string
  ): ConfigurationSnapshot => {
    return {
      id: `snapshot_${++snapshotIdCounter.current}`,
      timestamp: new Date(),
      config: { ...config },
      dailyReturns: { ...dailyReturns },
      dailyPACOverrides: { ...dailyPACOverrides },
      description
    };
  }, []);

  const saveToHistory = useCallback((
    config: InvestmentConfig,
    dailyReturns: { [day: number]: number },
    dailyPACOverrides: { [day: number]: number },
    description: string = 'Modifica configurazione'
  ) => {
    const snapshot = createSnapshot(config, dailyReturns, dailyPACOverrides, description);
    
    setHistory(prev => {
      // Rimuovi tutto quello che viene dopo l'indice corrente (per gestire redo dopo undo)
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(snapshot);
      
      // Mantieni solo gli ultimi MAX_HISTORY_SIZE elementi
      if (newHistory.length > MAX_HISTORY_SIZE) {
        return newHistory.slice(-MAX_HISTORY_SIZE);
      }
      
      return newHistory;
    });
    
    setCurrentIndex(prev => {
      const newIndex = Math.min(prev + 1, MAX_HISTORY_SIZE - 1);
      return newIndex;
    });

    console.log('💾 Saved configuration snapshot:', description);
  }, [createSnapshot, currentIndex]);

  const canUndo = history.length > 0 && currentIndex > 0;
  const canRedo = history.length > 0 && currentIndex < history.length - 1;

  const undo = useCallback((): ConfigurationSnapshot | null => {
    if (!canUndo) return null;
    
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    const snapshot = history[newIndex];
    
    console.log('↩️ Undo to snapshot:', snapshot.description, 'at', snapshot.timestamp);
    return snapshot;
  }, [canUndo, currentIndex, history]);

  const redo = useCallback((): ConfigurationSnapshot | null => {
    if (!canRedo) return null;
    
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    const snapshot = history[newIndex];
    
    console.log('↪️ Redo to snapshot:', snapshot.description, 'at', snapshot.timestamp);
    return snapshot;
  }, [canRedo, currentIndex, history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
    console.log('🗑️ Configuration history cleared');
  }, []);

  const getCurrentSnapshot = useCallback((): ConfigurationSnapshot | null => {
    if (currentIndex >= 0 && currentIndex < history.length) {
      return history[currentIndex];
    }
    return null;
  }, [history, currentIndex]);

  return {
    saveToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    getCurrentSnapshot,
    historySize: history.length,
    currentIndex
  };
};
