
export interface InvestmentData {
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
  isCustomPAC?: boolean; // FIX: Added property for custom PAC editing
}

export interface PACConfig {
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  customDays?: number;
  startDate: Date;
}

// New: Record for editing PAC per day
export type DailyPACOverrides = { [day: number]: number };

export interface InvestmentConfig {
  initialCapital: number;
  timeHorizon: number; // giorni
  dailyReturnRate: number; // percentuale giornaliera
  pacConfig: PACConfig;
}

export interface ScenarioComparison {
  optimistic: InvestmentData[];
  realistic: InvestmentData[];
  pessimistic: InvestmentData[];
}

export interface DailyReturnEntry {
  day: number;
  returnRate: number;
  date: string;
}
