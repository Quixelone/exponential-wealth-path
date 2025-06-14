
import React, { useState, useMemo } from 'react';
import { InvestmentData } from '@/types/investment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Search, Download, TrendingUp, TrendingDown, Edit3, Check, X, Sparkles } from 'lucide-react';
import ModernTooltip from '@/components/ui/modern-tooltip';

interface ReportTableProps {
  data: InvestmentData[];
  onExportCSV: () => void;
}

const ReportTable: React.FC<ReportTableProps> = ({ data, onExportCSV }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
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

  const handleEditStart = (day: number, currentValue: number) => {
    setEditingRow(day);
    setEditValue(currentValue);
  };

  const handleEditSave = (day: number) => {
    // Qui implementeresti la logica per salvare il valore modificato
    console.log(`Saving value ${editValue} for day ${day}`);
    // Per ora simuliamo il salvataggio
    setEditingRow(null);
    setEditValue(0);
  };

  const handleEditCancel = () => {
    setEditingRow(null);
    setEditValue(0);
  };

  return (
    <Card className="glass-card hover-lift border-0 shadow-xl animate-slide-in-bottom">
      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-t-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-3">
            <div className="w-8 h-8 modern-gradient rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="modern-gradient-text font-bold text-xl">Report Giornaliero</span>
            <ModernTooltip content="Clicca su una riga per modificare i valori direttamente nella tabella">
              <Sparkles className="h-4 w-4 text-purple-400 cursor-help" />
            </ModernTooltip>
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca giorno o data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full sm:w-48 bg-white/50 border-gray-200/50 focus:bg-white focus:border-purple-300"
              />
            </div>
            <Button 
              onClick={onExportCSV} 
              variant="outline" 
              size="sm"
              className="bg-white/50 backdrop-blur-sm border-white/30 hover:bg-white/70 hover:shadow-lg transition-all"
            >
              <Download className="h-4 w-4 mr-2" />
              Esporta CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50/90 to-blue-50/90 backdrop-blur-sm border-gray-200/50">
                <TableHead className="w-16 font-semibold text-gray-700">Giorno</TableHead>
                <TableHead className="w-24 font-semibold text-gray-700">Data</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">Capitale Attuale</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">Ricavo Giorno</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">% Ricavo</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">Totale Attuale</TableHead>
                <TableHead className="w-16 font-semibold text-gray-700">Tipo</TableHead>
                <TableHead className="w-16 font-semibold text-gray-700">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-600">Nessun dato trovato</p>
                        <p className="text-sm text-gray-400">Prova a modificare i criteri di ricerca</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => {
                  const actualIndex = startIndex + index;
                  const prevItem = actualIndex > 0 ? filteredData[actualIndex - 1] : null;
                  const dailyGain = calculateDailyGain(item, prevItem?.finalCapital || 0);
                  const isPositiveGain = dailyGain >= 0;
                  const isEditing = editingRow === item.day;
                  
                  return (
                    <TableRow 
                      key={item.day} 
                      className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 border-gray-200/30 group"
                    >
                      <TableCell className="font-bold">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                          {item.day}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-gray-600">
                        {formatDate(item.date)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatCurrency(item.capitalBeforePAC)}
                      </TableCell>
                      <TableCell className={`text-right font-mono font-bold ${isPositiveGain ? 'text-green-600' : 'text-red-600'}`}>
                        <div className="flex items-center justify-end gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isPositiveGain ? 'bg-green-100' : 'bg-red-100'}`}>
                            {isPositiveGain ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                          </div>
                          {formatCurrency(dailyGain)}
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-mono font-bold ${item.dailyReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {isEditing ? (
                          <div className="flex items-center gap-2 justify-end">
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(Number(e.target.value))}
                              step={0.01}
                              className="w-20 h-8 text-right text-sm"
                              autoFocus
                            />
                            <span className="text-xs">%</span>
                          </div>
                        ) : (
                          <ModernTooltip content="Clicca per modificare il rendimento di questo giorno">
                            <div 
                              className="cursor-pointer hover:bg-white/50 rounded px-2 py-1 transition-colors"
                              onClick={() => handleEditStart(item.day, item.dailyReturn)}
                            >
                              {item.dailyReturn.toFixed(3)}%
                            </div>
                          </ModernTooltip>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-lg">
                        {formatCurrency(item.finalCapital)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {item.isCustomReturn && (
                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                              Custom
                            </Badge>
                          )}
                          {item.pacAmount > 0 && (
                            <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">
                              PAC
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <ModernTooltip content="Salva le modifiche">
                              <Button
                                size="sm"
                                onClick={() => handleEditSave(item.day)}
                                className="h-7 w-7 p-0 bg-green-500 hover:bg-green-600"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            </ModernTooltip>
                            <ModernTooltip content="Annulla le modifiche">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEditCancel}
                                className="h-7 w-7 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </ModernTooltip>
                          </div>
                        ) : (
                          <ModernTooltip content="Modifica questa riga">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStart(item.day, item.dailyReturn)}
                              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          </ModernTooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Modern Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50/50 to-blue-50/50 border-t border-gray-200/50">
            <div className="text-sm text-gray-600 bg-white/70 rounded-lg px-3 py-2">
              Visualizzando <span className="font-semibold">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> di <span className="font-semibold">{filteredData.length}</span> giorni
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="bg-white/70 hover:bg-white hover:shadow-md transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
                Precedente
              </Button>
              <div className="bg-white/70 rounded-lg px-3 py-2">
                <span className="text-sm font-medium">
                  Pagina <span className="modern-gradient-text font-bold">{currentPage}</span> di {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="bg-white/70 hover:bg-white hover:shadow-md transition-all"
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
