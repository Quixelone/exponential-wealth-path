import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, AlertCircle } from 'lucide-react';
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
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    btc_amount: '',
    strike_price: '',
    fill_price_usd: '',
    trade_date: item.date,
    trade_type: 'option_fill',
    notes: ''
  });

  const calculatedValue = useMemo(() => {
    const btcAmount = parseFloat(formData.btc_amount);
    const strikePrice = formData.strike_price ? parseFloat(formData.strike_price) : null;
    const fillPrice = formData.fill_price_usd 
      ? parseFloat(formData.fill_price_usd) 
      : strikePrice;
    
    if (!isNaN(btcAmount) && fillPrice && !isNaN(fillPrice)) {
      return btcAmount * fillPrice;
    }
    return null;
  }, [formData]);
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
      const fillPrice = formData.fill_price_usd 
        ? parseFloat(formData.fill_price_usd) 
        : (formData.strike_price ? parseFloat(formData.strike_price) : null);

      if (!fillPrice) {
        toast({
          title: "Errore",
          description: "Inserisci almeno lo strike price o il fill price",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const {
        error
      } = await supabase.from('actual_trades').insert({
        config_id: configId,
        day: item.day,
        trade_date: formData.trade_date,
        btc_amount: parseFloat(formData.btc_amount),
        strike_price: formData.strike_price ? parseFloat(formData.strike_price) : null,
        fill_price_usd: fillPrice,
        trade_type: formData.trade_type,
        notes: formData.notes || null
      });
      if (error) throw error;
      toast({
        title: "Trade registrato",
        description: `${formData.trade_type === 'buy_btc' ? 'Buy' : 'Sell'} BTC registrato con successo`
      });
      onTradeRecorded();
      onOpenChange(false);
      setFormData({
        btc_amount: '',
        strike_price: '',
        fill_price_usd: '',
        trade_date: item.date,
        trade_type: 'buy_btc',
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
  return <Dialog open={open} onOpenChange={onOpenChange}>
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
              <Input id="trade_date" type="date" value={formData.trade_date} onChange={e => setFormData(prev => ({
              ...prev,
              trade_date: e.target.value
            }))} required />
            </div>
            <div>
              <Label htmlFor="trade_type">Tipo Opzione</Label>
              <Select 
                value={formData.trade_type}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  trade_type: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy_btc">Buy BTC (Call Sold)</SelectItem>
                  <SelectItem value="sell_btc">Sell BTC (Put Sold)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Strike Price - Campo evidenziato */}
          <div className="space-y-2 border-2 border-primary/30 rounded-lg p-4 bg-primary/5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <Label htmlFor="strike_price" className="text-base font-semibold">
                Strike Price (USDT)
              </Label>
              <Badge variant="default" className="ml-auto">Obbligatorio</Badge>
            </div>
            <Input 
              id="strike_price"
              type="number"
              step="0.01"
              placeholder="Es: 45000 (prezzo strike dell'opzione)"
              value={formData.strike_price}
              onChange={e => setFormData(prev => ({
                ...prev,
                strike_price: e.target.value
              }))}
              className="text-lg font-mono"
            />
            <p className="text-xs text-muted-foreground">
              💡 Prezzo concordato per l'acquisto/vendita di BTC nell'opzione
            </p>
            
            {/* Alert se campo vuoto ma BTC compilato */}
            {formData.btc_amount && !formData.strike_price && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Inserisci lo strike price per calcolare il valore del trade
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Quantità BTC */}
          <div>
            <Label htmlFor="btc_amount">Quantità BTC ricevuta/venduta</Label>
            <Input 
              id="btc_amount" 
              type="number" 
              step="0.00000001" 
              placeholder="0.00123456" 
              value={formData.btc_amount} 
              onChange={e => setFormData(prev => ({
                ...prev,
                btc_amount: e.target.value
              }))} 
              required 
              className="font-mono"
            />
          </div>
          
          {/* Fill Price (opzionale) */}
          <div>
            <Label htmlFor="fill_price_usd">
              Prezzo BTC eseguito 
              <span className="text-xs text-muted-foreground ml-2">(opzionale)</span>
            </Label>
            <Input 
              id="fill_price_usd" 
              type="number" 
              step="0.01" 
              placeholder="45523.18" 
              value={formData.fill_price_usd} 
              onChange={e => setFormData(prev => ({
                ...prev,
                fill_price_usd: e.target.value
              }))}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Lascia vuoto per usare automaticamente lo strike price
            </p>
          </div>

          {/* Preview Calcolo - Più evidente */}
          {calculatedValue && (
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border-2 border-primary/20">
              <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Preview Calcolo Trade
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">BTC</div>
                  <div className="font-mono font-bold">{formData.btc_amount}</div>
                </div>
                {formData.strike_price && (
                  <div>
                    <div className="text-muted-foreground">Strike</div>
                    <div className="font-mono font-bold">
                      ${parseFloat(formData.strike_price).toLocaleString()}
                    </div>
                  </div>
                )}
                {formData.fill_price_usd && (
                  <div>
                    <div className="text-muted-foreground">Fill Price</div>
                    <div className="font-mono font-bold">
                      ${parseFloat(formData.fill_price_usd).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-primary/20">
                <div className="text-sm text-muted-foreground">Valore Totale Trade</div>
                <div className="text-2xl font-bold text-primary font-mono">
                  ${calculatedValue.toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Note (opzionale)</Label>
            <Textarea id="notes" placeholder="Es: Strike 45k, scadenza oggi, riempimento parziale..." value={formData.notes} onChange={e => setFormData(prev => ({
            ...prev,
            notes: e.target.value
          }))} rows={3} />
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
    </Dialog>;
};