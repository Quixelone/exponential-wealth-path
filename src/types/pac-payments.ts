export interface PACPayment {
  id: string;
  config_id: string;
  scheduled_date: string;
  scheduled_amount: number;
  is_executed: boolean;
  executed_date?: string;
  executed_amount?: number;
  execution_notes?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export interface PACPaymentStats {
  totalScheduled: number;
  totalExecuted: number;
  executedCount: number;
  scheduledCount: number;
  executionRate: number;
  totalAmountScheduled: number;
  totalAmountExecuted: number;
  overduePayments: number;
}

export interface CreatePACPaymentData {
  config_id: string;
  scheduled_date: string;
  scheduled_amount: number;
}

export interface ExecutePACPaymentData {
  executed_date: string;
  executed_amount: number;
  execution_notes?: string;
  payment_method?: string;
}