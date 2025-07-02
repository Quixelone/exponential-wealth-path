
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Calendar, PiggyBank, Percent, Save, X, Sparkles } from 'lucide-react';
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
      <DialogContent className="modernize-dialog max-w-4xl animate-modernize-scale-in">
        <div className="modernize-dialog-header">
          <DialogTitle className="flex items-center gap-4 text-2xl font-bold text-slate-800">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Modifica Giorno {item.day}
              </h2>
              <p className="text-slate-500 text-base font-medium mt-1">{formatDate(item.date)}</p>
            </div>
          </DialogTitle>
        </div>

        <div className="modernize-dialog-content space-y-10">
          {/* Premium Current Info Cards */}
          <div className="grid grid-cols-2 gap-6">
            <div className="modernize-stats-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Capitale Iniziale</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    {formatCurrency(item.capitalBeforePAC, currency)}
                  </div>
                </div>
              </div>
            </div>
            <div className="modernize-stats-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Capitale Finale Attuale</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    {formatCurrency(item.finalCapital, currency)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

          {/* Premium Return Rate Section */}
          <div className="modernize-form-section">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Percent className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Rendimento Giornaliero</h3>
                <p className="text-slate-500 mt-1">Personalizza il rendimento per questo giorno specifico</p>
                {item.isCustomReturn && (
                  <span className="modernize-badge modernize-badge-primary mt-2 inline-flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Personalizzato
                  </span>
                )}
              </div>
            </div>
            
            <div className="modernize-form-group">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="modernize-form-label text-base">Percentuale (%)</Label>
                  <Input
                    type="text"
                    value={returnInputValue}
                    onChange={(e) => handleReturnInputChange(e.target.value)}
                    onBlur={handleReturnInputBlur}
                    className="modernize-input text-lg font-mono h-14"
                    placeholder="0.000"
                  />
                </div>
                <div className="flex items-end">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 w-full">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Ricavo Stimato</div>
                    <div className={`flex items-center gap-3 text-2xl font-bold ${
                      returnRate >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {returnRate >= 0 ? 
                        <TrendingUp className="h-6 w-6" /> : 
                        <TrendingDown className="h-6 w-6" />
                      }
                      <span>
                        {returnRate >= 0 ? '+' : ''}{formatCurrency(newDailyGain, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Label className="modernize-form-label text-base mb-4 block">Regola con il cursore</Label>
                <div className="px-4">
                  <Slider
                    value={[returnRate]}
                    onValueChange={(value) => {
                      setReturnRate(value[0]);
                      setReturnInputValue(value[0].toString());
                    }}
                    min={-10}
                    max={10}
                    step={0.01}
                    className="w-full h-3"
                  />
                  <div className="flex justify-between text-sm font-semibold text-slate-400 mt-3">
                    <span>-10%</span>
                    <span>0%</span>
                    <span>+10%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

          {/* Premium PAC Section */}
          <div className="modernize-form-section">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <PiggyBank className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Versamento PAC</h3>
                <p className="text-slate-500 mt-1">Modifica l'importo del versamento per questo giorno</p>
                {item.isCustomPAC && (
                  <span className="modernize-badge modernize-badge-success mt-2 inline-flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Personalizzato
                  </span>
                )}
              </div>
            </div>
            
            <div className="modernize-form-group">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="modernize-form-label text-base">Importo ({currency})</Label>
                  <Input
                    type="number"
                    value={pacAmount.toFixed(2)}
                    onChange={(e) => setPacAmount(Number(e.target.value))}
                    min={0}
                    step={1}
                    className="modernize-input text-lg font-mono h-14"
                  />
                </div>
                <div className="flex items-end">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 w-full">
                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Differenza da Default</div>
                    <div className={`text-2xl font-bold ${
                      pacDifference > 0 ? 'text-green-600' : 
                      pacDifference < 0 ? 'text-red-600' : 'text-slate-500'
                    }`}>
                      {pacDifference > 0 ? '+' : ''}{formatCurrency(pacDifference, currency)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-sm font-semibold text-blue-800">
                  💡 PAC predefinito: {formatCurrency(defaultPACAmount, currency)}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

          {/* Premium Preview Results */}
          <div className="modernize-form-section">
            <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              Anteprima Risultati
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="modernize-stats-card bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                <div className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Capitale Post-PAC</div>
                <div className="text-xl font-bold text-blue-800 font-mono">{formatCurrency(newCapitalAfterPAC, currency)}</div>
              </div>
              <div className="modernize-stats-card bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-200">
                <div className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-2">Ricavo Giorno</div>
                <div className={`text-xl font-bold font-mono ${newDailyGain >= 0 ? 'text-emerald-800' : 'text-red-600'}`}>
                  {formatCurrency(newDailyGain, currency)}
                </div>
              </div>
              <div className="modernize-stats-card bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200">
                <div className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-2">Capitale Finale</div>
                <div className="text-xl font-bold text-purple-800 font-mono">{formatCurrency(newFinalCapital, currency)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="modernize-dialog-footer">
          <Button variant="outline" onClick={handleCancel} className="modernize-btn-secondary h-12 px-8">
            <X className="h-4 w-4 mr-2" />
            Annulla
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges}
            className="modernize-btn-primary h-12 px-8"
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
