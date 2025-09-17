/**
 * @fileoverview Sistema centralizzato per la gestione degli errori
 * Fornisce utilities per gestire, loggare e recuperare dagli errori
 * in modo consistente in tutta l'applicazione
 * 
 * @author Wealth Compass Team
 * @version 1.0.0
 */

import { logger } from './logger';
import { toast } from '@/hooks/use-toast';

/**
 * Tipi di errore riconosciuti dal sistema
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  DATABASE = 'DATABASE',
  CALCULATION = 'CALCULATION',
  STORAGE = 'STORAGE',
  PARSING = 'PARSING',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Severità degli errori
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * Interfaccia per errori strutturati
 */
export interface StructuredError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  context?: string;
  originalError?: Error;
  timestamp: Date;
  recoverable: boolean;
  retryable: boolean;
  metadata?: Record<string, any>;
}

/**
 * Opzioni per la gestione degli errori
 */
interface ErrorHandlingOptions {
  showToast?: boolean;
  logError?: boolean;
  reportError?: boolean;
  fallbackValue?: any;
  retryFn?: () => Promise<any>;
  maxRetries?: number;
}

/**
 * Mappa i codici di errore comuni ai tipi di errore
 */
const ERROR_CODE_MAP: Record<string, ErrorType> = {
  '400': ErrorType.VALIDATION,
  '401': ErrorType.AUTHENTICATION,
  '403': ErrorType.AUTHORIZATION,
  '404': ErrorType.NETWORK,
  '500': ErrorType.DATABASE,
  'NETWORK_ERROR': ErrorType.NETWORK,
  'TIMEOUT': ErrorType.NETWORK,
  'PARSE_ERROR': ErrorType.PARSING,
  'VALIDATION_ERROR': ErrorType.VALIDATION,
  'AUTH_ERROR': ErrorType.AUTHENTICATION,
  'DB_ERROR': ErrorType.DATABASE,
  'CALC_ERROR': ErrorType.CALCULATION,
  'STORAGE_ERROR': ErrorType.STORAGE
};

/**
 * Messaggi utente friendly per i diversi tipi di errore
 */
const USER_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: 'Problemi di connessione. Controlla la tua connessione internet.',
  [ErrorType.VALIDATION]: 'I dati inseriti non sono validi. Controlla i campi e riprova.',
  [ErrorType.AUTHENTICATION]: 'Sessione scaduta. Effettua nuovamente il login.',
  [ErrorType.AUTHORIZATION]: 'Non hai i permessi necessari per questa operazione.',
  [ErrorType.DATABASE]: 'Errore del server. Riprova più tardi.',
  [ErrorType.CALCULATION]: 'Errore nel calcolo. Controlla i parametri inseriti.',
  [ErrorType.STORAGE]: 'Errore nel salvataggio. Riprova più tardi.',
  [ErrorType.PARSING]: 'Errore nell\'elaborazione dei dati.',
  [ErrorType.UNKNOWN]: 'Si è verificato un errore imprevisto. Riprova più tardi.'
};

/**
 * Determina il tipo di errore dall'oggetto Error
 * 
 * @param error - Errore da analizzare
 * @returns Tipo di errore identificato
 */
export const identifyErrorType = (error: any): ErrorType => {
  try {
    // Controlla se l'errore ha un codice specifico
    if (error?.code && ERROR_CODE_MAP[error.code]) {
      return ERROR_CODE_MAP[error.code];
    }
    
    // Controlla il messaggio per parole chiave
    const message = error?.message?.toLowerCase() || '';
    
    if (message.includes('network') || message.includes('fetch')) {
      return ErrorType.NETWORK;
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION;
    }
    
    if (message.includes('auth') || message.includes('unauthorized')) {
      return ErrorType.AUTHENTICATION;
    }
    
    if (message.includes('database') || message.includes('sql')) {
      return ErrorType.DATABASE;
    }
    
    if (message.includes('parse') || message.includes('json')) {
      return ErrorType.PARSING;
    }
    
    // Errori specifici di Supabase
    if (error?.details || error?.hint) {
      return ErrorType.DATABASE;
    }
    
    return ErrorType.UNKNOWN;
  } catch {
    return ErrorType.UNKNOWN;
  }
};

/**
 * Determina la severità dell'errore
 * 
 * @param type - Tipo di errore
 * @param error - Errore originale
 * @returns Severità dell'errore
 */
export const determineSeverity = (type: ErrorType, error: any): ErrorSeverity => {
  switch (type) {
    case ErrorType.AUTHENTICATION:
    case ErrorType.DATABASE:
      return ErrorSeverity.HIGH;
    
    case ErrorType.NETWORK:
    case ErrorType.AUTHORIZATION:
      return ErrorSeverity.MEDIUM;
    
    case ErrorType.VALIDATION:
    case ErrorType.PARSING:
      return ErrorSeverity.LOW;
    
    case ErrorType.CALCULATION:
      return error?.critical ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM;
    
    case ErrorType.STORAGE:
      return ErrorSeverity.MEDIUM;
    
    default:
      return ErrorSeverity.MEDIUM;
  }
};

/**
 * Crea un errore strutturato
 * 
 * @param error - Errore originale
 * @param context - Contesto dell'errore
 * @param customMessage - Messaggio personalizzato
 * @returns Errore strutturato
 */
export const createStructuredError = (
  error: any,
  context?: string,
  customMessage?: string
): StructuredError => {
  const type = identifyErrorType(error);
  const severity = determineSeverity(type, error);
  
  return {
    type,
    severity,
    message: error?.message || 'Unknown error',
    userMessage: customMessage || USER_MESSAGES[type],
    context,
    originalError: error instanceof Error ? error : undefined,
    timestamp: new Date(),
    recoverable: severity !== ErrorSeverity.CRITICAL,
    retryable: [ErrorType.NETWORK, ErrorType.DATABASE].includes(type),
    metadata: {
      code: error?.code,
      status: error?.status,
      details: error?.details
    }
  };
};

/**
 * Gestore principale degli errori
 * 
 * @param error - Errore da gestire
 * @param context - Contesto dell'errore
 * @param options - Opzioni di gestione
 * @returns Errore strutturato
 */
export const handleError = (
  error: any,
  context?: string,
  options: ErrorHandlingOptions = {}
): StructuredError => {
  const {
    showToast = true,
    logError = true,
    reportError = false,
    fallbackValue
  } = options;
  
  const structuredError = createStructuredError(error, context);
  
  // Logging
  if (logError) {
    const logMessage = `Error in ${context || 'unknown context'}: ${structuredError.message}`;
    
    switch (structuredError.severity) {
      case ErrorSeverity.CRITICAL:
        logger.critical(logMessage, context, structuredError.originalError, structuredError.metadata);
        break;
      case ErrorSeverity.HIGH:
        logger.error(logMessage, context, structuredError.originalError, structuredError.metadata);
        break;
      case ErrorSeverity.MEDIUM:
        logger.warn(logMessage, context, structuredError.metadata);
        break;
      case ErrorSeverity.LOW:
        logger.info(logMessage, context, structuredError.metadata);
        break;
    }
  }
  
  // Toast notification
  if (showToast && typeof window !== 'undefined') {
    try {
      toast({
        title: 'Errore',
        description: structuredError.userMessage,
        variant: structuredError.severity === ErrorSeverity.LOW ? 'default' : 'destructive'
      });
    } catch (toastError) {
      logger.warn('Failed to show toast notification', 'ErrorHandler', toastError);
    }
  }
  
  // Error reporting (placeholder per future implementazioni)
  if (reportError && structuredError.severity >= ErrorSeverity.HIGH) {
    // TODO: Implementare reporting errori (Sentry, LogRocket, etc.)
    logger.info('Error reported to monitoring service', 'ErrorHandler', {
      errorId: `${structuredError.timestamp.getTime()}-${Math.random()}`
    });
  }
  
  return structuredError;
};

/**
 * Wrapper per operazioni async con gestione errori automatica
 * 
 * @param operation - Operazione da eseguire
 * @param context - Contesto dell'operazione
 * @param options - Opzioni di gestione errori
 * @returns Risultato dell'operazione o fallback
 */
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  context: string,
  options: ErrorHandlingOptions & { fallbackValue: T }
): Promise<T> => {
  const { maxRetries = 0, retryFn, fallbackValue } = options;
  let attempts = 0;
  
  while (attempts <= maxRetries) {
    try {
      return await operation();
    } catch (error) {
      const structuredError = handleError(error, context, options);
      
      // Se è l'ultimo tentativo o l'errore non è retry-able, ritorna fallback
      if (attempts >= maxRetries || !structuredError.retryable) {
        logger.warn(`Operation failed after ${attempts + 1} attempts, returning fallback`, context);
        return fallbackValue;
      }
      
      // Esegue retry function se presente
      if (retryFn) {
        try {
          await retryFn();
        } catch (retryError) {
          logger.warn('Retry function failed', context, retryError);
        }
      }
      
      attempts++;
      
      // Backoff exponenziale
      const delay = Math.min(1000 * Math.pow(2, attempts), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      logger.info(`Retrying operation (attempt ${attempts + 1}/${maxRetries + 1})`, context);
    }
  }
  
  // Questo non dovrebbe mai essere raggiunto, ma è qui per sicurezza
  return fallbackValue;
};

/**
 * Wrapper per operazioni sincrone con gestione errori
 * 
 * @param operation - Operazione da eseguire
 * @param context - Contesto dell'operazione
 * @param fallbackValue - Valore di fallback
 * @param options - Opzioni di gestione errori
 * @returns Risultato dell'operazione o fallback
 */
export const safeSync = <T>(
  operation: () => T,
  context: string,
  fallbackValue: T,
  options: ErrorHandlingOptions = {}
): T => {
  try {
    return operation();
  } catch (error) {
    handleError(error, context, options);
    return fallbackValue;
  }
};

/**
 * Hook React Error Boundary
 * 
 * @param error - Errore catturato
 * @param errorInfo - Informazioni aggiuntive sull'errore
 */
export const handleReactError = (error: Error, errorInfo: any): void => {
  const structuredError = createStructuredError(error, 'React Error Boundary');
  
  logger.critical('React Error Boundary caught an error', 'React', error, {
    componentStack: errorInfo?.componentStack,
    errorBoundary: true
  });
  
  // Non mostriamo toast per errori React per evitare loop
  // L'Error Boundary dovrebbe gestire la UI
};

/**
 * Utility per validare e gestire errori di input
 * 
 * @param value - Valore da validare
 * @param validator - Funzione di validazione
 * @param fieldName - Nome del campo
 * @returns Risultato della validazione
 */
export const validateField = <T>(
  value: T,
  validator: (value: T) => boolean | string,
  fieldName: string
): { isValid: boolean; error?: StructuredError } => {
  try {
    const result = validator(value);
    
    if (result === true) {
      return { isValid: true };
    }
    
    const errorMessage = typeof result === 'string' ? result : `Invalid ${fieldName}`;
    const error = createStructuredError(
      new Error(errorMessage),
      'Validation',
      `Il campo ${fieldName} non è valido`
    );
    
    return { isValid: false, error };
  } catch (validationError) {
    const error = handleError(validationError, `Validation of ${fieldName}`);
    return { isValid: false, error };
  }
};