import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowUpDown, Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { PortfolioStrategy } from '@/hooks/usePortfolioAnalytics';

interface PortfolioTableProps {
  strategies: PortfolioStrategy[];
}

type SortField = 'name' | 'currentBalance' | 'currentPerformance' | 'performanceVsPlan' | 'activeDays';
type SortDirection = 'asc' | 'desc';

const PortfolioTable = ({ strategies }: PortfolioTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('currentPerformance');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'above':
        return <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">Sopra Piano</Badge>;
      case 'below':
        return <Badge variant="destructive">Sotto Piano</Badge>;
      default:
        return <Badge variant="secondary">In Linea</Badge>;
    }
  };

  const getPerformanceIcon = (value: number) => {
    if (value > 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < -5) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedStrategies = strategies
    .filter(strategy => {
      const matchesSearch = 
        strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        strategy.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        strategy.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || strategy.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      const aNum = Number(aValue) || 0;
      const bNum = Number(bValue) || 0;
      
      return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
    });

  const exportToCsv = () => {
    const headers = [
      'Strategia',
      'Utente',
      'Email',
      'Saldo Attuale',
      'Capitale Investito',
      'Performance %',
      'Performance vs Piano %',
      'Giorni Attivi',
      'Status',
      'Data Creazione'
    ];

    const csvData = filteredAndSortedStrategies.map(strategy => [
      strategy.name,
      strategy.user_name || '',
      strategy.user_email || '',
      strategy.currentBalance.toFixed(2),
      strategy.investedCapital.toFixed(2),
      strategy.currentPerformance.toFixed(2),
      strategy.performanceVsPlan.toFixed(2),
      strategy.activeDays.toString(),
      strategy.status,
      new Date(strategy.created_at).toLocaleDateString('it-IT')
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `portfolio_overview_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl">Portfolio Dettagliato</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca strategia o utente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli Status</SelectItem>
                <SelectItem value="above">Sopra Piano</SelectItem>
                <SelectItem value="inline">In Linea</SelectItem>
                <SelectItem value="below">Sotto Piano</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportToCsv} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Esporta CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Strategia
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Utente</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort('currentBalance')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Saldo Attuale
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Investito</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort('currentPerformance')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Performance %
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort('performanceVsPlan')}
                >
                  <div className="flex items-center justify-end gap-2">
                    vs Piano
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort('activeDays')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Giorni
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedStrategies.map((strategy) => (
                <TableRow key={strategy.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <p className="font-medium">{strategy.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(strategy.created_at).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{strategy.user_name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{strategy.user_email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(strategy.currentBalance)}
                    {strategy.realBalance && (
                      <p className="text-xs text-muted-foreground">
                        Reale: {formatCurrency(strategy.realBalance)}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(strategy.investedCapital)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {getPerformanceIcon(strategy.currentPerformance)}
                      <span className={`font-mono ${
                        strategy.currentPerformance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(strategy.currentPerformance)}
                      </span>
                    </div>
                    {strategy.realPerformance && (
                      <p className="text-xs text-muted-foreground text-right">
                        Reale: {formatPercentage(strategy.realPerformance)}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-mono ${
                      strategy.performanceVsPlan > 0 ? 'text-green-600' : 
                      strategy.performanceVsPlan < 0 ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                      {formatPercentage(strategy.performanceVsPlan)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {strategy.activeDays}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(strategy.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredAndSortedStrategies.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {strategies.length === 0 ? 
                'Nessuna strategia trovata' : 
                'Nessun risultato corrisponde ai filtri selezionati'
              }
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioTable;