import React, { useState, useMemo, useEffect } from 'react';
import { InvestmentData } from '@/types/investment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search, Download, TrendingUp } from 'lucide-react';
import { ModernTooltipProvider } from '@/components/ui/ModernTooltip';
import { Currency } from '@/lib/utils';
import ReportTableRow from './ReportTableRow';

interface ReportTableProps {
  data: InvestmentData[];
  currency: Currency;
  onExportCSV: () => void;
  onUpdateDailyReturnInReport: (day: number, newReturn: number) => void;
  onUpdatePACInReport: (day: number, newPAC: number) => void;
  onRemovePACOverride?: (day: number) => void;
}

const ReportTable: React.FC<ReportTableProps> = ({
  data,
  currency,
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
                  paginatedData.map((item) => (
                    <ReportTableRow
                      key={item.day}
                      item={item}
                      currency={currency}
                      editingDay={editingDay}
                      setEditingDay={setEditingDay}
                      editValue={editValue}
                      setEditValue={setEditValue}
                      handleEdit={handleEdit}
                      handleSave={handleSave}
                      handleCancel={handleCancel}
                      editingPACDay={editingPACDay}
                      setEditingPACDay={setEditingPACDay}
                      editPACValue={editPACValue}
                      setEditPACValue={setEditPACValue}
                      handleEditPAC={handleEditPAC}
                      handleSavePAC={handleSavePAC}
                      handleCancelPAC={handleCancelPAC}
                      onRemovePACOverride={onRemovePACOverride}
                      formatDate={formatDate}
                    />
                  ))
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
    </ModernTooltipProvider>
  );
};

export default ReportTable;
