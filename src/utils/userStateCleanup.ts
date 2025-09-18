/**
 * @fileoverview Utilities per la pulizia dello stato utente
 * Gestisce la rimozione di dati obsoleti dal localStorage e reset dello stato
 */

/**
 * Chiavi del localStorage utilizzate dall'applicazione
 */
export const STORAGE_KEYS = {
  CURRENT_CONFIG_ID: 'investment_current_config_id',
  CURRENT_CONFIG_NAME: 'investment_current_config_name',
  CONFIGURATION_HISTORY: 'investment_configuration_history',
} as const;

/**
 * Pulisce completamente lo stato utente dal localStorage
 * Utilizzata quando si verifica un'inconsistenza tra localStorage e database
 * 
 * @param reason - Motivo della pulizia per logging
 */
export const clearUserState = (reason: string = 'Manual cleanup'): void => {
  try {
    console.warn(`🧹 Clearing user state from localStorage: ${reason}`);
    
    // Rimuovi tutte le chiavi relative all'investimento
    Object.values(STORAGE_KEYS).forEach(key => {
      const existingValue = localStorage.getItem(key);
      if (existingValue) {
        localStorage.removeItem(key);
        console.debug(`Removed localStorage key: ${key} (previous value: ${existingValue.substring(0, 50)}...)`);
      }
    });
    
    console.info('✅ User state cleared successfully');
  } catch (error) {
    console.error(`❌ Failed to clear user state: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Pulisce solo i riferimenti alla configurazione attiva
 * Mantiene lo storico delle configurazioni
 * 
 * @param reason - Motivo della pulizia per logging
 */
export const clearActiveConfigState = (reason: string = 'Configuration deleted'): void => {
  try {
    console.info(`🔄 Clearing active configuration state: ${reason}`);
    
    localStorage.removeItem(STORAGE_KEYS.CURRENT_CONFIG_ID);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_CONFIG_NAME);
    
    console.info('✅ Active configuration state cleared');
  } catch (error) {
    console.error(`❌ Failed to clear active configuration state: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Verifica se esiste uno stato persistito per l'utente
 * 
 * @returns True se esistono dati persistiti
 */
export const hasPersistedState = (): boolean => {
  try {
    return Object.values(STORAGE_KEYS).some(key => localStorage.getItem(key) !== null);
  } catch {
    return false;
  }
};

/**
 * Ottiene informazioni sullo stato persistito per debugging
 * 
 * @returns Oggetto con le informazioni dello stato persistito
 */
export const getPersistedStateInfo = (): Record<string, string | null> => {
  const info: Record<string, string | null> = {};
  
  try {
    Object.entries(STORAGE_KEYS).forEach(([keyName, storageKey]) => {
      info[keyName] = localStorage.getItem(storageKey);
    });
  } catch (error) {
    console.error(`Failed to get persisted state info: ${error}`);
  }
  
  return info;
};

/**
 * Validazione dello stato del localStorage per identificare inconsistenze
 * 
 * @param availableConfigIds - Lista degli ID delle configurazioni disponibili nel database
 * @returns True se il localStorage è coerente con il database
 */
export const validateLocalStorageState = (availableConfigIds: string[]): boolean => {
  try {
    const currentConfigId = localStorage.getItem(STORAGE_KEYS.CURRENT_CONFIG_ID);
    
    // Se non c'è configurazione attiva, lo stato è valido
    if (!currentConfigId) {
      return true;
    }
    
    // Verifica se la configurazione attiva esiste ancora nel database
    const isValid = availableConfigIds.includes(currentConfigId);
    
    if (!isValid) {
      console.warn(`🚨 localStorage state validation failed: current config ${currentConfigId} not found in available configs [${availableConfigIds.join(', ')}]`);
    }
    
    return isValid;
  } catch (error) {
    console.error(`Failed to validate localStorage state: ${error}`);
    return false;
  }
};