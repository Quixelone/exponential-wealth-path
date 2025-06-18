
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PiggyBank, Trash2, Info, Euro } from 'lucide-react';
import { ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from '@/components/ui/ModernTooltip';
import { formatCurrency } from '@/lib/utils';

interface DailyPACTrackerProps {
  timeHorizon: number;
  dailyPACOverrides: { [day: number]: number };
  onUpdatePACForDay: (day: number, pacAmount: number) => void;
  onRemovePACOverride: (day: number) => void;
  defaultPACAmount: number;
  currency: 'EUR' | 'USD' | 'USDT';
}

const DailyPACTracker: React.FC<DailyPACTrackerProps> = ({
  timeHorizon,
  dailyPACOverrides,
  onUpdatePACForDay,
  onRemovePACOverride,
  defaultPACAmount,
  currency
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [pacAmount, setPacAmount] = useState<number>(defaultPACAmount);

  const handleAddPACOverride = () => {
    if (selectedDay >= 1 && selectedDay <= timeHorizon && pacAmount >= 0) {
      console.log('🔄 Aggiunta PAC override:', { selectedDay, pacAmount });
      onUpdatePACForDay(selectedDay, pacAmount);
      // Non resetto pacAmount per permettere inserimenti rapidi dello stesso importo
    }
  };

  const pacOverrideEntries = Object.entries(dailyPACOverrides)
    .map(([day, amount]) => ({ day: parseInt(day), amount }))
    .sort((a, b) => a.day - b.day);

  return (
    <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <PiggyBank className="h-5 w-5 text-primary" />
          Modifiche PAC Giornaliere
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input per aggiungere nuove modifiche PAC */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="pac-day-select">Giorno (1-{timeHorizon})</Label>
              <Input
                id="pac-day-select"
                type="number"
                value={selectedDay}
                onChange={(e) => setSelectedDay(Number(e.target.value))}
                min={1}
                max={timeHorizon}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pac-amount">Importo PAC ({currency})</Label>
              <Input
                id="pac-amount"
                type="number"
                value={pacAmount}
                onChange={(e) => setPacAmount(Number(e.target.value))}
                min={0}
                step={1}
                placeholder={`Es: ${defaultPACAmount}`}
                className="w-full"
              />
            </div>
            <Button 
              onClick={handleAddPACOverride}
              className="w-full h-10"
              disabled={selectedDay < 1 || selectedDay > timeHorizon || pacAmount < 0}
            >
              Imposta PAC
            </Button>
          </div>
        </div>

        {/* Tabella delle modifiche PAC */}
        {pacOverrideEntries.length > 0 && (
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Modifiche PAC Personalizzate ({pacOverrideEntries.length})
            </Label>
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-20 text-center">Giorno</TableHead>
                      <TableHead>Importo PAC</TableHead>
                      <TableHead className="w-20 text-center">Differenza</TableHead>
                      <TableHead className="w-16 text-center">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pacOverrideEntries.map(({ day, amount }) => {
                      const difference = amount - defaultPACAmount;
                      return (
                        <TableRow key={day}>
                          <TableCell className="font-medium text-center">{day}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Euro className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="font-medium">
                                {formatCurrency(amount, currency)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`font-medium text-sm ${
                              difference > 0 ? 'text-green-600' : 
                              difference < 0 ? 'text-red-600' : 'text-muted-foreground'
                            }`}>
                              {difference > 0 ? '+' : ''}{formatCurrency(difference, currency)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <ModernTooltip>
                              <ModernTooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    console.log('🗑️ Rimozione PAC override per giorno:', day);
                                    onRemovePACOverride(day);
                                  }}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </ModernTooltipTrigger>
                              <ModernTooltipContent>
                                <p>Rimuovi modifica PAC per il giorno {day}</p>
                              </ModernTooltipContent>
                            </ModernTooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg space-y-2">
          <div className="flex items-start">
            <ModernTooltip>
              <ModernTooltipTrigger className="cursor-help mr-2 mt-0.5">
                <Info className="h-4 w-4 text-primary" />
              </ModernTooltipTrigger>
              <ModernTooltipContent side="top" align="start">
                <p className="max-w-xs">Le modifiche PAC ti permettono di cambiare l'importo investito in giorni specifici. Questo è utile per simulare investimenti extra o ridotti in determinati periodi.</p>
              </ModernTooltipContent>
            </ModernTooltip>
            <p><strong>Nota:</strong> Le modifiche PAC personalizzate sovrascriveranno l'importo PAC standard per i giorni specificati.</p>
          </div>
          <div className="flex items-start">
            <ModernTooltip>
              <ModernTooltipTrigger className="cursor-help mr-2 mt-0.5">
                <Info className="h-4 w-4 text-primary" />
              </ModernTooltipTrigger>
              <ModernTooltipContent side="bottom" align="start">
                <p className="max-w-xs">PAC predefinito: {formatCurrency(defaultPACAmount, currency)}. Puoi aumentare o diminuire questo importo per giorni specifici. Usa 0 per saltare l'investimento in un giorno particolare.</p>
              </ModernTooltipContent>
            </ModernTooltip>
            <p><strong>Importo PAC standard:</strong> {formatCurrency(defaultPACAmount, currency)} - Modifica solo i giorni dove vuoi un importo diverso.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyPACTracker;
