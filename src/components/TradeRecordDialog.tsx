import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { InvestmentData } from '@/types/investment';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TradeRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InvestmentData;
  configId?: string | null;
  onTradeRecorded: () => void;
}

export const TradeRecordDialog: React.FC<TradeRecordDialogProps> = ({
  open,
  onOpenChange,
  item,
  configId,
  onTradeRecorded
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    btc_amount: '',
    fill_price_usd: '',
    trade_date: item.date,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configId) {
      toast({
        title: "Errore",
        description: "Salva prima la strategia per registrare i trade",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('actual_trades')
        .insert({
          config_id: configId,
          day: item.day,
          trade_date: formData.trade_date,
          btc_amount: parseFloat(formData.btc_amount),
          fill_price_usd: parseFloat(formData.fill_price_usd),
          trade_type: 'option_fill',
          notes: formData.notes || null
        });

      if (error) throw error;

      toast({
        title: "Trade registrato",
        description: "Il trade è stato salvato con successo"
      });

      onTradeRecorded();
      onOpenChange(false);
      setFormData({
        btc_amount: '',
        fill_price_usd: '',
        trade_date: item.date,
        notes: ''
      });
    } catch (error) {
      console.error('Error recording trade:', error);
      toast({
        title: "Errore",
        description: "Impossibile registrare il trade",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registra Trade Reale - Giorno {item.day}</DialogTitle>
          <DialogDescription>
            Inserisci i dettagli del tuo trade effettivo per confrontarlo con la strategia teorica.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="trade_date">Data Trade</Label>
              <Input
                id="trade_date"
                type="date"
                value={formData.trade_date}
                onChange={(e) => setFormData(prev => ({ ...prev, trade_date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="btc_amount">Quantità BTC</Label>
              <Input
                id="btc_amount"
                type="number"
                step="0.00000001"
                placeholder="0.00123456"
                value={formData.btc_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, btc_amount: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="fill_price_usd">Prezzo Riempimento (USD)</Label>
            <Input
              id="fill_price_usd"
              type="number"
              step="0.01"
              placeholder="45000.00"
              value={formData.fill_price_usd}
              onChange={(e) => setFormData(prev => ({ ...prev, fill_price_usd: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Note (opzionale)</Label>
            <Textarea
              id="notes"
              placeholder="Es: Strike 45k, scadenza oggi, riempimento parziale..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="bg-muted p-3 rounded-lg text-sm">
            <div className="font-medium mb-2">Info Strategia:</div>
            <div>Valore Teorico: ${item.finalCapital.toLocaleString()}</div>
            <div>Rendimento Giornaliero: {(item.dailyReturn * 100).toFixed(4)}%</div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Registra Trade'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};