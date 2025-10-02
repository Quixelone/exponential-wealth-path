import React, { useState, useMemo, useEffect, useRef } from 'react';
import { InvestmentData } from '@/types/investment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search, Download, TrendingUp, Edit3, Calendar, DollarSign, TrendingDown } from 'lucide-react';
import { ModernTooltipProvider, ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from '@/components/ui/ModernTooltip';
import { Currency, formatCurrency } from '@/lib/utils';
import RowEditDialog from './RowEditDialog';
import { TradeRecordDialog } from './TradeRecordDialog';
import { useActualTrades } from '@/hooks/useActualTrades';

interface ReportTableProps {
  data: InvestmentData[];
  currency: Currency;
  onExportCSV: () => void;
  onUpdateDailyReturnInReport: (day: number, newReturn: number) => void;
  onUpdatePACInReport: (day: number, newPAC: number) => void;
  onRemovePACOverride?: (day: number) => void;
  defaultPACAmount: number;
  investmentStartDate: string | Date;
  currentConfigId?: string | null;
  currentConfigName?: string;
  onSaveToStrategy?: () => Promise<void>;
  readOnly?: boolean;
}

const ReportTable: React.FC<ReportTableProps> = ({
  data,
  currency,
  onExportCSV,
  onUpdateDailyReturnInReport,
  onUpdatePACInReport,
  onRemovePACOverride,
  defaultPACAmount,
  investmentStartDate,
  currentConfigId,
  currentConfigName,
  onSaveToStrategy,
  readOnly = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Rimuovo log di debug inutile
  // React.useEffect(() => {
  //   console.log('📋 ReportTable currency updated:', currency);
  // }, [currency]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InvestmentData | null>(null);
  const hasManuallyNavigated = useRef(false);
  const itemsPerPage = 20;

  // Load actual trades
  const { trades, loadTrades, getTradeForDay } = useActualTrades({ 
    configId: currentConfigId 
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit'});
  };

  // Calcola il giorno corrente dell'investimento
  const currentInvestmentDay = useMemo(() => {
    const startDate = new Date(investmentStartDate);
    startDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 perché il primo giorno è il giorno 1
    
    return diffDays > 0 ? diffDays : null; // null se l'investimento non è ancora iniziato
  }, [investmentStartDate]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(item => 
      item.day.toString().includes(searchTerm) ||
      formatDate(item.date).includes(searchTerm) ||
      item.dailyReturn.toString().includes(searchTerm)
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Naviga automaticamente alla pagina contenente il giorno corrente SOLO se necessario
  useEffect(() => {
    if (currentInvestmentDay && !searchTerm && !hasManuallyNavigated.current && data.length > 0) {
      const currentDayItem = data.find(item => item.day === currentInvestmentDay);
      if (currentDayItem) {
        const currentDayIndex = data.indexOf(currentDayItem);
        const pageWithCurrentDay = Math.floor(currentDayIndex / itemsPerPage) + 1;
        if (pageWithCurrentDay !== currentPage) {
          setCurrentPage(pageWithCurrentDay);
        }
      }
    }
  }, [currentInvestmentDay, searchTerm, itemsPerPage]); // Rimosso data.length per evitare re-render continui

  const handleEditRow = (item: InvestmentData) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handleTradeRecord = (item: InvestmentData) => {
    setSelectedItem(item);
    setTradeDialogOpen(true);
  };

  const isCurrentDay = (dayNumber: number) => {
    return currentInvestmentDay === dayNumber;
  };

  const handleNextPage = () => {
    hasManuallyNavigated.current = true;
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    hasManuallyNavigated.current = true;
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset del flag quando si cambia il filtro di ricerca
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    hasManuallyNavigated.current = false; // Reset del flag quando si filtra
  };

  // Rimuovo i log di debug che causano re-render inutili
  // console.log('📊 ReportTable pagination state:', {
  //   currentPage,
  //   totalPages, 
  //   filteredDataLength: filteredData.length,
  //   itemsPerPage,
  //   startIndex,
  //   paginatedDataLength: paginatedData.length,
  //   hasManuallyNavigated: hasManuallyNavigated.current
  // });

  return (
    <ModernTooltipProvider>
      <Card className="animate-fade-in">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
              Report Giornaliero Dettagliato
              {currentInvestmentDay && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Giorno corrente: {currentInvestmentDay}</span>
                </div>
              )}
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cerca giorno, data, %..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 w-full sm:w-56"
                />
              </div>
              {currentConfigId && currentInvestmentDay && onSaveToStrategy && (
                <Button 
                  onClick={onSaveToStrategy}
                  variant="default" 
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Salva al Giorno {currentInvestmentDay}
                </Button>
              )}
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
                  <TableHead className="text-right">Valore Reale</TableHead>
                  <TableHead className="text-right">Differenza</TableHead>
                  {!readOnly && <TableHead className="w-32 text-center">Azioni</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      Nessun dato da visualizzare per i filtri applicati.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => {
                    const dailyGain = item.interestEarnedDaily;
                    const isPositiveGain = dailyGain >= 0;
                    const isToday = isCurrentDay(item.day);
                    const actualTrade = getTradeForDay(item.day);
                    const realValue = actualTrade ? actualTrade.btc_amount * actualTrade.fill_price_usd : null;
                    const difference = realValue ? realValue - item.finalCapital : null;
                    const diffPercentage = difference && item.finalCapital > 0 ? (difference / item.finalCapital) * 100 : null;

                    return (
                      <TableRow 
                        key={item.day} 
                        className={`
                          hover:bg-muted/50 
                          ${isToday ? 'bg-primary/5 border-primary/20 border-2 animate-pulse-gentle' : ''}
                        `}
                      >
                        <TableCell className="font-medium text-center relative">
                          <div className="flex items-center justify-center gap-1">
                            {item.day}
                            {isToday && (
                              <ModernTooltip>
                                <ModernTooltipTrigger asChild>
                                  <Calendar className="h-4 w-4 text-primary animate-pulse" />
                                </ModernTooltipTrigger>
                                <ModernTooltipContent>
                                  <p>Giorno corrente dell'investimento</p>
                                </ModernTooltipContent>
                              </ModernTooltip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={`text-sm ${isToday ? 'font-semibold text-primary' : ''}`}>
                          {formatDate(item.date)}
                        </TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(item.capitalBeforePAC, currency)}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(item.pacAmount, currency)}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(item.capitalAfterPAC, currency)}</TableCell>
                        <TableCell className={`text-right font-mono ${item.dailyReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.dailyReturn.toFixed(3)}%
                        </TableCell>
                        <TableCell className={`text-right font-mono ${isPositiveGain ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(dailyGain, currency)}
                        </TableCell>
                        <TableCell className={`text-right font-mono font-semibold ${isToday ? 'text-primary' : ''}`}>
                          {formatCurrency(item.finalCapital, currency)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {realValue ? (
                            <span className="text-green-600 font-semibold">
                              {formatCurrency(realValue, 'USD')}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {difference !== null ? (
                            <div className="flex flex-col items-end">
                              <span className={difference >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {difference >= 0 ? '+' : ''}{formatCurrency(Math.abs(difference), 'USD')}
                              </span>
                              {diffPercentage !== null && (
                                <span className={`text-xs ${diffPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  ({diffPercentage >= 0 ? '+' : ''}{diffPercentage.toFixed(2)}%)
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        {!readOnly && (
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <ModernTooltip>
                                <ModernTooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditRow(item)}
                                    className="h-8 px-2 text-primary hover:text-primary/80 hover:bg-primary/10"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </Button>
                                </ModernTooltipTrigger>
                                <ModernTooltipContent>
                                  <p>Modifica rendimento e PAC per il giorno {item.day}</p>
                                </ModernTooltipContent>
                              </ModernTooltip>
                              
                              {actualTrade ? (
                                <ModernTooltip>
                                  <ModernTooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleTradeRecord(item)}
                                      className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    >
                                      <DollarSign className="h-4 w-4" />
                                    </Button>
                                  </ModernTooltipTrigger>
                                  <ModernTooltipContent>
                                    <p>Trade registrato - Clicca per modificare</p>
                                  </ModernTooltipContent>
                                </ModernTooltip>
                              ) : (
                                <ModernTooltip>
                                  <ModernTooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleTradeRecord(item)}
                                      className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    >
                                      <TrendingDown className="h-4 w-4" />
                                    </Button>
                                  </ModernTooltipTrigger>
                                  <ModernTooltipContent>
                                    <p>Registra trade reale per il giorno {item.day}</p>
                                  </ModernTooltipContent>
                                </ModernTooltip>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 space-y-4">
              {/* Mobile-first pagination info */}
              <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                {paginatedData.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredData.length)} di {filteredData.length} giorni
              </div>
              
              {/* Responsive pagination controls */}
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3">
                <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="flex-1 sm:flex-none min-h-[44px] min-w-[100px]"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    <span className="sm:hidden">Prec</span>
                    <span className="hidden sm:inline">Precedente</span>
                  </Button>
                  
                  <div className="px-3 py-2 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    {currentPage} / {totalPages}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="flex-1 sm:flex-none min-h-[44px] min-w-[100px]"
                  >
                    <span className="sm:hidden">Succ</span>
                    <span className="hidden sm:inline">Successiva</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <RowEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        item={selectedItem}
        currency={currency}
        onUpdateDailyReturn={onUpdateDailyReturnInReport}
        onUpdatePAC={onUpdatePACInReport}
        defaultPACAmount={defaultPACAmount}
        currentConfigId={currentConfigId}
        currentConfigName={currentConfigName}
        onSaveToStrategy={onSaveToStrategy}
      />

      {selectedItem && (
        <TradeRecordDialog
          open={tradeDialogOpen}
          onOpenChange={setTradeDialogOpen}
          item={selectedItem}
          configId={currentConfigId}
          onTradeRecorded={loadTrades}
        />
      )}
    </ModernTooltipProvider>
  );
};

export default ReportTable;
