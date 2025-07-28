
import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Settings, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { PACConfig } from '@/types/investment';

interface PACConfigurationProps {
  pacConfig: PACConfig;
  onPACConfigChange: (config: Partial<PACConfig>) => void;
  nextPACInfo?: { nextPACDay: number; description: string };
}

const PACConfiguration: React.FC<PACConfigurationProps> = ({
  pacConfig,
  onPACConfigChange,
  nextPACInfo
}) => {
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      // Normalizza sempre la data a 00:00:00
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);
      onPACConfigChange({ startDate: normalizedDate });
    }
  };

  const startDate = typeof pacConfig.startDate === 'string' 
    ? new Date(pacConfig.startDate) 
    : pacConfig.startDate;

  return (
    <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5 text-primary" />
          Piano di Accumulo (PAC)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pac-amount">Importo Rata</Label>
          <Input
            id="pac-amount"
            type="number"
            value={pacConfig.amount}
            onChange={(e) => onPACConfigChange({ amount: Number(e.target.value) })}
            min={0}
            step={10}
          />
        </div>

        <div className="space-y-2">
          <Label>Data di Inizio</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd/MM/yyyy") : <span>Seleziona data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
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
            <Label htmlFor="custom-days">Ogni N giorni</Label>
            <Input
              id="custom-days"
              type="number"
              value={pacConfig.customDays || 10}
              onChange={(e) => onPACConfigChange({ customDays: Number(e.target.value) })}
              min={1}
              max={365}
            />
          </div>
        )}

        {/* Informazioni sui giorni */}
        <div className="text-sm text-muted-foreground bg-accent/10 p-3 rounded-lg border border-accent/20">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-accent-foreground mb-1">Stato del Piano</p>
              <p className="text-accent-foreground/80">
                Data inizio: {format(startDate, "dd/MM/yyyy")}
                {(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const diffTime = today.getTime() - startDate.getTime();
                  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                  
                  if (diffDays === 0) return " (oggi)";
                  if (diffDays > 0) return ` (${diffDays} giorni fa)`;
                  return ` (tra ${Math.abs(diffDays)} giorni)`;
                })()}
              </p>
              {nextPACInfo && (
                <p className="text-accent-foreground/80 mt-1">{nextPACInfo.description}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PACConfiguration;
