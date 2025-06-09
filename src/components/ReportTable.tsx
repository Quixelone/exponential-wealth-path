
import React, { useState, useMemo } from 'react';
import { InvestmentData } from '@/types/investment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Search, Download, TrendingUp, TrendingDown } from 'lucide-react';

interface ReportTableProps {
  data: InvestmentData[];
  onExportCSV: () => void;
}

const ReportTable: React.FC<ReportTableProps> = ({ data, onExportCSV }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 20;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const calculateDailyGain = (item: InvestmentData, previousCapital: number) => {
    const dailyGain = item.finalCapital - item.capitalAfterPAC;
    return dailyGain;
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(item => 
      item.day.toString().includes(searchTerm) ||
      item.date.includes(searchTerm)
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const previousData = (index: number) => {
    const actualIndex = startIndex + index;
    return actualIndex > 0 ? filteredData[actualIndex - 1] : null;
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Report Giornaliero
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca giorno o data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full sm:w-48"
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
                <TableHead className="w-16">Giorno</TableHead>
                <TableHead className="w-24">Data</TableHead>
                <TableHead className="text-right">Capitale Attuale</TableHead>
                <TableHead className="text-right">Ricavo Giorno</TableHead>
                <TableHead className="text-right">% Ricavo</TableHead>
                <TableHead className="text-right">Totale Attuale</TableHead>
                <TableHead className="w-16">Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nessun dato trovato
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => {
                  const actualIndex = startIndex + index;
                  const prevItem = actualIndex > 0 ? filteredData[actualIndex - 1] : null;
                  const dailyGain = calculateDailyGain(item, prevItem?.finalCapital || 0);
                  const isPositiveGain = dailyGain >= 0;
                  
                  return (
                    <TableRow key={item.day} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{item.day}</TableCell>
                      <TableCell className="text-sm">{formatDate(item.date)}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(item.capitalBeforePAC)}
                      </TableCell>
                      <TableCell className={`text-right font-mono ${isPositiveGain ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {isPositiveGain ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {formatCurrency(dailyGain)}
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-mono ${item.dailyReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.dailyReturn.toFixed(3)}%
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatCurrency(item.finalCapital)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {item.isCustomReturn && (
                            <Badge variant="secondary" className="text-xs">
                              Custom
                            </Badge>
                          )}
                          {item.pacAmount > 0 && (
                            <Badge variant="outline" className="text-xs">
                              PAC
                            </Badge>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Visualizzando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} di {filteredData.length} giorni
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Precedente
              </Button>
              <span className="text-sm">
                Pagina {currentPage} di {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Successiva
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportTable;
