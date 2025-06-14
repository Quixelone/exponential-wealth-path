
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Trash2, Sparkles } from 'lucide-react';
import ModernTooltip from '@/components/ui/modern-tooltip';

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
    <Card className="glass-card hover-lift border-0 shadow-xl animate-slide-in-bottom" style={{ animationDelay: '0.3s' }}>
      <CardHeader className="pb-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-t-xl">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="w-8 h-8 modern-gradient rounded-lg flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="modern-gradient-text font-bold">Tracciamento Rendimenti</span>
          <ModernTooltip 
            content="Personalizza i rendimenti per giorni specifici. Usa valori positivi per guadagni e negativi per perdite."
            position="top"
          >
            <Sparkles className="h-4 w-4 text-purple-400 cursor-help" />
          </ModernTooltip>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Input per aggiungere nuovi rendimenti */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="day-select" className="text-sm font-medium text-gray-700">
                Giorno
              </Label>
              <ModernTooltip content="Seleziona il giorno per cui vuoi impostare un rendimento personalizzato">
                <Input
                  id="day-select"
                  type="number"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(Number(e.target.value))}
                  min={1}
                  max={timeHorizon}
                  className="bg-white/50 border-gray-200/50 focus:bg-white focus:border-purple-300 transition-all"
                />
              </ModernTooltip>
            </div>
            <div className="space-y-2">
              <Label htmlFor="return-rate" className="text-sm font-medium text-gray-700">
                Rendimento %
              </Label>
              <ModernTooltip content="Inserisci il rendimento in percentuale (es: 1.5 per +1.5% o -2.3 per -2.3%)">
                <Input
                  id="return-rate"
                  type="number"
                  value={returnRate}
                  onChange={(e) => setReturnRate(Number(e.target.value))}
                  step={0.01}
                  placeholder="1.5 o -2.3"
                  className="bg-white/50 border-gray-200/50 focus:bg-white focus:border-purple-300 transition-all"
                />
              </ModernTooltip>
            </div>
            <div className="space-y-2">
              <Label className="invisible">Azione</Label>
              <Button 
                onClick={handleAddReturn}
                className="w-full h-10 modern-gradient hover:shadow-lg transition-all duration-300 font-medium"
                disabled={selectedDay < 1 || selectedDay > timeHorizon}
              >
                Aggiungi
              </Button>
            </div>
          </div>
        </div>

        {/* Tabella dei rendimenti personalizzati */}
        {customReturnEntries.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Label className="text-base font-semibold text-gray-800">
                Rendimenti Personalizzati
              </Label>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                {customReturnEntries.length}
              </span>
            </div>
            <div className="border border-gray-200/50 rounded-xl overflow-hidden bg-white/30 backdrop-blur-sm">
              <div className="max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-gradient-to-r from-gray-50/90 to-blue-50/90 backdrop-blur-sm">
                    <TableRow className="border-gray-200/50">
                      <TableHead className="w-20 font-semibold text-gray-700">Giorno</TableHead>
                      <TableHead className="font-semibold text-gray-700">Rendimento</TableHead>
                      <TableHead className="w-16 text-center font-semibold text-gray-700">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customReturnEntries.map(({ day, rate }) => (
                      <TableRow key={day} className="hover:bg-white/50 transition-colors border-gray-200/30">
                        <TableCell className="font-bold text-center text-gray-800">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center mx-auto">
                            {day}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${rate >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                              {rate >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <div>
                              <span className={`font-bold text-lg ${rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {rate >= 0 ? '+' : ''}{rate.toFixed(2)}%
                              </span>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {rate >= 0 ? 'Guadagno' : 'Perdita'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <ModernTooltip content="Rimuovi questo rendimento personalizzato">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveDailyReturn(day)}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200/50">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-800 mb-1">Come funziona:</p>
              <p className="text-gray-600 mb-2">I rendimenti personalizzati sovrascrivono il rendimento standard per i giorni specificati.</p>
              <p className="text-gray-600"><strong>Esempio:</strong> +1.5 per guadagno, -2.3 per perdita</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyReturnTracker;
