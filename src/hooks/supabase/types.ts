
import { InvestmentConfig } from '@/types/investment';

export interface SupabaseConfigOperations {
  loading: boolean;
  savedConfigs: any[];
  saveConfiguration: (
    name: string,
    config: InvestmentConfig,
    dailyReturns: { [day: number]: number },
    dailyPACOverrides?: { [day: number]: number }
  ) => Promise<string | null>;
  updateConfiguration: (
    configId: string,
    name: string,
    config: InvestmentConfig,
    dailyReturns: { [day: number]: number },
    dailyPACOverrides?: { [day: number]: number }
  ) => Promise<boolean>;
  loadConfigurations: () => Promise<void>;
  deleteConfiguration: (configId: string) => Promise<void>;
}
