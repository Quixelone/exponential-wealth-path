
import React, { useState, useMemo, useEffect } from 'react';
import { InvestmentData } from '@/types/investment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search, Download, TrendingUp, Edit3 } from 'lucide-react';
import { ModernTooltipProvider, ModernTooltip, ModernTooltipContent, ModernTooltipTrigger } from '@/components/ui/ModernTooltip';
import { Currency, formatCurrency } from '@/lib/utils';
import RowEditDialog from './RowEditDialog';

interface ReportTableProps {
  data: InvestmentData[];
  currency: Currency;
  onExportCSV: () => void;
  onUpdateDailyReturnInReport: (day: number, newReturn: number) => void;
  onUpdatePACInReport: (day: number, newPAC: number) => void;
  onRemovePACOverride?: (day: number) => void;
  defaultPACAmount: number;
}

const ReportTable: React.FC<ReportTableProps> = ({
  data,
  currency,
  onExportCSV,
  onUpdateDailyReturnInReport,
  onUpdatePACInReport,
  onRemovePACOverride,
  defaultPACAmount
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InvestmentData | null>(null);
  const itemsPerPage = 20;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', { year: 'numeric', month: '2-digit', day: '2-digit'});
  };

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

  const handleEditRow = (item: InvestmentData) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  return (
    <ModernTooltipProvider>
      <Card className="animate-fade-in">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
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
                    setCurrentPage(1);
                  }}
                  className="pl-9 w-full sm:w-56"
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
                  <TableHead className="w-24 text-center">Azioni</TableHead>
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
                    const dailyGain = item.interestEarnedDaily;
                    const isPositiveGain = dailyGain >= 0;

                    return (
                      <TableRow key={item.day} className="hover:bg-muted/50">
                        <TableCell className="font-medium text-center">{item.day}</TableCell>
                        <TableCell className="text-sm">{formatDate(item.date)}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(item.capitalBeforePAC, currency)}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(item.pacAmount, currency)}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(item.capitalAfterPAC, currency)}</TableCell>
                        <TableCell className={`text-right font-mono ${item.dailyReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.dailyReturn.toFixed(3)}%
                        </TableCell>
                        <TableCell className={`text-right font-mono ${isPositiveGain ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(dailyGain, currency)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">{formatCurrency(item.finalCapital, currency)}</TableCell>
                        <TableCell className="text-center">
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
                  <ChevronLeft className="h-4 w-4 mr-1" />
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
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
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
      />
    </ModernTooltipProvider>
  );
};

export default ReportTable;
