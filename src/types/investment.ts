
export interface InvestmentData {
  day: number;
  date: string;
  capitalBeforePAC: number;
  pacAmount: number;
  capitalAfterPAC: number;
  dailyReturn: number;
  finalCapital: number;
  totalPACInvested: number;
  totalInterest: number;
}

export interface PACConfig {
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  customDays?: number;
  startDate: Date;
}

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
