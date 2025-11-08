import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InvestmentData } from '@/types/investment';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Edit3, DollarSign, TrendingDown } from 'lucide-react';
import { ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from '@/components/ui/ModernTooltip';
import { Currency, formatCurrency } from '@/lib/utils';

interface VirtualizedReportTableProps {
  data: InvestmentData[];
  currency: Currency;
  currentInvestmentDay: number | null;
  formatDate: (date: string) => string;
  handleEditRow: (item: InvestmentData) => void;
  handleTradeRecord: (item: InvestmentData) => void;
  getTradeForDay: (day: number) => any;
  readOnly: boolean;
}

const ROW_HEIGHT = 80; // Height in pixels for each row
const CONTAINER_HEIGHT = 600; // Max container height
const OVERSCAN = 3; // Number of items to render above/below visible area

const VirtualizedReportTable: React.FC<VirtualizedReportTableProps> = ({
  data,
  currency,
  currentInvestmentDay,
  formatDate,
  handleEditRow,
  handleTradeRecord,
  getTradeForDay,
  readOnly,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const isCurrentDay = (dayNumber: number) => {
    return currentInvestmentDay === dayNumber;
  };

  // Calculate visible range
  const visibleStart = Math.floor(scrollTop / ROW_HEIGHT);
  const visibleEnd = Math.ceil((scrollTop + CONTAINER_HEIGHT) / ROW_HEIGHT);
  
  // Add overscan
  const startIndex = Math.max(0, visibleStart - OVERSCAN);
  const endIndex = Math.min(data.length, visibleEnd + OVERSCAN);
  
  const visibleItems = data.slice(startIndex, endIndex);
  const totalHeight = data.length * ROW_HEIGHT;
  const offsetY = startIndex * ROW_HEIGHT;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Row component
  const renderRow = (item: InvestmentData, index: number) => {
    const dailyGain = item.interestEarnedDaily;
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
      <div
        key={item.day}
        className={`
          grid grid-cols-11 gap-2 border-b border-border px-4 py-2 items-center
          hover:bg-muted/50 text-xs sm:text-sm
          ${isToday ? 'bg-primary/5 border-primary/20 border-2 animate-pulse-gentle' : ''}
        `}
        style={{ height: ROW_HEIGHT }}
      >
        {/* Giorno */}
        <div className="font-medium text-center relative">
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
        </div>

        {/* Data */}
        <div className={`text-xs sm:text-sm ${isToday ? 'font-semibold text-primary' : ''}`}>
          {formatDate(item.date)}
        </div>

        {/* Capitale Iniziale - hidden on mobile */}
        <div className="text-right font-mono text-xs sm:text-sm hidden sm:block">
          {formatCurrency(item.capitalBeforePAC, currency)}
        </div>

        {/* PAC */}
        <div className="text-right font-mono text-xs sm:text-sm">
          {formatCurrency(item.pacAmount, currency)}
        </div>

        {/* Trade Reale - hidden on mobile */}
        <div className="text-center hidden md:block">
          {actualTrade ? (
            <div className="space-y-1">
              {actualTrade.option_status === 'filled' ? (
                <>
                  <Badge variant="default" className="bg-green-600 text-xs">
                    Fillata
                  </Badge>
                  <div className="text-xs font-mono">
                    {actualTrade.btc_amount?.toFixed(8)} BTC
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    @ ${actualTrade.fill_price_usd?.toLocaleString()}
                  </div>
                </>
              ) : (
                <>
                  <Badge variant="secondary" className="bg-blue-600 text-xs">
                    Scaduta OTM
                  </Badge>
                  <div className="text-xs font-mono text-blue-600">
                    +${actualTrade.premium_received_usdt?.toLocaleString()} USDT
                  </div>
                </>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">-</span>
          )}
        </div>

        {/* % Ricavo */}
        <div className={`text-right font-mono text-xs sm:text-sm ${item.dailyReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {item.dailyReturn.toFixed(3)}%
        </div>

        {/* Ricavo Giorno - hidden on mobile */}
        <div className={`text-right font-mono text-xs sm:text-sm hidden sm:block ${dailyGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(dailyGain, currency)}
        </div>

        {/* Capitale Finale */}
        <div className={`text-right font-mono font-semibold text-xs sm:text-sm ${isToday ? 'text-primary' : ''}`}>
          {formatCurrency(item.finalCapital, currency)}
        </div>

        {/* Valore Reale - hidden on tablet */}
        <div className="text-right font-mono text-xs sm:text-sm hidden lg:block">
          {realValue ? (
            <span className="text-green-600 font-semibold">
              {formatCurrency(realValue, 'USD')}
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>

        {/* Differenza - hidden on tablet */}
        <div className="text-right font-mono text-xs sm:text-sm hidden lg:block">
          {difference !== null ? (
            <div className="flex flex-col items-end">
              <span className={`${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {difference >= 0 ? '+' : ''}{formatCurrency(Math.abs(difference), 'USD')}
              </span>
              {diffPercentage !== null && (
                <span className={`text-[10px] ${diffPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ({diffPercentage >= 0 ? '+' : ''}{diffPercentage.toFixed(2)}%)
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>

        {/* Azioni */}
        {!readOnly && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <ModernTooltip>
                <ModernTooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditRow(item)}
                    className="h-8 w-8 px-0 text-primary hover:text-primary/80 hover:bg-primary/10"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </ModernTooltipTrigger>
                <ModernTooltipContent>
                  <p>Modifica rendimento e PAC per il giorno {item.day}</p>
                </ModernTooltipContent>
              </ModernTooltip>
              
              <ModernTooltip>
                <ModernTooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTradeRecord(item)}
                    className={`h-8 w-8 px-0 ${
                      actualTrade 
                        ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                        : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    {actualTrade ? <DollarSign className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </Button>
                </ModernTooltipTrigger>
                <ModernTooltipContent>
                  <p>{actualTrade ? 'Trade registrato - Clicca per modificare' : `Registra trade reale per il giorno ${item.day}`}</p>
                </ModernTooltipContent>
              </ModernTooltip>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-md border">
      {/* Fixed Header */}
      <div className="grid grid-cols-11 gap-2 border-b border-border bg-muted/50 px-4 py-3 text-xs sm:text-sm font-medium sticky top-0 z-10">
        <div className="text-center">Giorno</div>
        <div>Data</div>
        <div className="text-right hidden sm:block">Capitale Iniziale</div>
        <div className="text-right">PAC</div>
        <div className="text-center hidden md:block">Trade Reale</div>
        <div className="text-right">% Ricavo</div>
        <div className="text-right hidden sm:block">Ricavo Giorno</div>
        <div className="text-right font-mono">Capitale Finale</div>
        <div className="text-right hidden lg:block">Valore Reale</div>
        <div className="text-right hidden lg:block">Differenza</div>
        {!readOnly && <div className="text-center">Azioni</div>}
      </div>

      {/* Virtualized Scrollable Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="overflow-y-auto"
        style={{ height: CONTAINER_HEIGHT, position: 'relative' }}
      >
        {/* Spacer for total height */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {/* Visible items with offset */}
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleItems.map((item, idx) => renderRow(item, startIndex + idx))}
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
        Visualizzati {data.length} giorni • Virtual scrolling attivo (rendering {visibleItems.length} righe)
      </div>
    </div>
  );
};

export default React.memo(VirtualizedReportTable);
