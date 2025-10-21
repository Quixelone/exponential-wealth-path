import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { PACPayment, PACPaymentStats, CreatePACPaymentData, ExecutePACPaymentData } from '@/types/pac-payments';
import { InvestmentConfig } from '@/types/investment';
import { addDays, differenceInDays, format } from 'date-fns';

export const usePACPayments = (configId?: string) => {
  const [payments, setPayments] = useState<PACPayment[]>([]);
  const [stats, setStats] = useState<PACPaymentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load payments for a specific config
  const loadPayments = async (id: string) => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from('pac_payments')
        .select('*')
        .eq('config_id', id)
        .order('scheduled_date', { ascending: true });

      if (dbError) throw dbError;

      setPayments(data || []);
      calculateStats(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nel caricamento dei versamenti';
      setError(errorMessage);
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate scheduled payments based on config
  const generateScheduledPayments = async (config: InvestmentConfig & { id: string }) => {
    try {
      setLoading(true);

      // First, clear existing payments for this config
      await supabase
        .from('pac_payments')
        .delete()
        .eq('config_id', config.id);

      const payments: CreatePACPaymentData[] = [];
      const startDate = new Date(config.pacConfig.startDate);
      
      let currentDate = startDate;
      let dayCounter = 1;

      // Generate payments based on frequency and time horizon
      while (dayCounter <= config.timeHorizon) {
        let shouldAddPayment = false;

        switch (config.pacConfig.frequency) {
          case 'daily':
            shouldAddPayment = true;
            currentDate = addDays(startDate, dayCounter - 1);
            break;
          case 'weekly':
            shouldAddPayment = dayCounter % 7 === 1;
            currentDate = addDays(startDate, dayCounter - 1);
            break;
          case 'monthly':
            shouldAddPayment = dayCounter % 30 === 1;
            currentDate = addDays(startDate, dayCounter - 1);
            break;
          case 'custom':
            shouldAddPayment = config.pacConfig.customDays ? dayCounter % config.pacConfig.customDays === 1 : false;
            currentDate = addDays(startDate, dayCounter - 1);
            break;
        }

        if (shouldAddPayment) {
          payments.push({
            config_id: config.id,
            scheduled_date: format(currentDate, 'yyyy-MM-dd'),
            scheduled_amount: config.pacConfig.amount,
          });
        }

        dayCounter++;
      }

      // Insert all payments
      const { error: insertError } = await supabase
        .from('pac_payments')
        .insert(payments);

      if (insertError) throw insertError;

      toast({
        title: "Versamenti Generati",
        description: `Generati ${payments.length} versamenti programmati`,
      });

      // Reload payments
      await loadPayments(config.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nella generazione dei versamenti';
      setError(errorMessage);
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mark payment as executed
  const executePayment = async (paymentId: string, executionData: ExecutePACPaymentData) => {
    try {
      setLoading(true);

      const { error: updateError } = await supabase
        .from('pac_payments')
        .update({
          is_executed: true,
          executed_date: executionData.executed_date,
          executed_amount: executionData.executed_amount,
          execution_notes: executionData.execution_notes,
          payment_method: executionData.payment_method,
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      toast({
        title: "Versamento Registrato",
        description: "Il versamento è stato marcato come eseguito",
      });

      // Reload payments for current config
      if (configId) {
        await loadPayments(configId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nella registrazione del versamento';
      setError(errorMessage);
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mark payment as not executed
  const undoExecution = async (paymentId: string) => {
    try {
      setLoading(true);

      const { error: updateError } = await supabase
        .from('pac_payments')
        .update({
          is_executed: false,
          executed_date: null,
          executed_amount: null,
          execution_notes: null,
          payment_method: null,
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      toast({
        title: "Esecuzione Annullata",
        description: "Il versamento è stato rimarcato come non eseguito",
      });

      // Reload payments for current config
      if (configId) {
        await loadPayments(configId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nell\'annullamento dell\'esecuzione';
      setError(errorMessage);
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (paymentsData: PACPayment[]) => {
    const today = new Date();
    
    const executed = paymentsData.filter(p => p.is_executed);
    const scheduled = paymentsData.filter(p => !p.is_executed);
    const overdue = scheduled.filter(p => new Date(p.scheduled_date) < today);

    const totalAmountScheduled = paymentsData.reduce((sum, p) => sum + Number(p.scheduled_amount), 0);
    const totalAmountExecuted = executed.reduce((sum, p) => sum + Number(p.executed_amount || 0), 0);

    const stats: PACPaymentStats = {
      totalScheduled: paymentsData.length,
      totalExecuted: executed.length,
      executedCount: executed.length,
      scheduledCount: scheduled.length,
      executionRate: paymentsData.length > 0 ? (executed.length / paymentsData.length) * 100 : 0,
      totalAmountScheduled,
      totalAmountExecuted,
      overduePayments: overdue.length,
    };

    setStats(stats);
  };

  // Load payments when configId changes
  useEffect(() => {
    if (configId) {
      loadPayments(configId);
    }
  }, [configId]);

  // Create or update PAC payment (for sync with checkbox UI)
  const createOrUpdatePACPayment = async (
    configId: string,
    scheduledDate: string,
    scheduledAmount: number,
    isExecuted: boolean,
    executedAmount?: number
  ) => {
    try {
      setLoading(true);

      // Check if payment already exists
      const { data: existing, error: fetchError } = await supabase
        .from('pac_payments')
        .select('*')
        .eq('config_id', configId)
        .eq('scheduled_date', scheduledDate)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existing) {
        // Update existing payment
        const { error: updateError } = await supabase
          .from('pac_payments')
          .update({
            is_executed: isExecuted,
            executed_date: isExecuted ? format(new Date(), 'yyyy-MM-dd') : null,
            executed_amount: isExecuted ? (executedAmount || scheduledAmount) : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        // Create new payment
        const { error: insertError } = await supabase
          .from('pac_payments')
          .insert({
            config_id: configId,
            scheduled_date: scheduledDate,
            scheduled_amount: scheduledAmount,
            is_executed: isExecuted,
            executed_date: isExecuted ? format(new Date(), 'yyyy-MM-dd') : null,
            executed_amount: isExecuted ? (executedAmount || scheduledAmount) : null,
          });

        if (insertError) throw insertError;
      }

      // Reload payments
      if (configId) {
        await loadPayments(configId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore nella sincronizzazione del versamento';
      setError(errorMessage);
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    payments,
    stats,
    loading,
    error,
    loadPayments,
    generateScheduledPayments,
    executePayment,
    undoExecution,
    createOrUpdatePACPayment,
  };
};