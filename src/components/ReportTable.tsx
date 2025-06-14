
import React, { useState, useMemo, useEffect } from 'react';
import { InvestmentData } from '@/types/investment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Search, Download, TrendingUp, TrendingDown, Edit3, Save, XCircle, Info } from 'lucide-react';
import { ModernTooltip, ModernTooltipContent, ModernTooltipProvider, ModernTooltipTrigger } from '@/components/ui/ModernTooltip';


interface ReportTableProps {
  data: InvestmentData[];
  onExportCSV: () => void;
  onUpdateDailyReturnInReport: (day: number, newReturn: number) => void; // New prop
}

const ReportTable: React.FC<ReportTableProps> = ({ data, onExportCSV, onUpdateDailyReturnInReport }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 20;

  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit'});
  };

  // Recalculate daily gain based on current item and previous item's final capital
  const calculateDailyGain = (item: InvestmentData, prevItemFinalCapital: number | undefined) => {
    const capitalBeforeInterest = item.capitalAfterPAC; // Capital after PAC, before daily interest
    const interestForDay = item.finalCapital - capitalBeforeInterest;
    return interestForDay;
  };
  
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(item => 
      item.day.toString().includes(searchTerm) ||
      formatDate(item.date).includes(searchTerm) || // Search formatted date
      item.dailyReturn.toString().includes(searchTerm)
    );
  }, [data, searchTerm]);

  useEffect(() => {
    // Reset editing state if data changes (e.g. new calculation)
    setEditingDay(null);
    setEditValue('');
  }, [data]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleEdit = (item: InvestmentData) => {
    setEditingDay(item.day);
    setEditValue(item.dailyReturn.toFixed(3));
  };

  const handleSave = (day: number) => {
    const newReturnRate = parseFloat(editValue);
    if (!isNaN(newReturnRate)) {
      onUpdateDailyReturnInReport(day, newReturnRate);
    }
    setEditingDay(null);
  };

  const handleCancel = () => {
    setEditingDay(null);
    setEditValue('');
  };

  return (
    <ModernTooltipProvider>
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2 text-lg"> {/* Adjusted text size */}
            <TrendingUp className="h-6 w-6 text-primary" /> {/* Adjusted icon size */}
            Report Giornaliero Dettagliato
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca giorno, data, %..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="pl-9 w-full sm:w-56" // Increased width
              />
            </div>
            <Button onClick={onExportCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Esporta CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">Giorno</TableHead>
                <TableHead className="w-28">Data</TableHead>
                <TableHead className="text-right">Capitale Iniziale</TableHead>
                <TableHead className="text-right">PAC</TableHead>
                <TableHead className="text-right">Capitale Post PAC</TableHead>
                <TableHead className="text-right">Ricavo Giorno</TableHead>
                <TableHead className="text-right">% Ricavo</TableHead>
                <TableHead className="text-right">Capitale Finale</TableHead>
                <TableHead className="w-24 text-center">Tipo/Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nessun dato da visualizzare per i filtri applicati.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => {
                  const actualIndex = startIndex + index;
                  const prevItem = actualIndex > 0 ? filteredData[actualIndex - 1] : null;
                  const dailyGain = calculateDailyGain(item, prevItem?.finalCapital);
                  const isPositiveGain = dailyGain >= 0;
                  const isEditingThisRow = editingDay === item.day;
                  
                  return (
                    <TableRow key={item.day} className={`hover:bg-muted/50 ${isEditingThisRow ? 'bg-primary/5' : ''}`}>
                      <TableCell className="font-medium text-center">{item.day}</TableCell>
                      <TableCell className="text-sm">{formatDate(item.date)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(item.initialCapital)}</TableCell>
                      <TableCell className="text-right font-mono">
                        {item.pacAmount > 0 ? formatCurrency(item.pacAmount) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(item.capitalAfterPAC)}</TableCell>
                      <TableCell className={`text-right font-mono ${isPositiveGain ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {isPositiveGain ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {formatCurrency(item.interestEarned)} {/* Displaying interestEarned directly */}
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-mono ${item.dailyReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {isEditingThisRow ? (
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            step="0.001"
                            className="h-8 text-right w-24"
                            autoFocus
                          />
                        ) : (
                          `${item.dailyReturn.toFixed(3)}%`
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">{formatCurrency(item.finalCapital)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isEditingThisRow ? (
                            <>
                              <ModernTooltip>
                                <ModernTooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700" onClick={() => handleSave(item.day)}>
                                    <Save className="h-4 w-4" />
                                  </Button>
                                </ModernTooltipTrigger>
                                <ModernTooltipContent><p>Salva Modifiche</p></ModernTooltipContent>
                              </ModernTooltip>
                              <ModernTooltip>
                                <ModernTooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:text-red-700" onClick={handleCancel}>
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </ModernTooltipTrigger>
                                <ModernTooltipContent><p>Annulla</p></ModernTooltipContent>
                              </ModernTooltip>
                            </>
                          ) : (
                            <ModernTooltip>
                              <ModernTooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:text-primary/80" onClick={() => handleEdit(item)}>
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              </ModernTooltipTrigger>
                              <ModernTooltipContent><p>Modifica % Ricavo per Giorno {item.day}</p></ModernTooltipContent>
                            </ModernTooltip>
                          )}
                          {item.isCustomReturn && !isEditingThisRow && (
                            <ModernTooltip>
                                <ModernTooltipTrigger>
                                     <Badge variant="secondary" className="text-xs cursor-default">Custom</Badge>
                                </ModernTooltipTrigger>
                                <ModernTooltipContent><p>Rendimento personalizzato</p></ModernTooltipContent>
                            </ModernTooltip>
                          )}
                          {item.pacAmount > 0 && !isEditingThisRow && (
                            <ModernTooltip>
                                <ModernTooltipTrigger>
                                    <Badge variant="outline" className="text-xs cursor-default">PAC</Badge>
                                </ModernTooltipTrigger>
                                <ModernTooltipContent><p>Versamento PAC eseguito</p></ModernTooltipContent>
                            </ModernTooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Visualizzando {paginatedData.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredData.length)} di {filteredData.length} giorni
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> {/* Added margin */}
                Precedente
              </Button>
              <span className="text-sm text-muted-foreground">
                Pagina {currentPage} di {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Successiva
                <ChevronRight className="h-4 w-4 ml-1" /> {/* Added margin */}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </ModernTooltipProvider>
  );
};

export default ReportTable;
