
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Plus, Trash2 } from 'lucide-react';

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
      <CardContent className="space-y-4">
        {/* Input per aggiungere nuovi rendimenti */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <Label htmlFor="return-rate">Rendimento %</Label>
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
          <div className="flex items-end">
            <Button 
              onClick={handleAddReturn}
              className="w-full"
              disabled={selectedDay < 1 || selectedDay > timeHorizon}
            >
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi
            </Button>
          </div>
        </div>

        {/* Tabella dei rendimenti personalizzati */}
        {customReturnEntries.length > 0 && (
          <div className="space-y-2">
            <Label>Rendimenti Personalizzati ({customReturnEntries.length})</Label>
            <div className="max-h-48 overflow-y-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Giorno</TableHead>
                    <TableHead>Rendimento</TableHead>
                    <TableHead className="w-16">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customReturnEntries.map(({ day, rate }) => (
                    <TableRow key={day}>
                      <TableCell className="font-medium">{day}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {rate >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className={rate >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {rate.toFixed(2)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
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
        )}

        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
          <p><strong>Nota:</strong> I rendimenti personalizzati sovrascriveranno il rendimento giornaliero standard per i giorni specificati.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyReturnTracker;
