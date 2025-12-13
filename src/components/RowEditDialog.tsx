
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Calendar, PiggyBank, Percent, Save, X } from 'lucide-react';
import { InvestmentData } from '@/types/investment';
import { formatCurrency, Currency } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  const [returnRate, setReturnRate] = useState<number>(0);
  const [pacAmount, setPacAmount] = useState<number>(0);
  const [returnRateInput, setReturnRateInput] = useState<string>('');
  const [pacAmountInput, setPacAmountInput] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);
  
  const [originalConfigId, setOriginalConfigId] = useState<string | null>(null);
  const [originalConfigName, setOriginalConfigName] = useState<string>('');

  const stableOnUpdateDailyReturn = useCallback(onUpdateDailyReturn, [onUpdateDailyReturn]);
  const stableOnUpdatePAC = useCallback(onUpdatePAC, [onUpdatePAC]);

  const configData = useMemo(() => ({
    currentConfigId,
    currentConfigName: currentConfigName || '',
    originalConfigId,
    originalConfigName
  }), [currentConfigId, currentConfigName, originalConfigId, originalConfigName]);

  const applyChanges = useCallback(() => {
    if (!item) return;
    
    const hasReturnChange = Math.abs(returnRate - item.dailyReturn) > 0.001;
    const hasPacChange = Math.abs(pacAmount - item.pacAmount) > 0.01;
    
    if (hasReturnChange || hasPacChange) {
      if (hasReturnChange) {
        stableOnUpdateDailyReturn(item.day, returnRate);
      }
      if (hasPacChange) {
        stableOnUpdatePAC(item.day, pacAmount);
      }
    }
  }, [item, returnRate, pacAmount, stableOnUpdateDailyReturn, stableOnUpdatePAC]);

  useEffect(() => {
    if (item) {
      setReturnRate(item.dailyReturn);
      setPacAmount(item.pacAmount);
      setReturnRateInput(item.dailyReturn.toString());
      setPacAmountInput(item.pacAmount.toFixed(2));
      setHasChanges(false);
    }
  }, [item]);

  useEffect(() => {
    if (open) {
      setOriginalConfigId(configData.currentConfigId);
      setOriginalConfigName(configData.currentConfigName);
    }
  }, [open, configData.currentConfigId, configData.currentConfigName]);

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

  const handleSave = () => {
    applyChanges();
    onOpenChange(false);
  };

  // Solo aggiorna l'input string - NON lo stato numerico durante la digitazione
  const handleReturnRateInputChange = useCallback((value: string) => {
    // Normalizza virgola in punto per input italiano
    const normalizedValue = value.replace(',', '.');
    setReturnRateInput(normalizedValue);
  }, []);

  // Aggiorna lo stato numerico solo al blur per evitare freeze su mobile
  const handleReturnRateInputBlur = useCallback(() => {
    const numValue = parseFloat(returnRateInput);
    if (isNaN(numValue)) {
      setReturnRateInput(returnRate.toString());
    } else {
      setReturnRate(numValue);
      setReturnRateInput(numValue.toString());
    }
  }, [returnRateInput, returnRate]);

  // Solo aggiorna l'input string - NON lo stato numerico durante la digitazione
  const handlePacAmountInputChange = useCallback((value: string) => {
    // Normalizza virgola in punto per input italiano
    const normalizedValue = value.replace(',', '.');
    setPacAmountInput(normalizedValue);
  }, []);

  // Aggiorna lo stato numerico solo al blur per evitare freeze su mobile
  const handlePacAmountInputBlur = useCallback(() => {
    const numValue = parseFloat(pacAmountInput);
    if (isNaN(numValue) || numValue < 0) {
      setPacAmountInput(pacAmount.toFixed(2));
    } else {
      setPacAmount(numValue);
      setPacAmountInput(numValue.toFixed(2));
    }
  }, [pacAmountInput, pacAmount]);

  const handleCancel = () => {
    setReturnRate(item.dailyReturn);
    setPacAmount(item.pacAmount);
    setReturnRateInput(item.dailyReturn.toString());
    setPacAmountInput(item.pacAmount.toFixed(2));
    setHasChanges(false);
    onOpenChange(false);
  };

  const newCapitalAfterPAC = item.capitalBeforePAC + pacAmount;
  const newDailyGain = newCapitalAfterPAC * (returnRate / 100);
  const newFinalCapital = newCapitalAfterPAC + newDailyGain;
  const pacDifference = pacAmount - defaultPACAmount;

  // Componente campi input - mostrato per primo su mobile
  const InputFields = () => (
    <>
      {/* Modifica Rendimento */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Percent className="h-5 w-5 text-primary" />
          <Label className="text-base font-medium">Rendimento Giornaliero</Label>
          {item.isCustomReturn && (
            <Badge variant="secondary" className="text-xs">Personalizzato</Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
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
                className="font-mono touch-target text-base"
              />
            </div>
            <div className="flex items-end">
              <div className={`flex items-center gap-1 ${returnRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {returnRate >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="font-medium text-sm">
                  {returnRate >= 0 ? '+' : ''}{formatCurrency(newDailyGain, currency)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Regola con il cursore</Label>
            <Slider
              value={[returnRate]}
              onValueCommit={(value) => {
                setReturnRate(value[0]);
                setReturnRateInput(value[0].toString());
              }}
              min={-10}
              max={10}
              step={0.1}
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
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-primary" />
          <Label className="text-base font-medium">Versamento PAC</Label>
          {item.isCustomPAC && (
            <Badge variant="secondary" className="text-xs">Personalizzato</Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
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
                className="font-mono touch-target text-base"
              />
            </div>
            <div className="flex items-end">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Diff. da default</Label>
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
    </>
  );

  // Componente info capitale
  const CapitalInfo = () => (
    <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg">
      <div>
        <Label className="text-xs font-medium text-muted-foreground">Capitale Iniziale</Label>
        <p className="text-sm font-mono">{formatCurrency(item.capitalBeforePAC, currency)}</p>
      </div>
      <div>
        <Label className="text-xs font-medium text-muted-foreground">Capitale Finale Attuale</Label>
        <p className="text-sm font-mono">{formatCurrency(item.finalCapital, currency)}</p>
      </div>
    </div>
  );

  // Preview risultati
  const ResultsPreview = () => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Anteprima Risultati</Label>
      <div className="grid grid-cols-3 gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <div>
          <Label className="text-xs text-muted-foreground">Post-PAC</Label>
          <p className="font-mono text-xs">{formatCurrency(newCapitalAfterPAC, currency)}</p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Ricavo</Label>
          <p className={`font-mono text-xs ${newDailyGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(newDailyGain, currency)}
          </p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Finale</Label>
          <p className="font-mono text-xs font-semibold">{formatCurrency(newFinalCapital, currency)}</p>
        </div>
      </div>
    </div>
  );

  // Footer con pulsanti
  const ActionButtons = ({ className = '' }: { className?: string }) => (
    <div className={className}>
      {originalConfigId && originalConfigName && (
        <div className="mb-3 p-2 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Strategia: <span className="font-medium text-primary">{originalConfigName}</span>
          </p>
        </div>
      )}
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={handleCancel}
          className="flex-1 touch-target"
        >
          <X className="h-4 w-4 mr-2" />
          Annulla
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges}
          className="flex-1 bg-primary hover:bg-primary/90 touch-target"
        >
          <Save className="h-4 w-4 mr-2" />
          {hasChanges ? 'Applica' : 'Nessuna Modifica'}
        </Button>
      </div>
    </div>
  );

  // Mobile: usa Drawer (bottom sheet)
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5 text-primary" />
              Modifica Giorno {item.day}
            </DrawerTitle>
            <DrawerDescription className="text-xs text-muted-foreground">
              {formatDate(item.date)}
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="px-4 pb-2 space-y-3 overflow-y-auto flex-1" style={{ maxHeight: 'calc(85vh - 200px)' }}>
            {/* Su mobile: campi input PRIMA per essere visibili con tastiera */}
            <InputFields />
            
            <Separator />
            
            {/* Info capitale e preview dopo */}
            <CapitalInfo />
            <ResultsPreview />
          </div>
          
          <DrawerFooter className="pt-2">
            <ActionButtons />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: usa Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-6 w-6 text-primary" />
            Modifica Giorno {item.day}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {formatDate(item.date)} - Modifica i parametri di rendimento e PAC per questo giorno specifico.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
          {/* Desktop: info prima, poi campi */}
          <CapitalInfo />
          
          <Separator />
          
          <InputFields />

          <Separator />

          <ResultsPreview />
        </div>
      
        <div className="border-t border-border pt-4 mt-2">
          {originalConfigId && originalConfigName && (
            <div className="mb-3 p-2 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Strategia attiva: <span className="font-medium text-primary">{originalConfigName}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Le modifiche saranno applicate alla configurazione. Usa il pulsante "Salva" nella configurazione per salvare su Supabase.
              </p>
            </div>
          )}
          
          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={handleCancel}
            >
              <X className="h-4 w-4 mr-2" />
              Annulla
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="h-4 w-4 mr-2" />
              {hasChanges ? 'Applica e Salva' : 'Nessuna Modifica'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RowEditDialog;
