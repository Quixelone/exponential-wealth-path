export type BrokerName = 'pionex' | 'bybit' | 'binance' | 'bitget' | 'kucoin' | 'bingx';

export type ConnectionStatus = 'connected' | 'error' | 'never_synced';

export type SyncFrequency = 'realtime' | 'hourly' | 'daily';

export interface BrokerConnection {
  id: string;
  user_id: string;
  broker_name: BrokerName;
  api_key: string;
  api_secret: string;
  api_passphrase?: string | null;
  is_active: boolean;
  last_sync_date?: string | null;
  connection_status: ConnectionStatus;
  last_error_message?: string | null;
  auto_sync_enabled: boolean;
  sync_frequency: SyncFrequency;
  created_at: string;
  updated_at: string;
}

export interface BrokerInfo {
  name: BrokerName;
  displayName: string;
  description: string;
  icon: string;
  requiresPassphrase: boolean;
  rateLimit: number;
  apiDocsUrl: string;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  skipped: number;
  errors: number;
  message?: string;
  error?: string;
}

export interface TestConnectionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const BROKER_INFO: Record<BrokerName, BrokerInfo> = {
  pionex: {
    name: 'pionex',
    displayName: 'Pionex',
    description: 'Leading crypto derivatives exchange',
    icon: '🔷',
    requiresPassphrase: false,
    rateLimit: 100,
    apiDocsUrl: 'https://pionex-doc.gitbook.io/apidocs/',
  },
  bybit: {
    name: 'bybit',
    displayName: 'Bybit',
    description: 'Advanced crypto trading platform',
    icon: '🟡',
    requiresPassphrase: false,
    rateLimit: 120,
    apiDocsUrl: 'https://bybit-exchange.github.io/docs/',
  },
  binance: {
    name: 'binance',
    displayName: 'Binance',
    description: 'World\'s leading crypto exchange',
    icon: '🟨',
    requiresPassphrase: false,
    rateLimit: 1200,
    apiDocsUrl: 'https://binance-docs.github.io/apidocs/',
  },
  bitget: {
    name: 'bitget',
    displayName: 'Bitget',
    description: 'Global crypto trading platform',
    icon: '🔵',
    requiresPassphrase: false,
    rateLimit: 20,
    apiDocsUrl: 'https://bitgetlimited.github.io/apidoc/',
  },
  kucoin: {
    name: 'kucoin',
    displayName: 'KuCoin',
    description: 'People\'s Exchange',
    icon: '🟢',
    requiresPassphrase: true,
    rateLimit: 100,
    apiDocsUrl: 'https://docs.kucoin.com/',
  },
  bingx: {
    name: 'bingx',
    displayName: 'BingX',
    description: 'Crypto derivatives platform',
    icon: '🔴',
    requiresPassphrase: false,
    rateLimit: 10,
    apiDocsUrl: 'https://bingx-api.github.io/docs/',
  },
};
