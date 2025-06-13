
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Plus, Save, X, Edit, PauseCircle, PlayCircle, Calendar } from 'lucide-react';

interface PACPayment {
  id: string;
  amount: number;
  date: string;
  status: PaymentStatus;
}

type PaymentStatus = 'active' | 'pending' | 'paused' | 'completed';

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
  const [payments, setPayments] = useState<PACPayment[]>([
    {
      id: '1',
      amount: pacAmount,
      date: '2024-01-20',
      status: 'active',
    },
    {
      id: '2',
      amount: pacAmount,
      date: '2024-02-20',
      status: 'pending',
    },
    {
      id: '3',
      amount: pacAmount,
      date: '2024-03-20',
      status: 'paused',
    },
    {
      id: '4',
      amount: pacAmount,
      date: '2023-12-20',
      status: 'completed',
    },
  ]);
  
  const [editingPayment, setEditingPayment] = useState<PACPayment | null>(null);
  const [editingAmount, setEditingAmount] = useState(0);
  const [editingDate, setEditingDate] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPaymentAmount, setNewPaymentAmount] = useState(pacAmount);
  const [newPaymentDate, setNewPaymentDate] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculateNextPaymentDate = (startDate: string, frequency: string): string => {
    const date = new Date(startDate);
    let nextDate = new Date(date);

    switch (frequency) {
      case 'daily':
        nextDate.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(date.getMonth() + 1);
        break;
      default:
        return 'Sconosciuta';
    }

    const day = String(nextDate.getDate()).padStart(2, '0');
    const month = String(nextDate.getMonth() + 1).padStart(2, '0');
    const year = nextDate.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'paused':
        return 'text-red-600 bg-red-50';
      case 'completed':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: PaymentStatus) => {
    switch (status) {
      case 'active':
        return 'Attivo';
      case 'pending':
        return 'In sospeso';
      case 'paused':
        return 'In pausa';
      case 'completed':
        return 'Completato';
      default:
        return 'Sconosciuto';
    }
  };

  const handleEdit = (payment: PACPayment) => {
    setEditingPayment(payment);
    setEditingAmount(payment.amount);
    setEditingDate(payment.date);
  };

  const handleSaveEdit = () => {
    if (editingPayment && editingAmount > 0 && editingDate) {
      // Aggiorna lo stato locale
      setPayments(prev => prev.map(payment => 
        payment.id === editingPayment.id 
          ? { ...payment, amount: editingAmount, date: editingDate }
          : payment
      ));
      
      // Chiama la funzione di callback
      onUpdatePayment(editingPayment.id, editingAmount, editingDate);
      
      // Reset form
      setEditingPayment(null);
      setEditingAmount(0);
      setEditingDate('');
    }
  };

  const handleCancelEdit = () => {
    setEditingPayment(null);
    setEditingAmount(0);
    setEditingDate('');
  };

  const handleToggle = (payment: PACPayment) => {
    const newStatus: PaymentStatus = payment.status === 'active' ? 'paused' : 'active';
    const isActive = newStatus === 'active';
    
    // Aggiorna lo stato locale
    setPayments(prev => prev.map(p => 
      p.id === payment.id 
        ? { ...p, status: newStatus }
        : p
    ));
    
    // Chiama la funzione di callback
    onTogglePayment(payment.id, isActive);
  };

  const handleAddNewPayment = () => {
    if (newPaymentAmount > 0 && newPaymentDate) {
      // Crea nuovo pagamento
      const newPayment: PACPayment = {
        id: Date.now().toString(),
        amount: newPaymentAmount,
        date: newPaymentDate,
        status: 'pending'
      };
      
      // Aggiorna lo stato locale
      setPayments(prev => [...prev, newPayment]);
      
      // Chiama la funzione di callback
      onAddPayment(newPaymentAmount, newPaymentDate);
      
      // Reset form
      setNewPaymentAmount(pacAmount);
      setNewPaymentDate('');
      setShowAddForm(false);
    }
  };

  return (
    <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5 text-primary" />
          Modifica Versamenti PAC
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Gestisci i tuoi versamenti PAC programmati. Puoi modificare importi, date o sospendere temporaneamente i pagamenti.
        </div>

        {/* Add new payment button */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium">Versamenti Programmati</span>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Aggiungi Versamento
          </Button>
        </div>

        {/* Add new payment form */}
        {showAddForm && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="new-amount" className="text-sm">Importo</Label>
                  <Input
                    id="new-amount"
                    type="number"
                    value={newPaymentAmount}
                    onChange={(e) => setNewPaymentAmount(Number(e.target.value))}
                    placeholder="€ 0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="new-date" className="text-sm">Data</Label>
                  <Input
                    id="new-date"
                    type="date"
                    value={newPaymentDate}
                    onChange={(e) => setNewPaymentDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddNewPayment}>
                  <Save className="h-4 w-4 mr-1" />
                  Aggiungi
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                  <X className="h-4 w-4 mr-1" />
                  Annulla
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Payments list */}
        <div className="space-y-3">
          {payments.map((payment) => (
            <Card key={payment.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {editingPayment?.id === payment.id ? (
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Importo</Label>
                        <Input
                          type="number"
                          value={editingAmount}
                          onChange={(e) => setEditingAmount(Number(e.target.value))}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Data</Label>
                        <Input
                          type="date"
                          value={editingDate}
                          onChange={(e) => setEditingDate(e.target.value)}
                          className="h-8"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{formatCurrency(payment.amount)}</span>
                        <Badge className={`text-xs px-2 py-1 ${getStatusColor(payment.status)}`}>
                          {getStatusText(payment.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Scadenza: {new Date(payment.date).toLocaleDateString('it-IT')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Prossimo: {calculateNextPaymentDate(payment.date, pacFrequency)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 ml-4">
                  {editingPayment?.id === payment.id ? (
                    <>
                      <Button size="sm" onClick={handleSaveEdit} className="h-7 w-7 p-0">
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-7 w-7 p-0">
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(payment)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggle(payment)}
                        className={`h-7 w-7 p-0 ${
                          payment.status === 'active' 
                            ? 'text-red-600 hover:text-red-700' 
                            : 'text-green-600 hover:text-green-700'
                        }`}
                      >
                        {payment.status === 'active' ? (
                          <PauseCircle className="h-3 w-3" />
                        ) : (
                          <PlayCircle className="h-3 w-3" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Payment history indicator */}
              {payment.status === 'completed' && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="text-xs text-muted-foreground">
                    ✓ Versamento completato
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {payments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nessun versamento programmato</p>
            <p className="text-sm">Aggiungi il tuo primo versamento PAC</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PACPaymentModifier;
