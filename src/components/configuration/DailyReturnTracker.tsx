
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Trash2, Info } from 'lucide-react';
import { ModernTooltip, ModernTooltipContent, ModernTooltipProvider, ModernTooltipTrigger } from '@/components/ui/ModernTooltip';

interface DailyReturnTrackerProps {
  timeHorizon: number;
  customReturns: { [day: number]: number };
  onUpdateDailyReturn: (day: number, returnRate: number) => void;
  onRemoveDailyReturn: (day: number) => void;
}

const DailyReturnTracker: React.FC<DailyReturnTrackerProps> = ({
  timeHorizon,
  customReturns,
  onUpdateDailyReturn,
  onRemoveDailyReturn
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [returnRate, setReturnRate] = useState<number>(0);

  const handleAddReturn = () => {
    if (selectedDay >= 1 && selectedDay <= timeHorizon) {
      onUpdateDailyReturn(selectedDay, returnRate);
      setReturnRate(0); // Reset input after adding
    }
  };

  const customReturnEntries = Object.entries(customReturns)
    .map(([day, rate]) => ({ day: parseInt(day), rate }))
    .sort((a, b) => a.day - b.day);

  return (
    <ModernTooltipProvider>
      <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tracciamento Rendimenti Giornalieri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input per aggiungere nuovi rendimenti */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="day-select">Giorno (1-{timeHorizon})</Label>
                <Input
                  id="day-select"
                  type="number"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(Number(e.target.value))}
                  min={1}
                  max={timeHorizon}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="return-rate">Rendimento/Perdita %</Label>
                <Input
                  id="return-rate"
                  type="number"
                  value={returnRate}
                  onChange={(e) => setReturnRate(Number(e.target.value))}
                  step={0.01}
                  placeholder="Es: 1.5 o -2.3"
                  className="w-full"
                />
              </div>
              <Button 
                onClick={handleAddReturn}
                className="w-full h-10" // Matched height with input
                disabled={selectedDay < 1 || selectedDay > timeHorizon || selectedDay === undefined || returnRate === undefined}
              >
                Aggiungi
              </Button>
            </div>
          </div>

          {/* Tabella dei rendimenti personalizzati */}
          {customReturnEntries.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Rendimenti Personalizzati ({customReturnEntries.length})
              </Label>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-60 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10"> {/* Added z-index */}
                      <TableRow>
                        <TableHead className="w-20 text-center">Giorno</TableHead>
                        <TableHead>Rendimento/Perdita</TableHead>
                        <TableHead className="w-16 text-center">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customReturnEntries.map(({ day, rate }) => (
                        <TableRow key={day}>
                          <TableCell className="font-medium text-center">{day}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {rate >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600 flex-shrink-0" />
                              )}
                              <span className={`font-medium ${rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {rate >= 0 ? '+' : ''}{rate.toFixed(2)}%
                              </span>
                              <span className="text-xs text-muted-foreground ml-1">
                                {rate >= 0 ? '(guadagno)' : '(perdita)'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <ModernTooltip>
                              <ModernTooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onRemoveDailyReturn(day)}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </ModernTooltipTrigger>
                              <ModernTooltipContent>
                                <p>Rimuovi rendimento per il giorno {day}</p>
                              </ModernTooltipContent>
                            </ModernTooltip>
                          </TableCell>
                        </TableRow>
                      ))}
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
                  <p className="max-w-xs">I rendimenti personalizzati specificati qui prenderanno il posto del tasso di rendimento giornaliero standard per quei giorni particolari. Questo ti permette di simulare scenari di mercato specifici o eventi noti.</p>
                </ModernTooltipContent>
              </ModernTooltip>
              <p><strong>Nota:</strong> I rendimenti personalizzati sovrascriveranno il rendimento giornaliero standard per i giorni specificati.</p>
            </div>
            <div className="flex items-start">
              <ModernTooltip>
                <ModernTooltipTrigger className="cursor-help mr-2 mt-0.5">
                  <Info className="h-4 w-4 text-primary" />
                </ModernTooltipTrigger>
                <ModernTooltipContent side="bottom" align="start">
                  <p className="max-w-xs">Per indicare un guadagno, inserisci un numero positivo (es. 2 per +2%). Per una perdita, inserisci un numero negativo (es. -1.5 per -1.5%). Non è necessario aggiungere il simbolo '%'.</p>
                </ModernTooltipContent>
              </ModernTooltip>
              <p><strong>Suggerimento:</strong> Usa valori positivi per i guadagni (es. 1.5) e negativi per le perdite (es. -2.3).</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </ModernTooltipProvider>
  );
};

export default DailyReturnTracker;
