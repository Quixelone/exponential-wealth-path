import React, { useState, useMemo, useEffect, useRef } from 'react';
import { InvestmentData } from '@/types/investment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Search, Download, TrendingUp, Edit3, Calendar, DollarSign, TrendingDown, Zap, BarChart3 } from 'lucide-react';
import { ModernTooltipProvider, ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from '@/components/ui/ModernTooltip';
import { Currency, formatCurrency } from '@/lib/utils';
import RowEditDialog from './RowEditDialog';
import { TradeRecordDialog } from './TradeRecordDialog';
import { useActualTrades } from '@/hooks/useActualTrades';
import VirtualizedReportTable from './VirtualizedReportTable';
import { useDeviceInfo } from '@/hooks/use-mobile';

// Mobile Card Component
interface MobileReportCardProps {
  item: InvestmentData;
  currency: Currency;
  isCurrentDay: boolean;
  onEdit: () => void;
  onTrade: () => void;
  actualTrade: any;
  formatDate: (date: string) => string;
  readOnly?: boolean;
}

const MobileReportCard: React.FC<MobileReportCardProps> = ({ 
  item, 
  currency, 
  isCurrentDay, 
  onEdit, 
  onTrade, 
  actualTrade,
  formatDate,
  readOnly 
}) => {
  const dailyGain = item.interestEarnedDaily;
  const isPositiveGain = dailyGain >= 0;
  const isPositiveReturn = item.dailyReturn >= 0;
  
  const realValue = actualTrade 
    ? (actualTrade.option_status === 'filled' 
        ? (actualTrade.btc_amount || 0) * (actualTrade.fill_price_usd || 0)
        : (actualTrade.premium_received_usdt || 0))
    : null;

  return (
    <Card 
      className={`
        mobile-report-card p-4 space-y-3 
        ${isCurrentDay ? 'border-primary/50 shadow-lg shadow-primary/10 bg-primary/5' : 'border-border/50'}
        animate-fade-in
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Badge 
            variant={isCurrentDay ? "default" : "secondary"} 
            className={`text-xs font-semibold px-2 py-1 ${isCurrentDay ? 'bg-primary animate-pulse' : ''}`}
          >
            Giorno {item.day}
          </Badge>
          {isCurrentDay && (
            <Calendar className="h-4 w-4 text-primary" />
          )}
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {formatDate(item.date)}
        </span>
      </div>

      {/* Main Stats - 3 Column Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">PAC</div>
          <div className="text-sm font-bold font-mono">
            {item.pacAmount >= 1000 
              ? `${(item.pacAmount / 1000).toFixed(1)}k` 
              : formatCurrency(item.pacAmount, currency)}
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">% Ric.</div>
          <div className={`text-sm font-bold font-mono ${isPositiveReturn ? 'text-green-600' : 'text-red-600'}`}>
            {isPositiveReturn ? '+' : ''}{item.dailyReturn.toFixed(2)}%
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Cap. Fin.</div>
          <div className={`text-sm font-bold font-mono ${isCurrentDay ? 'text-primary' : ''}`}>
            {item.finalCapital >= 1000 
              ? `${(item.finalCapital / 1000).toFixed(1)}k` 
              : formatCurrency(item.finalCapital, currency)}
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="flex justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/30">
        <div>
          <span className="font-medium">Cap. Iniz:</span> {' '}
          <span className="font-mono">
            {item.capitalBeforePAC >= 1000 
              ? `${(item.capitalBeforePAC / 1000).toFixed(1)}k` 
              : formatCurrency(item.capitalBeforePAC, currency)}
          </span>
        </div>
        <div>
          <span className="font-medium">Ricavo:</span> {' '}
          <span className={`font-mono ${isPositiveGain ? 'text-green-600' : 'text-red-600'}`}>
            {isPositiveGain ? '+' : ''}{dailyGain >= 1000 
              ? `${(dailyGain / 1000).toFixed(1)}k` 
              : formatCurrency(dailyGain, currency)}
          </span>
        </div>
      </div>

      {/* Trade Info if present */}
      {actualTrade && (
        <div className="p-2 bg-muted/30 rounded-md space-y-1">
          {actualTrade.option_status === 'filled' ? (
            <>
              <Badge variant="default" className="bg-green-600 text-[10px]">
                Fillata
              </Badge>
              <div className="text-xs font-mono">
                {actualTrade.btc_amount?.toFixed(8)} BTC @ ${actualTrade.fill_price_usd?.toLocaleString()}
              </div>
            </>
          ) : (
            <>
              <Badge variant="secondary" className="bg-blue-600 text-[10px]">
                Scaduta OTM
              </Badge>
              <div className="text-xs font-mono text-blue-600">
                +${actualTrade.premium_received_usdt?.toLocaleString()} USDT
              </div>
            </>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {!readOnly && (
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1 touch-target min-h-[44px] text-xs"
          >
            <Edit3 className="h-3.5 w-3.5 mr-1.5" />
            Modifica
          </Button>
          <Button
            variant={actualTrade ? "default" : "outline"}
            size="sm"
            onClick={onTrade}
            className={`flex-1 touch-target min-h-[44px] text-xs ${
              actualTrade 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            {actualTrade ? (
              <>
                <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                Trade
              </>
            ) : (
              <>
                <TrendingDown className="h-3.5 w-3.5 mr-1.5" />
                Registra
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
};

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
  const { isMobile } = useDeviceInfo();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [useVirtualScroll, setUseVirtualScroll] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InvestmentData | null>(null);
  const hasManuallyNavigated = useRef(false);
  const currentDayRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolled = useRef(false); // Flag to track if auto-scroll has been executed
  const itemsPerPage = 20;
  
  // Mobile pagination state
  const mobileItemsPerPage = 15;
  const [currentMobilePage, setCurrentMobilePage] = useState(1);

  // Auto-enable virtual scrolling for large datasets (but not on mobile)
  useEffect(() => {
    if (data.length > 100 && !useVirtualScroll && !isMobile) {
      setUseVirtualScroll(true);
    }
    // Disable virtual scroll on mobile
    if (isMobile && useVirtualScroll) {
      setUseVirtualScroll(false);
    }
  }, [data.length, isMobile]);

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
  
  // Mobile pagination calculations
  const totalMobilePages = Math.ceil(filteredData.length / mobileItemsPerPage);
  const startMobileIndex = (currentMobilePage - 1) * mobileItemsPerPage;
  const paginatedMobileData = filteredData.slice(startMobileIndex, startMobileIndex + mobileItemsPerPage);

  // Auto-scroll to current day on mount (mobile only) - ONCE
  useEffect(() => {
    // Only execute if:
    // 1. On mobile
    // 2. Current day is set
    // 3. Data is loaded
    // 4. Haven't scrolled yet
    if (isMobile && currentInvestmentDay && filteredData.length > 0 && !hasAutoScrolled.current) {
      const timer = setTimeout(() => {
        if (currentDayRef.current) {
          currentDayRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
          });
          hasAutoScrolled.current = true;
        }
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile, currentInvestmentDay, filteredData.length]);

  // Reset auto-scroll flag when data changes significantly
  useEffect(() => {
    hasAutoScrolled.current = false;
  }, [data.length, currentInvestmentDay]);

  // Auto-calculate mobile page based on current day
  useEffect(() => {
    if (isMobile && currentInvestmentDay && filteredData.length > 0) {
      const currentDayIndex = filteredData.findIndex(item => item.day === currentInvestmentDay);
      if (currentDayIndex !== -1) {
        const pageWithCurrentDay = Math.floor(currentDayIndex / mobileItemsPerPage) + 1;
        setCurrentMobilePage(pageWithCurrentDay);
      }
    }
  }, [isMobile, currentInvestmentDay, filteredData.length, mobileItemsPerPage]);

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
        <CardHeader className={isMobile ? "p-3" : ""}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <CardTitle className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 ${isMobile ? "text-sm" : "text-base sm:text-lg"}`}>
              <div className="flex items-center gap-2">
                <TrendingUp className={isMobile ? "h-4 w-4 text-primary" : "h-5 w-6 sm:h-6 sm:w-6 text-primary"} />
                <span>{isMobile ? "Report Dettagliato" : "Report Giornaliero Dettagliato"}</span>
              </div>
              {currentInvestmentDay && (
                <div className={`flex items-center gap-1 text-muted-foreground ${isMobile ? "text-[10px]" : "text-xs sm:text-sm"}`}>
                  <Calendar className={isMobile ? "h-3 w-3" : "h-3 w-3 sm:h-4 sm:w-4"} />
                  <span>Giorno corrente: {currentInvestmentDay}</span>
                </div>
              )}
              {data.length > 50 && !isMobile && (
                <div className="flex items-center gap-2 ml-auto">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <Label htmlFor="virtual-scroll" className="text-xs cursor-pointer">
                    Virtual Scroll
                  </Label>
                  <Switch
                    id="virtual-scroll"
                    checked={useVirtualScroll}
                    onCheckedChange={setUseVirtualScroll}
                  />
                </div>
              )}
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground ${isMobile ? "h-3 w-3" : "h-4 w-4"}`} />
                <Input
                  placeholder={isMobile ? "Cerca..." : "Cerca giorno, data, %..."}
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className={`w-full sm:w-56 touch-target ${isMobile ? "pl-8 text-xs h-10" : "pl-9"}`}
                />
              </div>
              {currentConfigId && currentInvestmentDay && onSaveToStrategy && (
            <Button 
              onClick={onSaveToStrategy}
              variant="default" 
              size={isMobile ? "sm" : "sm"}
              className={`bg-primary hover:bg-primary/90 w-full sm:w-auto touch-target ${isMobile ? "min-h-[40px] text-xs" : ""}`}
            >
              <TrendingUp className={isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"} />
              <span className="hidden sm:inline">Conferma Giorno {currentInvestmentDay}</span>
              <span className="sm:hidden">Conferma G.{currentInvestmentDay}</span>
            </Button>
              )}
              <Button 
                onClick={onExportCSV} 
                variant="outline" 
                size={isMobile ? "sm" : "sm"}
                className={`w-full sm:w-auto touch-target ${isMobile ? "min-h-[40px] text-xs" : ""}`}
              >
                <Download className={isMobile ? "h-3 w-3 mr-1" : "h-4 w-4 mr-2"} />
                {isMobile ? "CSV" : "Esporta CSV"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className={isMobile ? "p-3" : "p-0 sm:p-6"}>
          {/* Show loading state if no data */}
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Caricamento dati in corso...</p>
            </div>
          ) : isMobile ? (
            // Mobile Layout - Paginated List (15 items per page)
            <div className="space-y-3">
              {paginatedMobileData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nessun dato trovato per i filtri applicati.
                </div>
              ) : (
                paginatedMobileData.map((item, index) => {
                const currentDay = isCurrentDay(item.day);
                return (
                  <div 
                    key={item.day}
                    ref={currentDay ? currentDayRef : null}
                  >
                    {/* Show "OGGI" indicator above current day card */}
                    {currentDay && (
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default" className="animate-pulse">
                          OGGI
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Giorno corrente
                        </span>
                      </div>
                    )}
                    <MobileReportCard
                      item={item}
                      currency={currency}
                      isCurrentDay={currentDay}
                      onEdit={() => handleEditRow(item)}
                      onTrade={() => handleTradeRecord(item)}
                      actualTrade={getTradeForDay(item.day)}
                      formatDate={formatDate}
                      readOnly={readOnly}
                    />
                  </div>
                );
              })
              )}
              
              {/* Mobile Pagination Controls */}
              {totalMobilePages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMobilePage(prev => Math.max(1, prev - 1))}
                    disabled={currentMobilePage === 1}
                    className="touch-target"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Indietro
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">
                    Pagina {currentMobilePage} di {totalMobilePages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMobilePage(prev => Math.min(totalMobilePages, prev + 1))}
                    disabled={currentMobilePage === totalMobilePages}
                    className="touch-target"
                  >
                    Avanti
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          ) : useVirtualScroll ? (
            // Virtual scrolling mode for large datasets (desktop only)
            <VirtualizedReportTable
              data={filteredData}
              currency={currency}
              currentInvestmentDay={currentInvestmentDay}
              formatDate={formatDate}
              handleEditRow={handleEditRow}
              handleTradeRecord={handleTradeRecord}
              getTradeForDay={getTradeForDay}
              readOnly={readOnly}
            />
          ) : (
            // Desktop Table Layout
            <>
          <div className={`rounded-md border overflow-x-auto ${isMobile ? "mobile-table-wrapper" : ""}`}>
            <Table>
              <TableHeader>
                <TableRow className={isMobile ? "text-[10px]" : "text-xs sm:text-sm"}>
                  <TableHead className={`text-center ${isMobile ? "w-10 px-1 sticky left-0 bg-background z-10" : "w-12 sm:w-16 px-2"}`}>Giorno</TableHead>
                  <TableHead className={isMobile ? "w-16 px-1" : "w-20 sm:w-28 px-2"}>Data</TableHead>
                  <TableHead className="text-right px-1 sm:px-2 hidden sm:table-cell">Cap. Iniz.</TableHead>
                  <TableHead className={`text-right ${isMobile ? "px-1" : "px-2"}`}>PAC</TableHead>
                  <TableHead className="text-center px-1 sm:px-2 hidden md:table-cell">Trade</TableHead>
                  <TableHead className={`text-right ${isMobile ? "px-1" : "px-2"}`}>% Ric.</TableHead>
                  <TableHead className="text-right px-1 sm:px-2 hidden sm:table-cell">Ricavo</TableHead>
                  <TableHead className={`text-right font-mono ${isMobile ? "px-1" : "px-2"}`}>Cap. Fin.</TableHead>
                  <TableHead className="text-right px-1 sm:px-2 hidden lg:table-cell">Val. Reale</TableHead>
                  <TableHead className="text-right px-1 sm:px-2 hidden lg:table-cell">Diff.</TableHead>
                  {!readOnly && <TableHead className={`text-center ${isMobile ? "w-16 px-1" : "w-20 sm:w-32 px-2"}`}>Azioni</TableHead>}
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
                          hover:bg-muted/50
                          ${isMobile ? 'text-[10px]' : 'text-xs sm:text-sm'}
                          ${isToday ? 'bg-primary/5 border-primary/20 border-2 animate-pulse-gentle' : ''}
                        `}
                      >
                        <TableCell className={`font-medium text-center relative sticky left-0 bg-background z-10 ${isMobile ? 'px-1 mobile-table-cell' : 'px-2'}`}>
                          <div className="flex items-center justify-center gap-1">
                            {item.day}
                            {isToday && !isMobile && (
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
                        <TableCell className={`${isMobile ? 'px-1 mobile-table-cell text-[9px]' : 'text-xs sm:text-sm px-2'} ${isToday ? 'font-semibold text-primary' : ''}`}>
                          {isMobile ? formatDate(item.date).replace(/\//g, '/') : formatDate(item.date)}
                        </TableCell>
                        <TableCell className={`text-right font-mono px-2 hidden sm:table-cell ${isMobile ? 'mobile-table-cell' : 'text-xs sm:text-sm'}`}>
                          {formatCurrency(item.capitalBeforePAC, currency)}
                        </TableCell>
                        <TableCell className={`text-right font-mono ${isMobile ? 'px-1 mobile-table-cell text-[9px]' : 'text-xs sm:text-sm px-2'}`}>
                          {isMobile ? `${(item.pacAmount / 1000).toFixed(1)}k` : formatCurrency(item.pacAmount, currency)}
                        </TableCell>
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
                        <TableCell className={`text-right font-mono ${isMobile ? 'px-1 mobile-table-cell text-[9px]' : 'text-xs sm:text-sm px-2'} ${item.dailyReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.dailyReturn.toFixed(isMobile ? 2 : 3)}%
                        </TableCell>
                        <TableCell className={`text-right font-mono px-2 hidden sm:table-cell ${isMobile ? 'mobile-table-cell' : 'text-xs sm:text-sm'} ${isPositiveGain ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(dailyGain, currency)}
                        </TableCell>
                        <TableCell className={`text-right font-mono font-semibold ${isMobile ? 'px-1 mobile-table-cell text-[9px]' : 'text-xs sm:text-sm px-2'} ${isToday ? 'text-primary' : ''}`}>
                          {isMobile ? `${(item.finalCapital / 1000).toFixed(1)}k` : formatCurrency(item.finalCapital, currency)}
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
                          <TableCell className={`text-center ${isMobile ? 'px-1' : 'px-2'}`}>
                            <div className={`flex items-center justify-center ${isMobile ? 'gap-0.5' : 'gap-0.5 sm:gap-1'}`}>
                              <ModernTooltip>
                                <ModernTooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditRow(item)}
                                    className={`text-primary hover:text-primary/80 hover:bg-primary/10 touch-target ${isMobile ? 'h-9 w-9 p-0' : 'h-8 w-8 sm:h-8 sm:w-8 px-0 sm:px-2'}`}
                                  >
                                    <Edit3 className={isMobile ? "h-3.5 w-3.5" : "h-3 w-3 sm:h-4 sm:w-4"} />
                                  </Button>
                                </ModernTooltipTrigger>
                                {!isMobile && (
                                  <ModernTooltipContent>
                                    <p>Modifica rendimento e PAC per il giorno {item.day}</p>
                                  </ModernTooltipContent>
                                )}
                              </ModernTooltip>
                              
                              {actualTrade ? (
                                <ModernTooltip>
                                  <ModernTooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleTradeRecord(item)}
                                      className={`text-green-600 hover:text-green-700 hover:bg-green-50 touch-target ${isMobile ? 'h-9 w-9 p-0' : 'h-8 w-8 sm:h-8 sm:w-8 px-0 sm:px-2'}`}
                                    >
                                      <DollarSign className={isMobile ? "h-3.5 w-3.5" : "h-3 w-3 sm:h-4 sm:w-4"} />
                                    </Button>
                                  </ModernTooltipTrigger>
                                  {!isMobile && (
                                    <ModernTooltipContent>
                                      <p>Trade registrato - Clicca per modificare</p>
                                    </ModernTooltipContent>
                                  )}
                                </ModernTooltip>
                              ) : (
                                <ModernTooltip>
                                  <ModernTooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleTradeRecord(item)}
                                      className={`text-blue-600 hover:text-blue-700 hover:bg-blue-50 ${isMobile ? 'h-9 w-9 p-0' : 'h-8 px-2'}`}
                                    >
                                      <TrendingDown className={isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} />
                                    </Button>
                                  </ModernTooltipTrigger>
                                  {!isMobile && (
                                    <ModernTooltipContent>
                                      <p>Registra trade reale per il giorno {item.day}</p>
                                    </ModernTooltipContent>
                                  )}
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
            </>
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
