
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
    // Allow free typing - only update returnRate if it's a valid number
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setReturnRate(numValue);
    }
  };

  const handleReturnInputBlur = () => {
    const numValue = parseFloat(returnInputValue);
    if (isNaN(numValue)) {
      // Reset to current returnRate if invalid
      setReturnInputValue(returnRate.toString());
    } else {
      // Update both values to ensure consistency
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
      <DialogContent className="modernize-dialog max-w-2xl">
        <div className="modernize-dialog-header">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-slate-800">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            Modifica Giorno {item.day}
          </DialogTitle>
          <p className="text-slate-500 mt-1">{formatDate(item.date)}</p>
        </div>

        <div className="modernize-dialog-content space-y-6">
          {/* Current Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="modernize-stats-card">
              <div className="text-sm text-slate-500 mb-1">Capitale Iniziale</div>
              <div className="text-lg font-semibold text-slate-800">{formatCurrency(item.capitalBeforePAC, currency)}</div>
            </div>
            <div className="modernize-stats-card">
              <div className="text-sm text-slate-500 mb-1">Capitale Finale Attuale</div>
              <div className="text-lg font-semibold text-slate-800">{formatCurrency(item.finalCapital, currency)}</div>
            </div>
          </div>

          <div className="border-t border-slate-200"></div>

          {/* Return Rate Section */}
          <div className="modernize-form-section">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Percent className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Rendimento Giornaliero</h3>
                {item.isCustomReturn && (
                  <span className="modernize-badge modernize-badge-primary text-xs mt-1">Personalizzato</span>
                )}
              </div>
            </div>
            
            <div className="modernize-form-group">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="modernize-form-label">Percentuale (%)</Label>
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
                  <div className={`flex items-center gap-2 ${returnRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {returnRate >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="font-semibold">
                      {returnRate >= 0 ? '+' : ''}{formatCurrency(newDailyGain, currency)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Label className="modernize-form-label text-xs text-slate-500">Regola con il cursore</Label>
                <Slider
                  value={[returnRate]}
                  onValueChange={(value) => {
                    setReturnRate(value[0]);
                    setReturnInputValue(value[0].toString());
                  }}
                  min={-10}
                  max={10}
                  step={0.01}
                  className="w-full mt-2"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>-10%</span>
                  <span>0%</span>
                  <span>+10%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200"></div>

          {/* PAC Section */}
          <div className="modernize-form-section">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <PiggyBank className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Versamento PAC</h3>
                {item.isCustomPAC && (
                  <span className="modernize-badge modernize-badge-primary text-xs mt-1">Personalizzato</span>
                )}
              </div>
            </div>
            
            <div className="modernize-form-group">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="modernize-form-label">Importo ({currency})</Label>
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
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Differenza da default</div>
                    <div className={`text-sm font-semibold ${
                      pacDifference > 0 ? 'text-green-600' : 
                      pacDifference < 0 ? 'text-red-600' : 'text-slate-500'
                    }`}>
                      {pacDifference > 0 ? '+' : ''}{formatCurrency(pacDifference, currency)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-slate-500 mt-2">
                PAC predefinito: {formatCurrency(defaultPACAmount, currency)}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200"></div>

          {/* Preview Results */}
          <div className="modernize-form-section">
            <h3 className="font-semibold text-slate-800 mb-4">Anteprima Risultati</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="modernize-stats-card">
                <div className="text-xs text-slate-500 mb-1">Capitale Post-PAC</div>
                <div className="font-mono text-sm font-semibold">{formatCurrency(newCapitalAfterPAC, currency)}</div>
              </div>
              <div className="modernize-stats-card">
                <div className="text-xs text-slate-500 mb-1">Ricavo Giorno</div>
                <div className={`font-mono text-sm font-semibold ${newDailyGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(newDailyGain, currency)}
                </div>
              </div>
              <div className="modernize-stats-card">
                <div className="text-xs text-slate-500 mb-1">Capitale Finale</div>
                <div className="font-mono text-sm font-semibold text-slate-800">{formatCurrency(newFinalCapital, currency)}</div>
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
