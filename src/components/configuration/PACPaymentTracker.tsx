import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format, addDays, addWeeks, addMonths, isBefore, isToday, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { InvestmentConfig } from '@/types/investment';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

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
  dailyPACOverrides?: { [day: number]: number };
}

export const PACPaymentTracker: React.FC<PACPaymentTrackerProps> = ({
  config,
  dailyPACOverrides = {}
}) => {
  const [completedPayments, setCompletedPayments] = useState<Set<string>>(new Set());

  // Load completed payments from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pac-completed-payments');
    if (saved) {
      setCompletedPayments(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save completed payments to localStorage
  const saveCompletedPayments = (payments: Set<string>) => {
    localStorage.setItem('pac-completed-payments', JSON.stringify([...payments]));
    setCompletedPayments(payments);
  };

  // Generate PAC payments based on configuration
  const payments = useMemo((): PACPayment[] => {
    const payments: PACPayment[] = [];
    const startDate = new Date(config.pacConfig.startDate);
    const today = new Date();
    let currentDate = new Date(startDate);
    let dayCounter = 0;

    // Generate payments for the time horizon
    while (dayCounter < config.timeHorizon) {
      const paymentId = `${format(currentDate, 'yyyy-MM-dd')}-${dayCounter}`;
      const baseAmount = config.pacConfig.amount;
      const overrideAmount = dailyPACOverrides[dayCounter + 1];
      const amount = overrideAmount !== undefined ? overrideAmount : baseAmount;

      if (amount > 0) {
        payments.push({
          id: paymentId,
          date: new Date(currentDate),
          amount,
          isCompleted: completedPayments.has(paymentId),
          isOverdue: isBefore(currentDate, today) && !isToday(currentDate),
          isToday: isToday(currentDate)
        });
      }

      // Advance date based on frequency
      switch (config.pacConfig.frequency) {
        case 'daily':
          currentDate = addDays(currentDate, 1);
          break;
        case 'weekly':
          currentDate = addWeeks(currentDate, 1);
          break;
        case 'monthly':
          currentDate = addMonths(currentDate, 1);
          break;
        case 'custom':
          currentDate = addDays(currentDate, config.pacConfig.customDays || 1);
          break;
      }
      dayCounter++;
    }

    return payments.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [config, dailyPACOverrides, completedPayments]);

  const togglePaymentCompletion = (paymentId: string) => {
    const newCompleted = new Set(completedPayments);
    if (newCompleted.has(paymentId)) {
      newCompleted.delete(paymentId);
    } else {
      newCompleted.add(paymentId);
    }
    saveCompletedPayments(newCompleted);
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