import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, TrendingUp, Save } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { PACConfig } from '@/types/investment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PACConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pacConfig: PACConfig;
  onSave: (config: Partial<PACConfig>) => void;
  currency?: 'EUR' | 'USD' | 'USDT';
  timeHorizon: number;
}

export const PACConfigDialog: React.FC<PACConfigDialogProps> = ({
  open,
  onOpenChange,
  pacConfig,
  onSave,
  currency = 'EUR',
  timeHorizon
}) => {
  const [localConfig, setLocalConfig] = React.useState<PACConfig>(pacConfig);

  React.useEffect(() => {
    setLocalConfig(pacConfig);
  }, [pacConfig, open]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setLocalConfig({ ...localConfig, startDate: date });
    }
  };

  const handleSave = () => {
    onSave(localConfig);
    onOpenChange(false);
  };

  // Calculate summary statistics
  const summary = useMemo(() => {
    const { amount, frequency, customDays } = localConfig;
    
    let paymentsPerYear = 0;
    let daysInterval = 1;
    
    switch (frequency) {
      case 'daily':
        paymentsPerYear = 365;
        daysInterval = 1;
        break;
      case 'weekly':
        paymentsPerYear = 52;
        daysInterval = 7;
        break;
      case 'monthly':
        paymentsPerYear = 12;
        daysInterval = 30;
        break;
      case 'custom':
        daysInterval = customDays || 1;
        paymentsPerYear = Math.floor(365 / daysInterval);
        break;
    }

    const totalPerYear = amount * paymentsPerYear;
    const totalPayments = Math.floor(timeHorizon / daysInterval);
    const totalAmount = amount * totalPayments;

    return {
      paymentsPerYear,
      totalPerYear,
      totalPayments,
      totalAmount,
      daysInterval
    };
  }, [localConfig, timeHorizon]);

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'USDT': return '₮';
      default: return '€';
    }
  };

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Configurazione PAC
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4 md:grid-cols-2">
          {/* Left Column - Configuration */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dialog-pac-amount">💰 Importo Rata</Label>
              <div className="relative">
                <Input
                  id="dialog-pac-amount"
                  type="number"
                  inputMode="decimal"
                  value={localConfig.amount}
                  onChange={(e) => setLocalConfig({ ...localConfig, amount: Number(e.target.value) })}
                  min={0}
                  step={10}
                  className="pr-12"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-sm text-muted-foreground">{currency}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>📅 Data di Inizio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localConfig.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localConfig.startDate ? (
                      format(localConfig.startDate, "PPP", { locale: it })
                    ) : (
                      <span>Seleziona una data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localConfig.startDate}
                    onSelect={handleDateChange}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dialog-pac-frequency">🔄 Frequenza</Label>
              <Select
                value={localConfig.frequency}
                onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'custom') =>
                  setLocalConfig({ ...localConfig, frequency: value })
                }
              >
                <SelectTrigger id="dialog-pac-frequency">
                  <SelectValue placeholder="Seleziona frequenza" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Giornaliero</SelectItem>
                  <SelectItem value="weekly">Settimanale</SelectItem>
                  <SelectItem value="monthly">Mensile</SelectItem>
                  <SelectItem value="custom">Personalizzato</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {localConfig.frequency === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="dialog-custom-days">📆 Giorni Personalizzati</Label>
                <Input
                  id="dialog-custom-days"
                  type="number"
                  value={localConfig.customDays || 1}
                  onChange={(e) => setLocalConfig({ ...localConfig, customDays: Number(e.target.value) })}
                  min={1}
                  max={365}
                  placeholder="Es: 7 per settimanale"
                />
                <p className="text-xs text-muted-foreground">
                  Ogni quanti giorni effettuare il versamento (1-365)
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-4">
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  📊 Riepilogo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Importo per versamento:</span>
                  <span className="font-semibold">
                    {getCurrencySymbol(currency)}{formatAmount(localConfig.amount)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Intervallo:</span>
                  <span className="font-semibold">
                    Ogni {summary.daysInterval} {summary.daysInterval === 1 ? 'giorno' : 'giorni'}
                  </span>
                </div>

                <div className="h-px bg-border my-2" />

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Versamenti/anno:</span>
                  <span className="font-semibold">{summary.paymentsPerYear}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Totale annuale:</span>
                  <span className="font-semibold text-primary">
                    {getCurrencySymbol(currency)}{formatAmount(summary.totalPerYear)}
                  </span>
                </div>

                <div className="h-px bg-border my-2" />

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Versamenti totali:</span>
                  <span className="font-semibold">{summary.totalPayments}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Investimento totale:</span>
                  <span className="font-semibold text-lg text-primary">
                    {getCurrencySymbol(currency)}{formatAmount(summary.totalAmount)}
                  </span>
                </div>

                <div className="h-px bg-border my-2" />

                <div className="p-2 bg-muted/50 rounded-md">
                  <p className="text-xs text-muted-foreground text-center">
                    Calcolato su {timeHorizon} giorni
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Salva Configurazione
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
