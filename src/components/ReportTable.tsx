import React, { useState, useMemo, useEffect, useRef } from 'react';
import { InvestmentData } from '@/types/investment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

const ReportTable: React.FC<ReportTableProps> = React.memo(({
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
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-base sm:text-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-6 sm:h-6 sm:w-6 text-primary" />
                <span>Report Giornaliero Dettagliato</span>
              </div>
              {currentInvestmentDay && (
                <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Giorno corrente: {currentInvestmentDay}</span>
                </div>
              )}
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cerca giorno, data, %..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 w-full sm:w-56 touch-target"
                />
              </div>
              {currentConfigId && currentInvestmentDay && onSaveToStrategy && (
            <Button 
              onClick={onSaveToStrategy}
              variant="default" 
              size="sm"
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto touch-target"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Conferma Giorno {currentInvestmentDay}</span>
              <span className="sm:hidden">Conferma G.{currentInvestmentDay}</span>
            </Button>
              )}
              <Button onClick={onExportCSV} variant="outline" size="sm" className="w-full sm:w-auto touch-target">
                <Download className="h-4 w-4 mr-2" />
                Esporta CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-xs sm:text-sm">
                  <TableHead className="w-12 sm:w-16 text-center px-2">Giorno</TableHead>
                  <TableHead className="w-20 sm:w-28 px-2">Data</TableHead>
                  <TableHead className="text-right px-2 hidden sm:table-cell">Capitale Iniziale</TableHead>
                  <TableHead className="text-right px-2">PAC</TableHead>
                  <TableHead className="text-center px-2 hidden md:table-cell">Trade Reale</TableHead>
                  <TableHead className="text-right px-2">% Ricavo</TableHead>
                  <TableHead className="text-right px-2 hidden sm:table-cell">Ricavo Giorno</TableHead>
                  <TableHead className="text-right font-mono px-2">Capitale Finale</TableHead>
                  <TableHead className="text-right px-2 hidden lg:table-cell">Valore Reale</TableHead>
                  <TableHead className="text-right px-2 hidden lg:table-cell">Differenza</TableHead>
                  {!readOnly && <TableHead className="w-20 sm:w-32 text-center px-2">Azioni</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground text-sm">
                      Nessun dato da visualizzare per i filtri applicati.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => {
                    const dailyGain = item.interestEarnedDaily;
                    const isPositiveGain = dailyGain >= 0;
                    const isToday = isCurrentDay(item.day);
                    const actualTrade = getTradeForDay(item.day);
                    const realValue = actualTrade 
                      ? (actualTrade.option_status === 'filled' 
                          ? (actualTrade.btc_amount || 0) * (actualTrade.fill_price_usd || 0)
                          : (actualTrade.premium_received_usdt || 0))
                      : null;
                    const difference = realValue ? realValue - item.finalCapital : null;
                    const diffPercentage = difference && item.finalCapital > 0 ? (difference / item.finalCapital) * 100 : null;

                    return (
                      <TableRow 
                        key={item.day} 
                        className={`
                          hover:bg-muted/50 text-xs sm:text-sm
                          ${isToday ? 'bg-primary/5 border-primary/20 border-2 animate-pulse-gentle' : ''}
                        `}
                      >
                        <TableCell className="font-medium text-center relative px-2">
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
                        <TableCell className={`text-xs sm:text-sm px-2 ${isToday ? 'font-semibold text-primary' : ''}`}>
                          {formatDate(item.date)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs sm:text-sm px-2 hidden sm:table-cell">{formatCurrency(item.capitalBeforePAC, currency)}</TableCell>
                        <TableCell className="text-right font-mono text-xs sm:text-sm px-2">{formatCurrency(item.pacAmount, currency)}</TableCell>
                        <TableCell className="text-center px-2 hidden md:table-cell">
                          {actualTrade ? (
                            <div className="space-y-1 sm:space-y-2">
                              {actualTrade.option_status === 'filled' ? (
                                <>
                                  <Badge variant="default" className="bg-green-600 text-xs">
                                    Fillata
                                  </Badge>
                                  <div className="text-xs sm:text-sm font-mono">
                                    {actualTrade.btc_amount?.toFixed(8)} BTC
                                  </div>
                                  <div className="text-[10px] sm:text-xs text-muted-foreground">
                                    @ ${actualTrade.fill_price_usd?.toLocaleString()}
                                  </div>
                                  {actualTrade.strike_price && (
                                    <div className="text-[10px] sm:text-xs text-blue-600">
                                      Strike: ${actualTrade.strike_price.toLocaleString()}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
                                  <Badge variant="secondary" className="bg-blue-600 text-xs">
                                    Scaduta OTM
                                  </Badge>
                                  <div className="text-xs sm:text-sm font-mono text-blue-600">
                                    +${actualTrade.premium_received_usdt?.toLocaleString()} USDT
                                  </div>
                                  <div className="text-[10px] sm:text-xs text-muted-foreground">
                                    Premio trattenuto
                                  </div>
                                </>
                              )}
                              {actualTrade.option_sold_date && (
                                <div className="text-[10px] sm:text-xs text-muted-foreground">
                                  Sold: {formatDate(actualTrade.option_sold_date)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs sm:text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className={`text-right font-mono text-xs sm:text-sm px-2 ${item.dailyReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.dailyReturn.toFixed(3)}%
                        </TableCell>
                        <TableCell className={`text-right font-mono text-xs sm:text-sm px-2 hidden sm:table-cell ${isPositiveGain ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(dailyGain, currency)}
                        </TableCell>
                        <TableCell className={`text-right font-mono font-semibold text-xs sm:text-sm px-2 ${isToday ? 'text-primary' : ''}`}>
                          {formatCurrency(item.finalCapital, currency)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs sm:text-sm px-2 hidden lg:table-cell">
                          {realValue ? (
                            <span className="text-green-600 font-semibold text-xs sm:text-sm">
                              {formatCurrency(realValue, 'USD')}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs sm:text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs sm:text-sm px-2 hidden lg:table-cell">
                          {difference !== null ? (
                            <div className="flex flex-col items-end">
                              <span className={`text-xs sm:text-sm ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {difference >= 0 ? '+' : ''}{formatCurrency(Math.abs(difference), 'USD')}
                              </span>
                              {diffPercentage !== null && (
                                <span className={`text-[10px] sm:text-xs ${diffPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  ({diffPercentage >= 0 ? '+' : ''}{diffPercentage.toFixed(2)}%)
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs sm:text-sm">-</span>
                          )}
                        </TableCell>
                        {!readOnly && (
                          <TableCell className="text-center px-2">
                            <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                              <ModernTooltip>
                                <ModernTooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditRow(item)}
                                    className="h-8 w-8 sm:h-8 sm:w-8 px-0 sm:px-2 text-primary hover:text-primary/80 hover:bg-primary/10 touch-target"
                                  >
                                    <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
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
                                      className="h-8 w-8 sm:h-8 sm:w-8 px-0 sm:px-2 text-green-600 hover:text-green-700 hover:bg-green-50 touch-target"
                                    >
                                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
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
          data={data}
        />
      )}
    </ModernTooltipProvider>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo - prevent unnecessary re-renders
  return (
    prevProps.data === nextProps.data &&
    prevProps.currency === nextProps.currency &&
    prevProps.defaultPACAmount === nextProps.defaultPACAmount &&
    prevProps.currentConfigId === nextProps.currentConfigId &&
    prevProps.readOnly === nextProps.readOnly
  );
});

ReportTable.displayName = 'ReportTable';

export default ReportTable;
