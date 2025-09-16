import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, CheckCircle, XCircle, Clock, AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { usePACPayments } from '@/hooks/usePACPayments';
import type { PACPayment, ExecutePACPaymentData } from '@/types/pac-payments';
import { InvestmentConfig } from '@/types/investment';

interface PACPaymentReportProps {
  configId: string;
  config: InvestmentConfig & { id: string };
  currency: string;
}

export const PACPaymentReport: React.FC<PACPaymentReportProps> = ({
  configId,
  config,
  currency,
}) => {
  const {
    payments,
    stats,
    loading,
    generateScheduledPayments,
    executePayment,
    undoExecution,
  } = usePACPayments(configId);

  const [selectedPayment, setSelectedPayment] = useState<PACPayment | null>(null);
  const [executionData, setExecutionData] = useState<ExecutePACPaymentData>({
    executed_date: format(new Date(), 'yyyy-MM-dd'),
    executed_amount: 0,
    execution_notes: '',
    payment_method: 'bank_transfer',
  });
  const [isExecuteDialogOpen, setIsExecuteDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (payment: PACPayment) => {
    if (payment.is_executed) {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Eseguito</Badge>;
    }
    
    const today = new Date();
    const scheduledDate = parseISO(payment.scheduled_date);
    
    if (scheduledDate < today) {
      return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />In Ritardo</Badge>;
    } else if (scheduledDate.toDateString() === today.toDateString()) {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Oggi</Badge>;
    } else {
      return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Programmato</Badge>;
    }
  };

  const handleExecutePayment = (payment: PACPayment) => {
    setSelectedPayment(payment);
    setExecutionData({
      executed_date: format(new Date(), 'yyyy-MM-dd'),
      executed_amount: payment.scheduled_amount,
      execution_notes: '',
      payment_method: 'bank_transfer',
    });
    setIsExecuteDialogOpen(true);
  };

  const confirmExecution = async () => {
    if (!selectedPayment) return;

    await executePayment(selectedPayment.id, executionData);
    setIsExecuteDialogOpen(false);
    setSelectedPayment(null);
  };

  const exportToCSV = () => {
    const headers = [
      'Data Programmata',
      'Importo Programmato',
      'Status',
      'Data Esecuzione',
      'Importo Eseguito',
      'Metodo Pagamento',
      'Note'
    ];

    const csvData = payments.map(payment => [
      format(parseISO(payment.scheduled_date), 'dd/MM/yyyy'),
      payment.scheduled_amount.toString(),
      payment.is_executed ? 'Eseguito' : 'Programmato',
      payment.executed_date ? format(parseISO(payment.executed_date), 'dd/MM/yyyy') : '',
      payment.executed_amount?.toString() || '',
      payment.payment_method || '',
      payment.execution_notes || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `versamenti-pac-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{stats.executionRate.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground">Tasso Esecuzione</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.executedCount}</div>
              <p className="text-sm text-muted-foreground">Versamenti Eseguiti</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalAmountExecuted)}</div>
              <p className="text-sm text-muted-foreground">Totale Versato</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.overduePayments}</div>
              <p className="text-sm text-muted-foreground">Versamenti in Ritardo</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Report Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Report Versamenti PAC
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => generateScheduledPayments(config)}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Rigenera Versamenti
              </Button>
              <Button
                onClick={exportToCSV}
                variant="outline"
                size="sm"
                disabled={payments.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Esporta CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Nessun versamento programmato trovato per questa strategia.
              </p>
              <Button onClick={() => generateScheduledPayments(config)} disabled={loading}>
                Genera Versamenti Programmati
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data Programmata</TableHead>
                  <TableHead>Importo Programmato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Esecuzione</TableHead>
                  <TableHead>Importo Eseguito</TableHead>
                  <TableHead>Metodo</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {format(parseISO(payment.scheduled_date), 'dd MMMM yyyy', { locale: it })}
                    </TableCell>
                    <TableCell>{formatCurrency(payment.scheduled_amount)}</TableCell>
                    <TableCell>{getStatusBadge(payment)}</TableCell>
                    <TableCell>
                      {payment.executed_date 
                        ? format(parseISO(payment.executed_date), 'dd MMMM yyyy', { locale: it })
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {payment.executed_amount ? formatCurrency(payment.executed_amount) : '-'}
                    </TableCell>
                    <TableCell>
                      {payment.payment_method === 'bank_transfer' ? 'Bonifico' :
                       payment.payment_method === 'credit_card' ? 'Carta di Credito' :
                       payment.payment_method === 'cash' ? 'Contanti' :
                       payment.payment_method || '-'}
                    </TableCell>
                    <TableCell>
                      {payment.is_executed ? (
                        <Button
                          onClick={() => undoExecution(payment.id)}
                          variant="outline"
                          size="sm"
                          disabled={loading}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Annulla
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleExecutePayment(payment)}
                          variant="default"
                          size="sm"
                          disabled={loading}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Esegui
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Execute Payment Dialog */}
      <Dialog open={isExecuteDialogOpen} onOpenChange={setIsExecuteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registra Esecuzione Versamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="executed_date">Data Esecuzione</Label>
              <Input
                id="executed_date"
                type="date"
                value={executionData.executed_date}
                onChange={(e) =>
                  setExecutionData({ ...executionData, executed_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="executed_amount">Importo Effettivo ({currency})</Label>
              <Input
                id="executed_amount"
                type="number"
                step="0.01"
                value={executionData.executed_amount}
                onChange={(e) =>
                  setExecutionData({ ...executionData, executed_amount: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <Label htmlFor="payment_method">Metodo di Pagamento</Label>
              <Select
                value={executionData.payment_method}
                onValueChange={(value) =>
                  setExecutionData({ ...executionData, payment_method: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bonifico Bancario</SelectItem>
                  <SelectItem value="credit_card">Carta di Credito</SelectItem>
                  <SelectItem value="debit_card">Carta di Debito</SelectItem>
                  <SelectItem value="cash">Contanti</SelectItem>
                  <SelectItem value="other">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="execution_notes">Note (opzionale)</Label>
              <Textarea
                id="execution_notes"
                value={executionData.execution_notes}
                onChange={(e) =>
                  setExecutionData({ ...executionData, execution_notes: e.target.value })
                }
                placeholder="Inserisci eventuali note sul versamento..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setIsExecuteDialogOpen(false)}
                variant="outline"
              >
                Annulla
              </Button>
              <Button onClick={confirmExecution} disabled={loading}>
                Conferma Esecuzione
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};