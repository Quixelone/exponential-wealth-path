export interface StrategyData {
  day: number;
  date: string;
  capitalBeforePAC: number;
  pacAmount: number;
  capitalAfterPAC: number;
  dailyReturn: number;
  interestEarnedDaily: number;
  finalCapital: number;
  totalPACInvested: number;
  totalInterest: number;
  isCustomReturn?: boolean;
  isCustomPAC?: boolean;
}

export interface PACConfig {
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  customDays?: number;
  startDate: Date;
}

export interface StrategyConfig {
  initialCapital: number;
  timeHorizon: number;
  dailyReturnRate: number;
  currency: 'EUR' | 'USD' | 'USDT';
  pacConfig: PACConfig;
}

export interface Strategy {
  id: string;
  name: string;
  config: StrategyConfig;
  dailyReturns: { [day: number]: number };
  dailyPACOverrides: { [day: number]: number };
  created_at: string;
  updated_at: string;
}

export interface StrategyOperations {
  loading: boolean;
  strategies: Strategy[];
  currentStrategy: Strategy | null;
  saveStrategy: (name: string, config: StrategyConfig, dailyReturns: { [day: number]: number }, dailyPACOverrides: { [day: number]: number }) => Promise<string | null>;
  updateStrategy: (strategyId: string, name: string, config: StrategyConfig, dailyReturns: { [day: number]: number }, dailyPACOverrides: { [day: number]: number }) => Promise<boolean>;
  loadStrategy: (strategy: Strategy) => void;
  deleteStrategy: (strategyId: string) => Promise<void>;
  createNewStrategy: () => void;
}