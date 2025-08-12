
import React, { useMemo, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Plus, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StrategyQuickParams = {
  initialCapital: number;
  timeHorizon: number; // days
  dailyReturnRate: number; // percentage per day
  pacAmount: number;
  pacFrequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  pacCustomDays?: number;
  pacStartDate: Date;
};

interface NewStrategyWizardProps {
  onCreate: (payload: {
    name: string;
    copyFromCurrent: boolean;
    currency: 'EUR' | 'USD' | 'USDT';
    params?: StrategyQuickParams;
  }) => void;
  hasCurrentConfig: boolean;
  currentConfigName: string;
}

const currencyStorageKey = 'wc:lastCurrency';

const NewStrategyWizard: React.FC<NewStrategyWizardProps> = ({ onCreate, hasCurrentConfig, currentConfigName }) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'empty' | 'copy'>('empty');
  const [currency, setCurrency] = useState<'EUR' | 'USD' | 'USDT'>('EUR');

  // Quick params (step 2)
  const [params, setParams] = useState<StrategyQuickParams>({
    initialCapital: 1000,
    timeHorizon: 365,
    dailyReturnRate: 0.1,
    pacAmount: 100,
    pacFrequency: 'monthly',
    pacCustomDays: undefined,
    pacStartDate: new Date(),
  });

  useEffect(() => {
    // Load last used currency
    const saved = localStorage.getItem(currencyStorageKey) as 'EUR' | 'USD' | 'USDT' | null;
    if (saved) setCurrency(saved);
  }, []);

  const canContinue = useMemo(() => name.trim().length > 0, [name]);

  const resetState = () => {
    setStep(1);
    setName('');
    setMode('empty');
    setParams({
      initialCapital: 1000,
      timeHorizon: 365,
      dailyReturnRate: 0.1,
      pacAmount: 100,
      pacFrequency: 'monthly',
      pacCustomDays: undefined,
      pacStartDate: new Date(),
    });
  };

  const handleNext = () => {
    if (!canContinue) return;

    if (mode === 'copy') {
      // Directly create by copying current configuration (currency is kept from copied one)
      onCreate({ name: name.trim(), copyFromCurrent: true, currency });
      setOpen(false);
      resetState();
      return;
    }

    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleCreate = () => {
    if (!canContinue) return;
    // Persist last currency
    try { localStorage.setItem(currencyStorageKey, currency); } catch {}

    onCreate({ name: name.trim(), copyFromCurrent: false, currency, params });
    setOpen(false);
    resetState();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetState(); }}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuova Strategia (Wizard)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{step === 1 ? 'Crea nuova strategia' : 'Parametri rapidi'}</span>
            <div className="text-xs text-muted-foreground">Step {step} di 2</div>
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="strategy-name">Nome</Label>
              <Input
                id="strategy-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Es: Strategia aggressiva"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency-select">Valuta</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as any)} disabled={mode === 'copy'}>
                <SelectTrigger id="currency-select">
                  <SelectValue placeholder="Seleziona valuta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="USDT">Tether (USDT)</SelectItem>
                </SelectContent>
              </Select>
              {mode === 'copy' && (
                <p className="text-xs text-muted-foreground">La valuta verrà mantenuta uguale alla strategia copiata.</p>
              )}
            </div>

            {hasCurrentConfig && (
              <div className="space-y-3">
                <Label>Punto di partenza</Label>
                <RadioGroup value={mode} onValueChange={(v) => setMode(v as any)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="empty" id="empty" />
                    <Label htmlFor="empty">Inizia da zero (Wizard in 2 step)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="copy" id="copy" />
                    <Label htmlFor="copy">Copia da "{currentConfigName}"</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">Le modifiche non salvate della configurazione corrente andranno perse.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setOpen(false); }}>
                Annulla
              </Button>
              <Button onClick={handleNext} disabled={!canContinue}>
                {mode === 'copy' ? (
                  <span className="flex items-center gap-2">Crea copiando</span>
                ) : (
                  <span className="flex items-center gap-2">Avanti <ChevronRight className="h-4 w-4" /></span>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Capitale iniziale</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={params.initialCapital}
                  onChange={(e) => setParams((p) => ({ ...p, initialCapital: Number(e.target.value || 0) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Orizzonte (giorni)</Label>
                <Input
                  type="number"
                  value={params.timeHorizon}
                  onChange={(e) => setParams((p) => ({ ...p, timeHorizon: Math.max(1, Number(e.target.value || 1)) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Rendimento giornaliero (%)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={params.dailyReturnRate}
                  onChange={(e) => setParams((p) => ({ ...p, dailyReturnRate: Number(e.target.value || 0) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Importo PAC</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={params.pacAmount}
                  onChange={(e) => setParams((p) => ({ ...p, pacAmount: Number(e.target.value || 0) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frequenza PAC</Label>
                <Select
                  value={params.pacFrequency}
                  onValueChange={(v) => setParams((p) => ({ ...p, pacFrequency: v as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Giornaliera</SelectItem>
                    <SelectItem value="weekly">Settimanale</SelectItem>
                    <SelectItem value="monthly">Mensile</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {params.pacFrequency === 'custom' && (
                <div className="space-y-2">
                  <Label>Ogni N giorni</Label>
                  <Input
                    type="number"
                    value={params.pacCustomDays ?? 1}
                    onChange={(e) => setParams((p) => ({ ...p, pacCustomDays: Math.max(1, Number(e.target.value || 1)) }))}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Data inizio PAC</Label>
              <div className={cn('rounded-md border p-3')}> 
                <Calendar
                  mode="single"
                  selected={params.pacStartDate}
                  onSelect={(d) => d && setParams((p) => ({ ...p, pacStartDate: d }))}
                  initialFocus
                />
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" /> Indietro
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setOpen(false); resetState(); }}>Annulla</Button>
                <Button onClick={handleCreate}>Crea strategia</Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewStrategyWizard;
