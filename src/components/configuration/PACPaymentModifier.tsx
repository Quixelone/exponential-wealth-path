
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, PlusCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { PACConfig } from '@/types/investment'; // Assuming PACConfig might be useful for frequency type

interface PACPaymentModifierProps {
  pacAmount: number;
  pacFrequency: PACConfig['frequency'];
  onUpdatePayment: (paymentId: string, newAmount: number, newDate: string) => void;
  onTogglePayment: (paymentId: string, isActive: boolean) => void;
  onAddPayment: (amount: number, date: string) => void;
  // For simplicity, we'll assume a mock list of payments or manage state internally for demonstration
  // In a real app, this might come from props or a global state/hook
}

const PACPaymentModifier: React.FC<PACPaymentModifierProps> = ({
  pacAmount,
  pacFrequency,
  onUpdatePayment,
  onTogglePayment,
  onAddPayment,
}) => {
  // Mock data and handlers for demonstration - replace with actual logic
  const [payments, setPayments] = React.useState([
    { id: '1', amount: pacAmount, date: '2025-07-01', isActive: true },
    { id: '2', amount: pacAmount, date: '2025-08-01', isActive: true },
  ]);
  const [newPaymentAmount, setNewPaymentAmount] = React.useState(pacAmount);
  const [newPaymentDate, setNewPaymentDate] = React.useState('');

  const handleAdd = () => {
    if (newPaymentAmount > 0 && newPaymentDate) {
      onAddPayment(newPaymentAmount, newPaymentDate);
      // Mock: add to local state for UI feedback
      setPayments(prev => [...prev, { id: String(Date.now()), amount: newPaymentAmount, date: newPaymentDate, isActive: true}])
      setNewPaymentAmount(pacAmount); // Reset
      setNewPaymentDate(''); // Reset
    }
  };

  return (
    <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Edit className="h-5 w-5 text-primary" />
          Modifica Pagamenti PAC
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Gestisci i singoli versamenti del tuo Piano di Accumulo.
          Frequenza attuale: {pacFrequency}, Importo base: €{pacAmount}.
        </p>
        
        <div className="space-y-2">
          <Label>Versamenti Esistenti (Esempio)</Label>
          {payments.map(payment => (
            <div key={payment.id} className="flex items-center justify-between p-2 border rounded-md">
              <div>
                <p>Importo: €{payment.amount}</p>
                <p className="text-xs text-muted-foreground">Data: {payment.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => onTogglePayment(payment.id, !payment.isActive)}>
                  {payment.isActive ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5 text-red-500" />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => onUpdatePayment(payment.id, payment.amount + 10, payment.date) /* Example update */}>
                  Modifica
                </Button>
              </div>
            </div>
          ))}
          {payments.length === 0 && <p className="text-sm text-muted-foreground">Nessun versamento specifico.</p>}
        </div>

        <div className="space-y-3 pt-4 border-t">
          <Label>Aggiungi Nuovo Versamento Specifico</Label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              placeholder="Importo"
              value={newPaymentAmount}
              onChange={(e) => setNewPaymentAmount(Number(e.target.value))}
            />
            <Input
              type="date"
              value={newPaymentDate}
              onChange={(e) => setNewPaymentDate(e.target.value)}
            />
          </div>
          <Button onClick={handleAdd} className="w-full">
            <PlusCircle className="h-4 w-4 mr-2" />
            Aggiungi Versamento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PACPaymentModifier;
