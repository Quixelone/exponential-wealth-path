import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { PACConfig } from '@/types/investment';
import PACPaymentModifier from './PACPaymentModifier';
import { PACPaymentTracker } from './PACPaymentTracker';

interface PACConfigurationProps {
  pacConfig: PACConfig;
  onPACConfigChange: (config: Partial<PACConfig>) => void;
  nextPACInfo?: { nextPACDay: number; description: string };
  currency?: 'EUR' | 'USD' | 'USDT';
  customReturns: { [day: number]: number };
  onUpdateDailyReturn: (day: number, returnRate: number) => void;
  onRemoveDailyReturn: (day: number) => void;
  dailyPACOverrides: { [day: number]: number };
  onUpdatePACForDay: (day: number, pacAmount: number | null) => void;
  onRemovePACOverride: (day: number) => void;
  configId?: string | null;
}

const PACConfiguration: React.FC<PACConfigurationProps> = ({
  pacConfig,
  onPACConfigChange,
  nextPACInfo,
  currency = 'EUR',
  customReturns,
  onUpdateDailyReturn,
  onRemoveDailyReturn,
  dailyPACOverrides,
  onUpdatePACForDay,
  onRemovePACOverride,
  configId
}) => {
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      onPACConfigChange({ startDate: date });
    }
  };

  return (
    <div className="space-y-6">
      {/* PAC Base Configuration */}
      <Card className="animate-fade-in border-primary/20" style={{ animationDelay: '0.2s' }}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Configurazione PAC (Piano di Accumulo del Capitale)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pac-amount">Importo Rata</Label>
            <div className="relative">
              <Input
                id="pac-amount"
                type="text"
                inputMode="decimal"
                value={pacConfig.amount}
                onChange={(e) => onPACConfigChange({ amount: Number(e.target.value) })}
                min={0}
                step={10}
                className="pr-12 touch-target text-base"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-sm text-muted-foreground">{currency}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data di Inizio</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal touch-target text-base",
                    !pacConfig.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {pacConfig.startDate ? (
                    format(pacConfig.startDate, "PPP", { locale: it })
                  ) : (
                    <span>Seleziona una data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={pacConfig.startDate ? pacConfig.startDate : undefined}
                  onSelect={handleDateChange}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Puoi selezionare date passate per analisi storiche o future per pianificazioni
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pac-frequency">Frequenza Versamenti</Label>
            <Select
              value={pacConfig.frequency}
              onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'custom') => 
                onPACConfigChange({ frequency: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Giornaliera</SelectItem>
                <SelectItem value="weekly">Settimanale</SelectItem>
                <SelectItem value="monthly">Mensile</SelectItem>
                <SelectItem value="custom">Personalizzata</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {pacConfig.frequency === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="pac-custom-days">Giorni Personalizzati (es: 1,15 per il 1° e 15 del mese)</Label>
              <Input
                id="pac-custom-days"
                type="text"
                inputMode="numeric"
                value={pacConfig.customDays?.toString() || ''}
                onChange={(e) => onPACConfigChange({ customDays: parseInt(e.target.value) || 0 })}
                placeholder="1,15,30"
                className="touch-target text-base"
              />
              <p className="text-xs text-muted-foreground">
                Inserisci i giorni del mese separati da virgola (es: 1,15 per versamenti il 1° e 15 di ogni mese)
              </p>
            </div>
          )}

          {nextPACInfo && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Prossimo versamento:</strong> {nextPACInfo.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PACPaymentModifier nascosto per problemi di usabilità */}

      {/* PAC Payment Tracker - Simple alert and checkbox system */}
      {pacConfig.amount > 0 && pacConfig.startDate && (
        <PACPaymentTracker
          config={{ 
            pacConfig,
            timeHorizon: 365, // Default time horizon for tracking
            initialCapital: 0,
            dailyReturnRate: 0,
            currency: 'EUR'
          }}
          configId={configId || undefined}
          dailyPACOverrides={dailyPACOverrides}
          onUpdatePACForDay={onUpdatePACForDay}
          onMarkPaymentComplete={(day, isComplete) => {
            console.log(`Marcatura versamento giorno ${day}: ${isComplete ? 'completato' : 'non completato'}`);
          }}
        />
      )}
    </div>
  );
};

export default PACConfiguration;