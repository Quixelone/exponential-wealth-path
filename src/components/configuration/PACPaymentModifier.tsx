
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Edit, Pause, Play, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PACPayment {
  id: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'paused';
  isEditable: boolean;
}

interface PACPaymentModifierProps {
  pacAmount: number;
  pacFrequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  onUpdatePayment: (paymentId: string, newAmount: number, newDate: string) => void;
  onTogglePayment: (paymentId: string, isActive: boolean) => void;
  onAddPayment: (amount: number, date: string) => void;
}

const PACPaymentModifier: React.FC<PACPaymentModifierProps> = ({
  pacAmount,
  pacFrequency,
  onUpdatePayment,
  onTogglePayment,
  onAddPayment
}) => {
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editDate, setEditDate] = useState<string>('');
  const [newPaymentAmount, setNewPaymentAmount] = useState<number>(pacAmount);
  const [newPaymentDate, setNewPaymentDate] = useState<string>('');
  const { toast } = useToast();

  // Mock data for demonstration - in real implementation this would come from props/API
  const [payments] = useState<PACPayment[]>([
    {
      id: '1',
      date: '2025-01-15',
      amount: pacAmount,
      status: 'completed',
      isEditable: false
    },
    {
      id: '2',
      date: '2025-02-15',
      amount: pacAmount,
      status: 'pending',
      isEditable: true
    },
    {
      id: '3',
      date: '2025-03-15',
      amount: pacAmount,
      status: 'pending',
      isEditable: true
    }
  ]);

  const handleStartEdit = (payment: PACPayment) => {
    setEditingPayment(payment.id);
    setEditAmount(payment.amount);
    setEditDate(payment.date);
  };

  const handleSaveEdit = () => {
    if (editingPayment) {
      onUpdatePayment(editingPayment, editAmount, editDate);
      setEditingPayment(null);
      toast({
        title: "Versamento aggiornato",
        description: "Le modifiche sono state salvate con successo",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingPayment(null);
    setEditAmount(0);
    setEditDate('');
  };

  const handleAddNewPayment = () => {
    if (newPaymentAmount > 0 && newPaymentDate) {
      onAddPayment(newPaymentAmount, newPaymentDate);
      setNewPaymentAmount(pacAmount);
      setNewPaymentDate('');
      toast({
        title: "Versamento aggiunto",
        description: "Il nuovo versamento è stato programmato",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'paused':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completato';
      case 'pending':
        return 'In attesa';
      case 'paused':
        return 'Sospeso';
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Gestione Versamenti PAC</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new payment */}
        <Card className="border-dashed">
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label>Importo Versamento</Label>
                <Input
                  type="number"
                  value={newPaymentAmount}
                  onChange={(e) => setNewPaymentAmount(Number(e.target.value))}
                  placeholder="Importo"
                />
              </div>
              <div className="space-y-2">
                <Label>Data Versamento</Label>
                <Input
                  type="date"
                  value={newPaymentDate}
                  onChange={(e) => setNewPaymentDate(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleAddNewPayment}
                disabled={!newPaymentAmount || !newPaymentDate}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Versamento
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment history table */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Storico Versamenti</Label>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Importo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {editingPayment === payment.id ? (
                      <Input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-40"
                      />
                    ) : (
                      new Date(payment.date).toLocaleDateString('it-IT')
                    )}
                  </TableCell>
                  <TableCell>
                    {editingPayment === payment.id ? (
                      <Input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(Number(e.target.value))}
                        className="w-24"
                      />
                    ) : (
                      `€${payment.amount.toFixed(2)}`
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(payment.status)}>
                      {getStatusLabel(payment.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 items-center">
                      {editingPayment === payment.id ? (
                        <>
                          <Button size="sm" onClick={handleSaveEdit}>
                            Salva
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            Annulla
                          </Button>
                        </>
                      ) : (
                        <>
                          {payment.isEditable && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartEdit(payment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {payment.status === 'pending' && (
                            <Switch
                              checked={payment.status !== 'paused'}
                              onCheckedChange={(checked) => 
                                onTogglePayment(payment.id, checked)
                              }
                            />
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PACPaymentModifier;
