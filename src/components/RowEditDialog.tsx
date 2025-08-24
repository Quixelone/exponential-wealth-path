
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Calendar, PiggyBank, Percent, Save, X } from 'lucide-react';
import { InvestmentData } from '@/types/investment';
import { formatCurrency, Currency } from '@/lib/utils';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

interface RowEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InvestmentData | null;
  currency: Currency;
  onUpdateDailyReturn: (day: number, newReturn: number) => void;
  onUpdatePAC: (day: number, newPAC: number) => void;
  defaultPACAmount: number;
  currentConfigId?: string | null;
  currentConfigName?: string;
  onSaveToStrategy?: () => Promise<void>;
}

const RowEditDialog: React.FC<RowEditDialogProps> = ({
  open,
  onOpenChange,
  item,
  currency,
  onUpdateDailyReturn,
  onUpdatePAC,
  defaultPACAmount,
  currentConfigId,
  currentConfigName,
  onSaveToStrategy
}) => {
  const [returnRate, setReturnRate] = useState<number>(0);
  const [pacAmount, setPacAmount] = useState<number>(0);
  const [returnRateInput, setReturnRateInput] = useState<string>('');
  const [pacAmountInput, setPacAmountInput] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);
  
  // Store the original config ID to use for saving even if it becomes null during modifications
  const [originalConfigId, setOriginalConfigId] = useState<string | null>(null);
  const [originalConfigName, setOriginalConfigName] = useState<string>('');

  // Debounced save per evitare salvataggi multipli - DEVE essere chiamato prima di qualsiasi early return
  const debouncedSave = useDebouncedCallback(async () => {
    if (!item) return;
    
    const hasReturnChange = Math.abs(returnRate - item.dailyReturn) > 0.001;
    const hasPacChange = Math.abs(pacAmount - item.pacAmount) > 0.01;
    
    console.log('🔄 RowEditDialog: Salvando modifiche giorno', item.day, {
      hasReturnChange,
      hasPacChange,
      originalConfigId,
      currentConfigId,
      originalConfigName
    });
    
    // Use the original config ID for saving, even if current one becomes null
    if (originalConfigId && onSaveToStrategy && (hasReturnChange || hasPacChange)) {
      try {
        console.log('✅ RowEditDialog: Usando ID strategia originale per il salvataggio:', originalConfigId);
        
        // Prima applica le modifiche ai dati in memoria
        if (hasReturnChange) {
          console.log('🔄 Applicando modifica rendimento:', returnRate);
          onUpdateDailyReturn(item.day, returnRate);
        }
        if (hasPacChange) {
          console.log('🔄 Applicando modifica PAC:', pacAmount);
          onUpdatePAC(item.day, pacAmount);
        }
        
        // Poi salva immediatamente la strategia
        await onSaveToStrategy();
        console.log('✅ Modifiche salvate automaticamente nella strategia:', originalConfigName);
      } catch (error) {
        console.error('❌ Errore salvando la strategia:', error);
      }
    } else if (hasReturnChange || hasPacChange) {
      // Se non c'è strategia attiva, applica solo le modifiche in memoria
      console.log('ℹ️ Nessuna strategia attiva, applicando solo modifiche in memoria');
      if (hasReturnChange) {
        onUpdateDailyReturn(item.day, returnRate);
      }
      if (hasPacChange) {
        onUpdatePAC(item.day, pacAmount);
      }
      console.log('ℹ️ Modifiche applicate in memoria - nessuna strategia attiva da aggiornare');
    }
  }, 500);

  useEffect(() => {
    if (item) {
      setReturnRate(item.dailyReturn);
      setPacAmount(item.pacAmount);
      setReturnRateInput(item.dailyReturn.toString());
      setPacAmountInput(item.pacAmount.toFixed(2));
      setHasChanges(false);
    }
  }, [item]);

  // Store original config info when dialog opens
  useEffect(() => {
    if (open) {
      setOriginalConfigId(currentConfigId);
      setOriginalConfigName(currentConfigName || '');
      console.log('🔄 RowEditDialog: Memorizzato ID strategia originale:', currentConfigId);
    }
  }, [open, currentConfigId, currentConfigName]);

  useEffect(() => {
    if (item) {
      const returnChanged = Math.abs(returnRate - item.dailyReturn) > 0.001;
      const pacChanged = Math.abs(pacAmount - item.pacAmount) > 0.01;
      setHasChanges(returnChanged || pacChanged);
    }
  }, [returnRate, pacAmount, item]);

  if (!item) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleSave = async () => {
    await debouncedSave();
    onOpenChange(false);
  };

  const handleReturnRateInputChange = (value: string) => {
    setReturnRateInput(value);
    // Permetti input temporanei come "0", "0.", "-0.5", etc.
    if (value === '' || value === '0' || value === '-0' || value.endsWith('.') || value.endsWith(',')) {
      return;
    }
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setReturnRate(numValue);
    }
  };

  const handleReturnRateInputBlur = () => {
    const numValue = parseFloat(returnRateInput);
    if (isNaN(numValue)) {
      setReturnRateInput(returnRate.toString());
    } else {
      setReturnRate(numValue);
      setReturnRateInput(numValue.toString());
    }
  };

  const handlePacAmountInputChange = (value: string) => {
    setPacAmountInput(value);
    // Permetti input temporanei come "0", "0.", "0.5", etc.
    if (value === '' || value === '0' || value.endsWith('.') || value.endsWith(',')) {
      return;
    }
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setPacAmount(numValue);
    }
  };

  const handlePacAmountInputBlur = () => {
    const numValue = parseFloat(pacAmountInput);
    if (isNaN(numValue) || numValue < 0) {
      setPacAmountInput(pacAmount.toFixed(2));
    } else {
      setPacAmount(numValue);
      setPacAmountInput(numValue.toFixed(2));
    }
  };

  const handleCancel = () => {
    setReturnRate(item.dailyReturn);
    setPacAmount(item.pacAmount);
    setReturnRateInput(item.dailyReturn.toString());
    setPacAmountInput(item.pacAmount.toFixed(2));
    setHasChanges(false);
    onOpenChange(false);
  };

  // Calcolo preview dei risultati
  const newCapitalAfterPAC = item.capitalBeforePAC + pacAmount;
  const newDailyGain = newCapitalAfterPAC * (returnRate / 100);
  const newFinalCapital = newCapitalAfterPAC + newDailyGain;
  const pacDifference = pacAmount - defaultPACAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-6 w-6 text-primary" />
            Modifica Giorno {item.day}
          </DialogTitle>
          <p className="text-muted-foreground">{formatDate(item.date)}</p>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 px-1">
          {/* Informazioni attuali */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Capitale Iniziale</Label>
              <p className="text-lg font-mono">{formatCurrency(item.capitalBeforePAC, currency)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Capitale Finale Attuale</Label>
              <p className="text-lg font-mono">{formatCurrency(item.finalCapital, currency)}</p>
            </div>
          </div>

          <Separator />

          {/* Modifica Rendimento */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" />
              <Label className="text-base font-medium">Rendimento Giornaliero</Label>
              {item.isCustomReturn && (
                <Badge variant="secondary" className="text-xs">Personalizzato</Badge>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="return-input" className="text-sm">Percentuale (%)</Label>
                  <Input
                    id="return-input"
                    type="text"
                    inputMode="decimal"
                    value={returnRateInput}
                    onChange={(e) => handleReturnRateInputChange(e.target.value)}
                    onBlur={handleReturnRateInputBlur}
                    placeholder="Es: 0.500"
                    className="font-mono"
                  />
                </div>
                <div className="flex items-end">
                  <div className={`flex items-center gap-1 ${returnRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {returnRate >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="font-medium">
                      {returnRate >= 0 ? '+' : ''}{formatCurrency(newDailyGain, currency)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Regola con il cursore</Label>
                <Slider
                  value={[returnRate]}
                  onValueChange={(value) => {
                    setReturnRate(value[0]);
                    setReturnRateInput(value[0].toString());
                  }}
                  min={-10}
                  max={10}
                  step={0.01}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>-10%</span>
                  <span>0%</span>
                  <span>+10%</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Modifica PAC */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-primary" />
              <Label className="text-base font-medium">Versamento PAC</Label>
              {item.isCustomPAC && (
                <Badge variant="secondary" className="text-xs">Personalizzato</Badge>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pac-input" className="text-sm">Importo ({currency})</Label>
                  <Input
                    id="pac-input"
                    type="text"
                    inputMode="decimal"
                    value={pacAmountInput}
                    onChange={(e) => handlePacAmountInputChange(e.target.value)}
                    onBlur={handlePacAmountInputBlur}
                    placeholder="Es: 100.00"
                    className="font-mono"
                  />
                </div>
                <div className="flex items-end">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Differenza da default</Label>
                    <div className={`text-sm font-medium ${
                      pacDifference > 0 ? 'text-green-600' : 
                      pacDifference < 0 ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                      {pacDifference > 0 ? '+' : ''}{formatCurrency(pacDifference, currency)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                PAC predefinito: {formatCurrency(defaultPACAmount, currency)}
              </div>
            </div>
          </div>

          <Separator />

          {/* Preview Risultati */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Anteprima Risultati</Label>
            <div className="grid grid-cols-3 gap-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div>
                <Label className="text-sm text-muted-foreground">Capitale Post-PAC</Label>
                <p className="font-mono text-sm">{formatCurrency(newCapitalAfterPAC, currency)}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Ricavo Giorno</Label>
                <p className={`font-mono text-sm ${newDailyGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(newDailyGain, currency)}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Capitale Finale</Label>
                <p className="font-mono text-sm font-semibold">{formatCurrency(newFinalCapital, currency)}</p>
              </div>
            </div>
          </div>

        </div>
        
        {/* Sticky footer with actions */}
        <div className="flex-shrink-0 border-t border-border pt-4 mt-4">
          {originalConfigId && originalConfigName && (
            <div className="mb-3 p-2 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Stai modificando la strategia: <span className="font-medium text-primary">{originalConfigName}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Le modifiche verranno salvate automaticamente nella strategia esistente
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="w-full sm:w-auto touch-target"
            >
              <X className="h-4 w-4 mr-2" />
              Annulla
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 touch-target"
            >
              <Save className="h-4 w-4 mr-2" />
              <span className="sm:hidden">
                {hasChanges ? (originalConfigId ? 'Aggiorna Strategia' : 'Salva') : 'Nessuna Modifica'}
              </span>
              <span className="hidden sm:inline">
                {hasChanges ? (originalConfigId ? 'Aggiorna Strategia' : 'Salva Modifiche') : 'Nessuna Modifica'}
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RowEditDialog;
