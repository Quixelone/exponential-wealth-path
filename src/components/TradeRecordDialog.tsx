import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { InvestmentData, ActualTrade } from '@/types/investment';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBTCPrice } from '@/hooks/useBTCPrice';
import { TrendingUp, AlertCircle, CheckCircle2, XCircle, Calendar, Trash2 } from 'lucide-react';

interface TradeRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InvestmentData;
  configId?: string | null;
  onTradeRecorded: () => void;
  data?: InvestmentData[];
}

export const TradeRecordDialog: React.FC<TradeRecordDialogProps> = ({
  open,
  onOpenChange,
  item,
  configId,
  onTradeRecorded,
  data = []
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existingTrade, setExistingTrade] = useState<ActualTrade | null>(null);

  const calculatePreviousDate = (dateString: string): string => {
    const date = new Date(dateString);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    option_sold_date: item.day > 1 
      ? (data[item.day - 2]?.date || calculatePreviousDate(item.date))
      : item.date,
    expiration_date: item.date,
    option_status: 'filled' as 'filled' | 'expired_otm',
    
    // Scenario FILLED
    btc_amount: '',
    strike_price: '',
    fill_price_usd: '',
    
    // Scenario EXPIRED
    premium_received_usdt: '',
    premium_currency: 'USDT',
    
    trade_type: 'buy_btc',
    notes: ''
  });

  // Fetch BTC price automatically for expiration date
  const { 
    price: btcPriceAtExpiration, 
    loading: loadingBTCPrice,
    error: btcPriceError 
  } = useBTCPrice(formData.expiration_date);

  // Load existing trade on open
  useEffect(() => {
    if (open && configId) {
      const fetchExistingTrade = async () => {
        console.log('🔍 Caricamento trade esistente per:', { configId, day: item.day });
        
        // Prima controlla se ci sono duplicati
        const { data: allTrades, error: checkError } = await supabase
          .from('actual_trades')
          .select('*')
          .eq('config_id', configId)
          .eq('day', item.day)
          .order('created_at', { ascending: false });
        
        if (checkError) {
          console.error('❌ Errore caricamento trade:', checkError);
          setExistingTrade(null);
          return;
        }
        
        if (allTrades && allTrades.length > 0) {
          if (allTrades.length > 1) {
            console.warn('⚠️ Trovati duplicati! Trade multipli per lo stesso giorno:', allTrades.length);
            toast({
              title: "⚠️ Duplicati rilevati",
              description: `Trovati ${allTrades.length} trade per questo giorno. Mostro il più recente.`,
              variant: "destructive"
            });
          }
          
          // Prende il più recente (primo dopo l'ordinamento)
          const tradeData = allTrades[0];
          console.log('✅ Trade esistente trovato:', tradeData);
          setExistingTrade(tradeData as ActualTrade);
          
          // Pre-fill form with existing data
          setFormData({
            option_sold_date: tradeData.option_sold_date || '',
            expiration_date: tradeData.expiration_date || '',
            option_status: tradeData.option_status as 'filled' | 'expired_otm',
            btc_amount: tradeData.btc_amount?.toString() || '',
            strike_price: tradeData.strike_price?.toString() || '',
            fill_price_usd: tradeData.fill_price_usd?.toString() || '',
            premium_received_usdt: tradeData.premium_received_usdt?.toString() || '',
            premium_currency: tradeData.premium_currency || 'USDT',
            trade_type: tradeData.trade_type,
            notes: tradeData.notes || ''
          });
        } else {
          console.log('ℹ️ Nessun trade esistente trovato');
          setExistingTrade(null);
        }
      };
      fetchExistingTrade();
    } else {
      console.log('⚠️ Dialog aperto ma configId mancante:', { open, configId });
    }
  }, [open, configId, item.day]);

  // Auto-fill strike price when BTC price is fetched (only for new trades)
  useEffect(() => {
    if (btcPriceAtExpiration && !formData.strike_price && !existingTrade) {
      setFormData(prev => ({
        ...prev,
        strike_price: btcPriceAtExpiration.toFixed(2)
      }));
    }
  }, [btcPriceAtExpiration, existingTrade]);

  const calculatedValue = useMemo(() => {
    if (formData.option_status === 'filled') {
      const btcAmount = parseFloat(formData.btc_amount);
      const fillPrice = formData.fill_price_usd 
        ? parseFloat(formData.fill_price_usd) 
        : (formData.strike_price ? parseFloat(formData.strike_price) : null);
      
      if (btcAmount && fillPrice) {
        return btcAmount * fillPrice;
      }
    } else if (formData.option_status === 'expired_otm') {
      if (formData.premium_received_usdt) {
        return parseFloat(formData.premium_received_usdt);
      }
    }
    return null;
  }, [formData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

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
      let tradeData: any = {
        config_id: configId,
        day: item.day,
        option_sold_date: formData.option_sold_date,
        expiration_date: formData.expiration_date,
        trade_date: formData.expiration_date,
        option_status: formData.option_status,
        trade_type: formData.trade_type,
        notes: formData.notes || null,
        strike_price: formData.strike_price ? parseFloat(formData.strike_price) : null
      };

      if (formData.option_status === 'filled') {
        // Opzione fillata - movimento BTC
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

        if (!formData.btc_amount) {
          toast({
            title: "Errore",
            description: "Inserisci la quantità di BTC",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        tradeData = {
          ...tradeData,
          btc_amount: parseFloat(formData.btc_amount),
          fill_price_usd: fillPrice,
          premium_received_usdt: null
        };
      } else {
        // Opzione scaduta OTM - solo premio
        if (!formData.premium_received_usdt) {
          toast({
            title: "Errore",
            description: "Inserisci il premio ricevuto",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        tradeData = {
          ...tradeData,
          btc_amount: null,
          fill_price_usd: null,
          premium_received_usdt: parseFloat(formData.premium_received_usdt),
          premium_currency: 'USDT'
        };
      }

      let result;
      if (existingTrade) {
        // UPDATE MODE
        result = await supabase
          .from('actual_trades')
          .update(tradeData)
          .eq('id', existingTrade.id);
        
        if (result.error) throw result.error;
        
        toast({
          title: "✅ Trade aggiornato",
          description: "Le modifiche sono state salvate con successo"
        });
      } else {
        // INSERT MODE
        result = await supabase
          .from('actual_trades')
          .insert(tradeData);
        
        if (result.error) throw result.error;
        
        toast({
          title: "✅ Trade registrato",
          description: formData.option_status === 'filled' 
            ? `Opzione fillata: ${formData.btc_amount} BTC a $${tradeData.fill_price_usd}` 
            : `Opzione scaduta OTM: Premio $${formData.premium_received_usdt} USDT`
        });
      }
      
      onTradeRecorded();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        option_sold_date: calculatePreviousDate(item.date),
        expiration_date: item.date,
        option_status: 'filled',
        btc_amount: '',
        strike_price: '',
        fill_price_usd: '',
        premium_received_usdt: '',
        premium_currency: 'USDT',
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {existingTrade ? '✏️ Modifica Trade' : '📝 Registra Trade'} - Giorno {item.day}
            {existingTrade && (
              <Badge variant="secondary" className="ml-2 bg-blue-500/20 text-blue-700 dark:text-blue-300">
                📝 Modalità Modifica
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Timeline Opzione */}
          <div className="bg-primary/5 p-4 rounded-lg border-2 border-primary/20">
            <div className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Timeline Opzione
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="option_sold_date" className="text-xs">
                  📅 Opzione Venduta
                </Label>
                <Input 
                  id="option_sold_date"
                  type="date"
                  value={formData.option_sold_date}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    option_sold_date: e.target.value
                  }))}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Giorno {item.day - 1}
                </p>
              </div>
              
              <div>
                <Label htmlFor="expiration_date" className="text-xs">
                  ⏰ Scadenza/Fill
                </Label>
                <Input 
                  id="expiration_date"
                  type="date"
                  value={formData.expiration_date}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    expiration_date: e.target.value
                  }))}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Giorno {item.day} (oggi)
                </p>
              </div>
            </div>
            
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
              <span>
                Hai venduto l'opzione il <strong>{formatDate(formData.option_sold_date)}</strong>,
                è scaduta oggi <strong>{formatDate(formData.expiration_date)}</strong>
              </span>
            </div>
          </div>

          {/* Tabs per scegliere scenario */}
          <Tabs 
            value={formData.option_status} 
            onValueChange={(value) => setFormData(prev => ({
              ...prev,
              option_status: value as 'filled' | 'expired_otm'
            }))}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="filled" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Opzione Fillata (ITM)
              </TabsTrigger>
              <TabsTrigger value="expired_otm" className="gap-2">
                <XCircle className="h-4 w-4" />
                Opzione Scaduta (OTM)
              </TabsTrigger>
            </TabsList>

            {/* SCENARIO 1: Opzione Fillata */}
            <TabsContent value="filled" className="space-y-4 mt-4">
              {/* Strike Price */}
              <div className="space-y-2 border-2 border-primary/30 rounded-lg p-4 bg-primary/5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <Label htmlFor="strike_price" className="text-base font-semibold">
                      Strike Price (USDT)
                    </Label>
                  </div>
                  {loadingBTCPrice && (
                    <Badge variant="outline" className="animate-pulse">
                      🔄 Caricamento prezzo...
                    </Badge>
                  )}
                  {btcPriceAtExpiration && !loadingBTCPrice && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-300">
                      ✅ BTC: ${btcPriceAtExpiration.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </Badge>
                  )}
                  {btcPriceError && (
                    <Badge variant="destructive" className="text-xs">
                      ⚠️ {btcPriceError}
                    </Badge>
                  )}
                </div>
                <Input 
                  id="strike_price"
                  type="number"
                  step="0.01"
                  placeholder={loadingBTCPrice ? "Recupero prezzo..." : "45000"}
                  value={formData.strike_price}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    strike_price: e.target.value
                  }))}
                  className="text-lg font-mono"
                  required={formData.option_status === 'filled'}
                  disabled={loadingBTCPrice}
                />
                <p className="text-xs text-muted-foreground">
                  💡 Prezzo recuperato automaticamente da CoinMarketCap per la data di scadenza
                </p>
              </div>

              {/* Alert se manca strike price */}
              {formData.btc_amount && !formData.strike_price && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Lo strike price è obbligatorio per calcolare il valore del trade
                  </AlertDescription>
                </Alert>
              )}

              {/* Quantità BTC */}
              <div>
                <Label htmlFor="btc_amount">Quantità BTC ricevuta/venduta</Label>
                <Input 
                  id="btc_amount" 
                  type="number" 
                  step="0.00000001" 
                  placeholder="0.02198456" 
                  value={formData.btc_amount} 
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    btc_amount: e.target.value
                  }))} 
                  required={formData.option_status === 'filled'}
                  className="font-mono"
                />
              </div>
              
              {/* Fill Price */}
              <div>
                <Label htmlFor="fill_price_usd">
                  Prezzo BTC eseguito 
                  <span className="text-xs text-muted-foreground ml-2">(opzionale)</span>
                </Label>
                <Input 
                  id="fill_price_usd" 
                  type="number" 
                  step="0.01" 
                  placeholder={btcPriceAtExpiration ? `Default: ${btcPriceAtExpiration.toFixed(2)}` : "45523.18"}
                  value={formData.fill_price_usd} 
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    fill_price_usd: e.target.value
                  }))}
                  className="font-mono"
                />
                {btcPriceAtExpiration && formData.fill_price_usd && (
                  <p className="text-xs mt-1 font-medium">
                    {parseFloat(formData.fill_price_usd) > btcPriceAtExpiration ? '📈 Sopra strike' : '📉 Sotto strike'}
                    {' - '}Differenza: ${Math.abs(parseFloat(formData.fill_price_usd) - btcPriceAtExpiration).toFixed(2)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Lascia vuoto per usare automaticamente lo strike price
                </p>
              </div>

              {/* Preview Calcolo FILLED */}
              {calculatedValue && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 p-4 rounded-lg border-2 border-green-500/30">
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
                  <div className="mt-4 pt-3 border-t border-green-500/20">
                    <div className="text-sm text-muted-foreground">Valore Totale Trade</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 font-mono">
                      ${calculatedValue.toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* SCENARIO 2: Opzione Scaduta OTM */}
            <TabsContent value="expired_otm" className="space-y-4 mt-4">
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border-2 border-blue-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-semibold">Opzione Non Fillata</div>
                    <div className="text-xs text-muted-foreground">
                      Tieni il premio dell'opzione venduta
                    </div>
                  </div>
                </div>

                {/* Premio ricevuto */}
                <div className="space-y-2">
                  <Label htmlFor="premium_received_usdt" className="text-base font-semibold">
                    Premio Ricevuto (USDT)
                  </Label>
                  <Input 
                    id="premium_received_usdt"
                    type="number"
                    step="0.01"
                    placeholder="Es: 150.00"
                    value={formData.premium_received_usdt}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      premium_received_usdt: e.target.value
                    }))}
                    className="text-lg font-mono"
                    required={formData.option_status === 'expired_otm'}
                  />
                  <p className="text-xs text-muted-foreground">
                    💰 Importo in USDT che hai ricevuto dalla vendita dell'opzione
                  </p>
                </div>

                {/* Strike Price per riferimento */}
                <div className="mt-3">
                  <Label htmlFor="strike_price_ref" className="text-sm">
                    Strike Price (riferimento)
                    <span className="text-xs text-muted-foreground ml-2">(opzionale)</span>
                  </Label>
                  <Input 
                    id="strike_price_ref"
                    type="number"
                    step="0.01"
                    placeholder="45000"
                    value={formData.strike_price}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      strike_price: e.target.value
                    }))}
                    className="font-mono"
                  />
                </div>

                {/* Preview Premio */}
                {formData.premium_received_usdt && (
                  <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">
                      Premio Totale Ricevuto
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                      ${parseFloat(formData.premium_received_usdt).toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })} USDT
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      ✅ Nessun movimento di BTC - Profitto netto dal premio
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Informazioni Strategia */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="text-sm font-semibold">Informazioni Strategia</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground text-xs">Valore Teorico</div>
                <div className="font-mono font-bold">
                  ${item.finalCapital.toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Rendimento Giornaliero</div>
                <div className={`font-mono font-bold ${item.dailyReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.dailyReturn >= 0 ? '+' : ''}{item.dailyReturn.toFixed(3)}%
                </div>
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <Label htmlFor="notes">Note (opzionale)</Label>
            <Textarea 
              id="notes"
              placeholder="Aggiungi note sul trade..."
              value={formData.notes}
              onChange={e => setFormData(prev => ({
                ...prev,
                notes: e.target.value
              }))}
              rows={3}
            />
          </div>

          <DialogFooter className="flex justify-between">
            {existingTrade && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Elimina Trade
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>⚠️ Conferma Eliminazione</AlertDialogTitle>
                    <AlertDialogDescription>
                      Vuoi eliminare definitivamente il trade del Giorno {item.day}?
                      Questa azione non può essere annullata.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={async () => {
                        try {
                          const { error } = await supabase
                            .from('actual_trades')
                            .delete()
                            .eq('id', existingTrade.id);
                          
                          if (error) throw error;
                          
                          toast({
                            title: "🗑️ Trade eliminato",
                            description: "Il trade è stato rimosso con successo"
                          });
                          
                          onTradeRecorded();
                          onOpenChange(false);
                        } catch (error) {
                          console.error('Error deleting trade:', error);
                          toast({
                            title: "Errore",
                            description: "Impossibile eliminare il trade",
                            variant: "destructive"
                          });
                        }
                      }}
                      className="bg-destructive text-destructive-foreground"
                    >
                      Elimina Definitivamente
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <div className="flex gap-2 ml-auto">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Annulla
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvataggio...' : (existingTrade ? '💾 Salva Modifiche' : '✅ Registra Trade')}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
