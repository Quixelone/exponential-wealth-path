import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Search, TrendingUp } from 'lucide-react';
import { useAdminStrategies, AdminStrategyData } from '@/hooks/useAdminStrategies';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface UserStrategiesTableProps {
  onViewDetails: (configId: string, userId: string, strategyName: string, userName: string) => void;
}

const UserStrategiesTable = ({ onViewDetails }: UserStrategiesTableProps) => {
  const { strategies, loading } = useAdminStrategies();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStrategies = strategies.filter((strategy) => {
    const searchLower = searchTerm.toLowerCase();
    const userName = `${strategy.user_first_name || ''} ${strategy.user_last_name || ''}`.trim();
    return (
      strategy.name.toLowerCase().includes(searchLower) ||
      strategy.user_email.toLowerCase().includes(searchLower) ||
      userName.toLowerCase().includes(searchLower)
    );
  });

  const getUserDisplayName = (strategy: AdminStrategyData) => {
    if (strategy.user_first_name || strategy.user_last_name) {
      return `${strategy.user_first_name || ''} ${strategy.user_last_name || ''}`.trim();
    }
    return strategy.user_email;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Strategie degli Utenti</CardTitle>
          </div>
          <Badge variant="secondary">{strategies.length} strategie totali</Badge>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome strategia, utente o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome Strategia</TableHead>
                <TableHead>Utente</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Capitale Iniziale</TableHead>
                <TableHead className="text-right">Orizzonte</TableHead>
                <TableHead>Creata il</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStrategies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nessuna strategia trovata
                  </TableCell>
                </TableRow>
              ) : (
                filteredStrategies.map((strategy) => (
                  <TableRow key={strategy.id}>
                    <TableCell className="font-medium">{strategy.name}</TableCell>
                    <TableCell>{getUserDisplayName(strategy)}</TableCell>
                    <TableCell className="text-muted-foreground">{strategy.user_email}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(strategy.initial_capital, strategy.currency as 'EUR' | 'USD' | 'USDT')}
                    </TableCell>
                    <TableCell className="text-right">{strategy.time_horizon} giorni</TableCell>
                    <TableCell>
                      {format(new Date(strategy.created_at), 'dd MMM yyyy', { locale: it })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          onViewDetails(
                            strategy.id,
                            strategy.user_id,
                            strategy.name,
                            getUserDisplayName(strategy)
                          )
                        }
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Dettagli
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStrategiesTable;
