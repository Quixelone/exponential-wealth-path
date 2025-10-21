import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format, addDays, addWeeks, addMonths, isBefore, isToday, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { InvestmentConfig } from '@/types/investment';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { usePACPayments } from '@/hooks/usePACPayments';

interface PACPayment {
  id: string;
  date: Date;
  amount: number;
  isCompleted: boolean;
  isOverdue: boolean;
  isToday: boolean;
}

interface PACPaymentTrackerProps {
  config: InvestmentConfig;
  configId?: string;
  dailyPACOverrides?: { [day: number]: number };
  onUpdatePACForDay?: (day: number, amount: number | null) => void;
  onMarkPaymentComplete?: (day: number, isComplete: boolean) => void;
}

export const PACPaymentTracker: React.FC<PACPaymentTrackerProps> = ({
  config,
  configId,
  dailyPACOverrides = {},
  onUpdatePACForDay,
  onMarkPaymentComplete
}) => {
  const [completedPayments, setCompletedPayments] = useState<Set<number>>(new Set());
  const { createOrUpdatePACPayment } = usePACPayments();

  // Initialize completed payments from dailyPACOverrides (use 0 amount as completed marker)
  useEffect(() => {
    const completed = new Set<number>();
    Object.entries(dailyPACOverrides).forEach(([day, amount]) => {
      if (amount === 0) {
        completed.add(parseInt(day));
      }
    });
    setCompletedPayments(completed);
  }, [dailyPACOverrides]);

  // Generate PAC payments based on configuration
  const payments = useMemo((): PACPayment[] => {
    const payments: PACPayment[] = [];
    const startDate = new Date(config.pacConfig.startDate);
    const today = new Date();
    let currentDate = new Date(startDate);
    let dayCounter = 1; // Start from day 1 to match database indices

    // Generate payments for the time horizon
    while (dayCounter <= config.timeHorizon) {
      const baseAmount = config.pacConfig.amount;
      const overrideAmount = dailyPACOverrides[dayCounter];
      const amount = overrideAmount !== undefined ? overrideAmount : baseAmount;
      
      // Only include payments that should happen based on frequency
      const shouldIncludePayment = (() => {
        switch (config.pacConfig.frequency) {
          case 'daily':
            return true;
          case 'weekly':
            return (dayCounter - 1) % 7 === 0;
          case 'monthly':
            return (dayCounter - 1) % 30 === 0;
          case 'custom':
            return (dayCounter - 1) % (config.pacConfig.customDays || 1) === 0;
          default:
            return false;
        }
      })();

      if (shouldIncludePayment) {
        const isCompleted = completedPayments.has(dayCounter);
        const isScheduledAmount = amount > 0 && !isCompleted;
        
        if (isScheduledAmount || isCompleted) {
          payments.push({
            id: `day-${dayCounter}`,
            date: new Date(currentDate),
            amount: isCompleted ? (overrideAmount || baseAmount) : amount,
            isCompleted,
            isOverdue: isBefore(currentDate, today) && !isToday(currentDate),
            isToday: isToday(currentDate)
          });
        }
      }

      // Always advance by 1 day for day counter
      currentDate = addDays(currentDate, 1);
      dayCounter++;
    }

    return payments.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [config, dailyPACOverrides, completedPayments]);

  const togglePaymentCompletion = async (paymentId: string) => {
    const dayNumber = parseInt(paymentId.replace('day-', ''));
    const isCurrentlyCompleted = completedPayments.has(dayNumber);
    const baseAmount = config.pacConfig.amount;
    
    // Calculate the scheduled date for this payment
    const startDate = new Date(config.pacConfig.startDate);
    const scheduledDate = addDays(startDate, dayNumber - 1);
    const scheduledDateStr = format(scheduledDate, 'yyyy-MM-dd');
    
    if (onMarkPaymentComplete) {
      onMarkPaymentComplete(dayNumber, !isCurrentlyCompleted);
    }
    
    // 1. Update daily_pac_overrides (existing behavior)
    if (onUpdatePACForDay) {
      if (isCurrentlyCompleted) {
        // Unmark as completed - restore original amount
        onUpdatePACForDay(dayNumber, baseAmount);
      } else {
        // Mark as completed - set amount to 0 to indicate completion
        onUpdatePACForDay(dayNumber, 0);
      }
    }
    
    // 2. NEW: Synchronize with pac_payments table (only if configId is available)
    if (configId && createOrUpdatePACPayment) {
      await createOrUpdatePACPayment(
        configId,
        scheduledDateStr,
        baseAmount,
        !isCurrentlyCompleted, // New execution state
        baseAmount // Executed amount (same as scheduled for checkbox UI)
      );
    }
  };

  // Get current alerts
  const currentAlerts = useMemo(() => {
    const overduePayments = payments.filter(p => p.isOverdue && !p.isCompleted);
    const todayPayments = payments.filter(p => p.isToday && !p.isCompleted);
    const nextPayment = payments.find(p => !p.isCompleted && !p.isOverdue && !p.isToday);

    return { overduePayments, todayPayments, nextPayment };
  }, [payments]);

  const stats = useMemo(() => {
    const completed = payments.filter(p => p.isCompleted).length;
    const total = payments.length;
    const totalAmount = payments.reduce((sum, p) => sum + (p.isCompleted ? p.amount : 0), 0);
    
    return { completed, total, totalAmount };
  }, [payments]);

  if (payments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {currentAlerts.overduePayments.length > 0 && (
        <Alert className="border-destructive bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            <strong>{currentAlerts.overduePayments.length} versamenti in ritardo!</strong>
            {currentAlerts.overduePayments.slice(0, 2).map(payment => (
              <div key={payment.id} className="text-sm">
                {format(payment.date, 'dd/MM/yyyy', { locale: it })} - €{payment.amount.toFixed(2)}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {currentAlerts.todayPayments.length > 0 && (
        <Alert className="border-warning bg-warning/10">
          <Clock className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning">
            <strong>Versamento programmato oggi!</strong>
            {currentAlerts.todayPayments.map(payment => (
              <div key={payment.id} className="text-sm">
                €{payment.amount.toFixed(2)}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {currentAlerts.nextPayment && currentAlerts.overduePayments.length === 0 && currentAlerts.todayPayments.length === 0 && (
        <Alert className="border-success bg-success/10">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            <strong>Prossimo versamento:</strong> {format(currentAlerts.nextPayment.date, 'dd/MM/yyyy', { locale: it })} - €{currentAlerts.nextPayment.amount.toFixed(2)}
          </AlertDescription>
        </Alert>
      )}

      {/* Payment Tracker */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Tracking Versamenti PAC</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">{stats.completed}/{stats.total} effettuati</Badge>
              <Badge variant="secondary">€{stats.totalAmount.toFixed(2)} versati</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {payments.slice(0, 20).map((payment) => (
              <div
                key={payment.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  payment.isCompleted 
                    ? 'bg-success/10 border-success/20' 
                    : payment.isOverdue 
                    ? 'bg-destructive/10 border-destructive/20' 
                    : payment.isToday
                    ? 'bg-warning/10 border-warning/20'
                    : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={payment.isCompleted}
                    onCheckedChange={() => togglePaymentCompletion(payment.id)}
                  />
                  <div>
                    <div className="font-medium">
                      {format(payment.date, 'dd/MM/yyyy', { locale: it })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      €{payment.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {payment.isCompleted && (
                    <Badge variant="default" className="bg-success text-success-foreground">
                      Effettuato
                    </Badge>
                  )}
                  {payment.isOverdue && !payment.isCompleted && (
                    <Badge variant="destructive">In ritardo</Badge>
                  )}
                  {payment.isToday && !payment.isCompleted && (
                    <Badge variant="secondary" className="bg-warning text-warning-foreground">
                      Oggi
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          {payments.length > 20 && (
            <div className="text-center text-sm text-muted-foreground mt-4">
              Mostrando i primi 20 versamenti di {payments.length}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};