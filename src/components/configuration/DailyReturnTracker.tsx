
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Plus, Trash2, AlertTriangle } from 'lucide-react';

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
      setReturnRate(0);
    }
  };

  const customReturnEntries = Object.entries(customReturns)
    .map(([day, rate]) => ({ day: parseInt(day), rate }))
    .sort((a, b) => a.day - b.day);

  return (
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            <div className="space-y-2">
              <Label htmlFor="day-select">Giorno</Label>
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
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                <AlertTriangle className="h-3 w-3" />
                Usa valori negativi per le perdite
              </div>
            </div>
            <div className="space-y-2">
              <Label className="invisible">Azione</Label>
              <Button 
                onClick={handleAddReturn}
                className="w-full h-10"
                disabled={selectedDay < 1 || selectedDay > timeHorizon}
              >
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi
              </Button>
            </div>
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
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-20">Giorno</TableHead>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveDailyReturn(day)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
          <p><strong>Nota:</strong> I rendimenti personalizzati sovrascriveranno il rendimento giornaliero standard per i giorni specificati.</p>
          <p className="mt-1"><strong>Suggerimento:</strong> Usa valori positivi per i guadagni e negativi per le perdite (es: -1.5 per una perdita dell'1.5%).</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyReturnTracker;
