/**
 * @fileoverview Sistema di logging centralizzato e strutturato
 * Fornisce un sistema di logging unificato per tutta l'applicazione
 * con diversi livelli di logging e formattazione consistente
 * 
 * @author Wealth Compass Team
 * @version 1.0.0
 */

/**
 * Livelli di logging disponibili
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

/**
 * Interfaccia per le entry di log
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: any;
  error?: Error;
}

/**
 * Configurazione del logger
 */
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStoredLogs: number;
  timestampFormat: 'ISO' | 'locale';
}

/**
 * Configurazione di default del logger
 */
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: LogLevel.INFO,
  enableConsole: true,
  enableStorage: false,
  maxStoredLogs: 1000,
  timestampFormat: 'ISO'
};

/**
 * Storage interno per i log
 */
const logStorage: LogEntry[] = [];

/**
 * Configurazione corrente del logger
 */
let currentConfig: LoggerConfig = { ...DEFAULT_CONFIG };

/**
 * Emoji per i diversi livelli di log
 */
const LOG_EMOJIS = {
  [LogLevel.DEBUG]: '🔍',
  [LogLevel.INFO]: 'ℹ️',
  [LogLevel.WARN]: '⚠️',
  [LogLevel.ERROR]: '❌',
  [LogLevel.CRITICAL]: '🚨'
};

/**
 * Colori console per i diversi livelli
 */
const LOG_COLORS = {
  [LogLevel.DEBUG]: 'color: #6B7280',
  [LogLevel.INFO]: 'color: #3B82F6',
  [LogLevel.WARN]: 'color: #F59E0B',
  [LogLevel.ERROR]: 'color: #EF4444',
  [LogLevel.CRITICAL]: 'color: #DC2626; font-weight: bold'
};

/**
 * Formatta un timestamp secondo la configurazione
 * 
 * @param date - Data da formattare
 * @returns Timestamp formattato
 */
const formatTimestamp = (date: Date): string => {
  try {
    return currentConfig.timestampFormat === 'ISO' 
      ? date.toISOString()
      : date.toLocaleString('it-IT');
  } catch (error) {
    return date.toString();
  }
};

/**
 * Formatta un messaggio di log per la console
 * 
 * @param entry - Entry di log da formattare
 * @returns Array con messaggio formattato e stile
 */
const formatConsoleMessage = (entry: LogEntry): [string, string] => {
  const emoji = LOG_EMOJIS[entry.level];
  const timestamp = formatTimestamp(entry.timestamp);
  const context = entry.context ? `[${entry.context}]` : '';
  const color = LOG_COLORS[entry.level];
  
  const message = `${emoji} ${timestamp} ${context} ${entry.message}`;
  
  return [message, color];
};

/**
 * Aggiunge un log allo storage interno
 * 
 * @param entry - Entry di log da aggiungere
 */
const addToStorage = (entry: LogEntry): void => {
  if (!currentConfig.enableStorage) return;
  
  try {
    logStorage.push(entry);
    
    // Mantiene solo gli ultimi N log
    if (logStorage.length > currentConfig.maxStoredLogs) {
      logStorage.shift();
    }
  } catch (error) {
    console.warn('Failed to add log to storage:', error);
  }
};

/**
 * Funzione di logging generica
 * 
 * @param level - Livello di log
 * @param message - Messaggio di log
 * @param context - Contesto opzionale
 * @param data - Dati aggiuntivi opzionali
 * @param error - Errore opzionale
 */
const log = (
  level: LogLevel,
  message: string,
  context?: string,
  data?: any,
  error?: Error
): void => {
  // Filtra per livello minimo
  if (level < currentConfig.minLevel) return;
  
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date(),
    context,
    data,
    error
  };
  
  // Aggiunge allo storage
  addToStorage(entry);
  
  // Log su console se abilitato
  if (currentConfig.enableConsole) {
    try {
      const [formattedMessage, style] = formatConsoleMessage(entry);
      
      // Seleziona il metodo console appropriato
      const consoleMethod = {
        [LogLevel.DEBUG]: console.debug,
        [LogLevel.INFO]: console.info,
        [LogLevel.WARN]: console.warn,
        [LogLevel.ERROR]: console.error,
        [LogLevel.CRITICAL]: console.error
      }[level];
      
      // Log del messaggio principale
      consoleMethod(`%c${formattedMessage}`, style);
      
      // Log dei dati aggiuntivi se presenti
      if (data !== undefined) {
        console.log('Data:', data);
      }
      
      // Log dell'errore se presente
      if (error) {
        console.error('Error:', error);
      }
    } catch (err) {
      // Fallback se il logging fallisce
      console.log(`[LOGGER ERROR] ${message}`, { data, error: err });
    }
  }
};

/**
 * Logger principale con metodi di convenienza
 */
export const logger = {
  /**
   * Configura il logger
   * 
   * @param config - Nuova configurazione
   */
  configure: (config: Partial<LoggerConfig>): void => {
    currentConfig = { ...currentConfig, ...config };
  },
  
  /**
   * Log di debug (solo per sviluppo)
   * 
   * @param message - Messaggio
   * @param context - Contesto opzionale
   * @param data - Dati opzionali
   */
  debug: (message: string, context?: string, data?: any): void => {
    log(LogLevel.DEBUG, message, context, data);
  },
  
  /**
   * Log informativo
   * 
   * @param message - Messaggio
   * @param context - Contesto opzionale
   * @param data - Dati opzionali
   */
  info: (message: string, context?: string, data?: any): void => {
    log(LogLevel.INFO, message, context, data);
  },
  
  /**
   * Log di warning
   * 
   * @param message - Messaggio
   * @param context - Contesto opzionale
   * @param data - Dati opzionali
   */
  warn: (message: string, context?: string, data?: any): void => {
    log(LogLevel.WARN, message, context, data);
  },
  
  /**
   * Log di errore
   * 
   * @param message - Messaggio
   * @param context - Contesto opzionale
   * @param error - Errore
   * @param data - Dati opzionali
   */
  error: (message: string, context?: string, error?: Error, data?: any): void => {
    log(LogLevel.ERROR, message, context, data, error);
  },
  
  /**
   * Log critico
   * 
   * @param message - Messaggio
   * @param context - Contesto opzionale
   * @param error - Errore
   * @param data - Dati opzionali
   */
  critical: (message: string, context?: string, error?: Error, data?: any): void => {
    log(LogLevel.CRITICAL, message, context, data, error);
  },
  
  /**
   * Recupera tutti i log memorizzati
   * 
   * @returns Array di log entry
   */
  getLogs: (): LogEntry[] => {
    return [...logStorage];
  },
  
  /**
   * Filtra i log per livello
   * 
   * @param level - Livello minimo
   * @returns Log filtrati
   */
  getLogsByLevel: (level: LogLevel): LogEntry[] => {
    return logStorage.filter(entry => entry.level >= level);
  },
  
  /**
   * Pulisce tutti i log memorizzati
   */
  clearLogs: (): void => {
    logStorage.length = 0;
  },
  
  /**
   * Esporta i log come JSON
   * 
   * @returns Stringa JSON dei log
   */
  exportLogs: (): string => {
    try {
      return JSON.stringify(logStorage, null, 2);
    } catch (error) {
      logger.error('Failed to export logs', 'Logger', error);
      return '[]';
    }
  }
};

/**
 * Hook per logging in contesti specifici
 * 
 * @param context - Contesto del logger
 * @returns Logger con contesto predefinito
 */
export const useContextLogger = (context: string) => {
  return {
    debug: (message: string, data?: any) => logger.debug(message, context, data),
    info: (message: string, data?: any) => logger.info(message, context, data),
    warn: (message: string, data?: any) => logger.warn(message, context, data),
    error: (message: string, error?: Error, data?: any) => logger.error(message, context, error, data),
    critical: (message: string, error?: Error, data?: any) => logger.critical(message, context, error, data)
  };
};

/**
 * Timer utility per misurare performance
 * 
 * @param label - Etichetta del timer
 * @returns Funzione per terminare il timer
 */
export const createTimer = (label: string): (() => void) => {
  const startTime = performance.now();
  logger.debug(`Timer started: ${label}`, 'Performance');
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    logger.info(`Timer ${label}: ${duration.toFixed(2)}ms`, 'Performance', { duration });
  };
};

// Configura il logger in modalità sviluppo
if (process.env.NODE_ENV === 'development') {
  logger.configure({
    minLevel: LogLevel.DEBUG,
    enableStorage: true
  });
}