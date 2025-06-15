import React, { useState, useMemo, useEffect } from 'react';
import { InvestmentData } from '@/types/investment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Search, Download, TrendingUp, TrendingDown, Edit3, Save, XCircle, Info } from 'lucide-react';
import { ModernTooltip, ModernTooltipContent, ModernTooltipProvider, ModernTooltipTrigger } from '@/components/ui/ModernTooltip';
import { formatCurrency } from '@/lib/utils';

interface ReportTableProps {
  data: InvestmentData[];
  onExportCSV: () => void;
  onUpdateDailyReturnInReport: (day: number, newReturn: number) => void;
  onUpdatePACInReport: (day: number, newPAC: number) => void;
  onRemovePACOverride?: (day: number) => void;
}

const ReportTable: React.FC<ReportTableProps> = ({
  data,
  onExportCSV,
  onUpdateDailyReturnInReport,
  onUpdatePACInReport,
  onRemovePACOverride
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 20;

  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const [editingPACDay, setEditingPACDay] = useState<number | null>(null);
  const [editPACValue, setEditPACValue] = useState<string>('');

  const formatCurrency_2dec = formatCurrency; // 2 decimals, used for all currency

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit'});
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
    setEditingDay(null);
    setEditValue('');
  }, [data]);

  useEffect(() => {
    setEditingPACDay(null);
    setEditPACValue('');
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

  const handleEditPAC = (item: InvestmentData) => {
    setEditingPACDay(item.day);
    setEditPACValue(item.pacAmount.toFixed(2));
  };

  const handleSavePAC = (day: number) => {
    const newPAC = parseFloat(editPACValue);
    if (!isNaN(newPAC)) {
      onUpdatePACInReport(day, newPAC);
    }
    setEditingPACDay(null);
    setEditPACValue('');
  };

  const handleCancelPAC = () => {
    setEditingPACDay(null);
    setEditPACValue('');
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
                <TableHead className="text-right">% Ricavo</TableHead>
                <TableHead className="text-right">Ricavo Giorno</TableHead>
                <TableHead className="text-right font-mono">Capitale Finale</TableHead>
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
                paginatedData.map((item) => {
                  const dailyGain = item.interestEarnedDaily; // Use the new property
                  const isPositiveGain = dailyGain >= 0;
                  const isEditingThisRow = editingDay === item.day;
                  const isEditingThisPACRow = editingPACDay === item.day;
                  
                  return (
                    <TableRow key={item.day} className={`hover:bg-muted/50 ${isEditingThisRow ? 'bg-primary/5' : ''}`}>
                      <TableCell className="font-medium text-center">{item.day}</TableCell>
                      <TableCell className="text-sm">{formatDate(item.date)}</TableCell>
                      {/* Use capitalBeforePAC for "Capitale Iniziale" */}
                      <TableCell className="text-right font-mono">{formatCurrency_2dec(item.capitalBeforePAC)}</TableCell>
                      <TableCell className="text-right font-mono group">
                        {isEditingThisPACRow ? (
                          <Input
                            type="number"
                            value={editPACValue}
                            min={0}
                            step="0.01"
                            onChange={(e) => setEditPACValue(e.target.value)}
                            className="h-8 text-right w-24"
                            autoFocus
                          />
                        ) : (
                          <span className="flex items-center gap-1 justify-end">
                            {formatCurrency_2dec(item.pacAmount)}
                            <ModernTooltip>
                              <ModernTooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-primary hover:text-primary/80 opacity-60 group-hover:opacity-100"
                                  onClick={() => handleEditPAC(item)}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              </ModernTooltipTrigger>
                              <ModernTooltipContent>
                                <p>Modifica PAC per il giorno {item.day}</p>
                              </ModernTooltipContent>
                            </ModernTooltip>
                            {item.isCustomPAC && (
                              <ModernTooltip>
                                <ModernTooltipTrigger>
                                  <Badge variant="secondary" className="text-xs cursor-default">Custom</Badge>
                                </ModernTooltipTrigger>
                                <ModernTooltipContent>
                                  <p>Importo PAC personalizzato</p>
                                </ModernTooltipContent>
                              </ModernTooltip>
                            )}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency_2dec(item.capitalAfterPAC)}</TableCell>
                      
                      {/* % Ricavo */}
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
                      
                      {/* Ricavo Giorno */}
                      <TableCell className={`text-right font-mono ${isPositiveGain ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {isPositiveGain ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {/* Use dailyGain (which is item.interestEarnedDaily) */}
                          {formatCurrency_2dec(dailyGain)}
                        </div>
                      </TableCell>

                      <TableCell className="text-right font-mono font-semibold">{formatCurrency_2dec(item.finalCapital)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isEditingThisPACRow ? (
                            <>
                              <ModernTooltip>
                                <ModernTooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700" onClick={() => handleSavePAC(item.day)}>
                                    <Save className="h-4 w-4" />
                                  </Button>
                                </ModernTooltipTrigger>
                                <ModernTooltipContent><p>Salva Modifica PAC</p></ModernTooltipContent>
                              </ModernTooltip>
                              <ModernTooltip>
                                <ModernTooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:text-red-700" onClick={handleCancelPAC}>
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </ModernTooltipTrigger>
                                <ModernTooltipContent><p>Annulla</p></ModernTooltipContent>
                              </ModernTooltip>
                            </>
                          ) : (
                            <>
                              {editingDay === item.day ? (
                                <>
                                  <ModernTooltip>
                                    <ModernTooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700" onClick={() => handleSave(item.day)}>
                                        <Save className="h-4 w-4" />
                                      </Button>
                                    </ModernTooltipTrigger>
                                    <ModernTooltipContent><p>Salva Modifiche % Ricavo</p></ModernTooltipContent>
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
                                <>
                                  <ModernTooltip>
                                    <ModernTooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:text-primary/80" onClick={() => handleEdit(item)}>
                                        <Edit3 className="h-4 w-4" />
                                      </Button>
                                    </ModernTooltipTrigger>
                                    <ModernTooltipContent><p>Modifica % Ricavo per Giorno {item.day}</p></ModernTooltipContent>
                                  </ModernTooltip>
                                  {item.isCustomReturn && (
                                    <ModernTooltip>
                                      <ModernTooltipTrigger>
                                        <Badge variant="secondary" className="text-xs cursor-default">Custom</Badge>
                                      </ModernTooltipTrigger>
                                      <ModernTooltipContent><p>Rendimento personalizzato</p></ModernTooltipContent>
                                    </ModernTooltip>
                                  )}
                                  {item.pacAmount > 0 && !item.isCustomPAC && (
                                    <ModernTooltip>
                                      <ModernTooltipTrigger>
                                        <Badge variant="outline" className="text-xs cursor-default">PAC</Badge>
                                      </ModernTooltipTrigger>
                                      <ModernTooltipContent><p>Versamento PAC eseguito</p></ModernTooltipContent>
                                    </ModernTooltip>
                                  )}
                                  {item.isCustomPAC && typeof onRemovePACOverride === 'function' && (
                                    <ModernTooltip>
                                      <ModernTooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 text-yellow-600 hover:text-yellow-700"
                                          onClick={() => onRemovePACOverride(item.day)}
                                        >
                                          <XCircle className="h-4 w-4" />
                                        </Button>
                                      </ModernTooltipTrigger>
                                      <ModernTooltipContent><p>Ripristina PAC da default</p></ModernTooltipContent>
                                    </ModernTooltip>
                                  )}
                                </>
                              )}
                            </>
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
