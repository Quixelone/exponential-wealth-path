
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Calendar, PiggyBank, Percent, Save, X, Info } from 'lucide-react';
import { InvestmentData } from '@/types/investment';
import { formatCurrency, Currency } from '@/lib/utils';

interface RowEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InvestmentData | null;
  currency: Currency;
  onUpdateDailyReturn: (day: number, newReturn: number) => void;
  onUpdatePAC: (day: number, newPAC: number) => void;
  defaultPACAmount: number;
}

const RowEditDialog: React.FC<RowEditDialogProps> = ({
  open,
  onOpenChange,
  item,
  currency,
  onUpdateDailyReturn,
  onUpdatePAC,
  defaultPACAmount
}) => {
  const [returnRate, setReturnRate] = useState<number>(0);
  const [returnInputValue, setReturnInputValue] = useState<string>('');
  const [pacAmount, setPacAmount] = useState<number>(0);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (item) {
      setReturnRate(item.dailyReturn);
      setReturnInputValue(item.dailyReturn.toString());
      setPacAmount(item.pacAmount);
      setHasChanges(false);
    }
  }, [item]);

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
    if (Math.abs(returnRate - item.dailyReturn) > 0.001) {
      onUpdateDailyReturn(item.day, returnRate);
    }
    if (Math.abs(pacAmount - item.pacAmount) > 0.01) {
      onUpdatePAC(item.day, pacAmount);
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    setReturnRate(item.dailyReturn);
    setReturnInputValue(item.dailyReturn.toString());
    setPacAmount(item.pacAmount);
    setHasChanges(false);
    onOpenChange(false);
  };

  const handleReturnInputChange = (value: string) => {
    setReturnInputValue(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setReturnRate(numValue);
    }
  };

  const handleReturnInputBlur = () => {
    const numValue = parseFloat(returnInputValue);
    if (isNaN(numValue)) {
      setReturnInputValue(returnRate.toString());
    } else {
      setReturnRate(numValue);
      setReturnInputValue(numValue.toString());
    }
  };

  // Preview calculations
  const newCapitalAfterPAC = item.capitalBeforePAC + pacAmount;
  const newDailyGain = newCapitalAfterPAC * (returnRate / 100);
  const newFinalCapital = newCapitalAfterPAC + newDailyGain;
  const pacDifference = pacAmount - defaultPACAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modernize-dialog max-w-3xl">
        <div className="modernize-dialog-header">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Modifica Giorno {item.day}
              </h2>
              <p className="text-slate-500 text-sm font-normal mt-1">{formatDate(item.date)}</p>
            </div>
          </DialogTitle>
        </div>

        <div className="modernize-dialog-content space-y-6">
          {/* Current Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="modernize-stats-card">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Info className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Capitale Iniziale</div>
                  <div className="text-lg font-bold text-slate-900">
                    {formatCurrency(item.capitalBeforePAC, currency)}
                  </div>
                </div>
              </div>
            </div>
            <div className="modernize-stats-card">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Capitale Finale Attuale</div>
                  <div className="text-lg font-bold text-slate-900">
                    {formatCurrency(item.finalCapital, currency)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Return Rate Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Percent className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Rendimento Giornaliero</h3>
                <p className="text-slate-500 text-sm">Personalizza il rendimento per questo giorno specifico</p>
                {item.isCustomReturn && (
                  <Badge className="modernize-badge-primary mt-1">
                    Personalizzato
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700">Percentuale (%)</Label>
                <Input
                  type="text"
                  value={returnInputValue}
                  onChange={(e) => handleReturnInputChange(e.target.value)}
                  onBlur={handleReturnInputBlur}
                  className="modernize-input font-mono"
                  placeholder="0.000"
                />
              </div>
              <div className="flex items-end">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 w-full">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Ricavo Stimato</div>
                  <div className={`flex items-center gap-2 text-lg font-bold ${
                    returnRate >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {returnRate >= 0 ? 
                      <TrendingUp className="h-4 w-4" /> : 
                      <TrendingDown className="h-4 w-4" />
                    }
                    <span>
                      {returnRate >= 0 ? '+' : ''}{formatCurrency(newDailyGain, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">Regola con il cursore</Label>
              <div className="px-2">
                <Slider
                  value={[returnRate]}
                  onValueChange={(value) => {
                    setReturnRate(value[0]);
                    setReturnInputValue(value[0].toString());
                  }}
                  min={-10}
                  max={10}
                  step={0.01}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>-10%</span>
                  <span>0%</span>
                  <span>+10%</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* PAC Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <PiggyBank className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Versamento PAC</h3>
                <p className="text-slate-500 text-sm">Modifica l'importo del versamento per questo giorno</p>
                {item.isCustomPAC && (
                  <Badge className="modernize-badge-success mt-1">
                    Personalizzato
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700">Importo ({currency})</Label>
                <Input
                  type="number"
                  value={pacAmount.toFixed(2)}
                  onChange={(e) => setPacAmount(Number(e.target.value))}
                  min={0}
                  step={1}
                  className="modernize-input font-mono"
                />
              </div>
              <div className="flex items-end">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 w-full">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Differenza da Default</div>
                  <div className={`text-lg font-bold ${
                    pacDifference > 0 ? 'text-green-600' : 
                    pacDifference < 0 ? 'text-red-600' : 'text-slate-500'
                  }`}>
                    {pacDifference > 0 ? '+' : ''}{formatCurrency(pacDifference, currency)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-800">
                💡 PAC predefinito: {formatCurrency(defaultPACAmount, currency)}
              </div>
            </div>
          </div>

          <Separator />

          {/* Preview Results */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Anteprima Risultati
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="modernize-stats-card bg-blue-50 border-blue-200">
                <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Capitale Post-PAC</div>
                <div className="text-lg font-bold text-blue-800 font-mono">{formatCurrency(newCapitalAfterPAC, currency)}</div>
              </div>
              <div className="modernize-stats-card bg-green-50 border-green-200">
                <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Ricavo Giorno</div>
                <div className={`text-lg font-bold font-mono ${newDailyGain >= 0 ? 'text-green-800' : 'text-red-600'}`}>
                  {formatCurrency(newDailyGain, currency)}
                </div>
              </div>
              <div className="modernize-stats-card bg-purple-50 border-purple-200">
                <div className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">Capitale Finale</div>
                <div className="text-lg font-bold text-purple-800 font-mono">{formatCurrency(newFinalCapital, currency)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="modernize-dialog-footer">
          <Button variant="outline" onClick={handleCancel} className="modernize-btn-secondary">
            <X className="h-4 w-4 mr-2" />
            Annulla
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges}
            className="modernize-btn-primary"
          >
            <Save className="h-4 w-4 mr-2" />
            {hasChanges ? 'Salva Modifiche' : 'Nessuna Modifica'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RowEditDialog;
