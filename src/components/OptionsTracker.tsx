import { usePionexSync } from '@/hooks/usePionexSync';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function OptionsTracker() {
  const { user } = useAuth();
  const { 
    isLoading, 
    error, 
    lastSync, 
    todayEntry, 
    recentEntries, 
    currentBalance, 
    manualSync 
  } = usePionexSync(user?.id);

  if (!user) {
    return (
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Devi effettuare il login per vedere il tracker opzioni</p>
        </CardContent>
      </Card>
    );
  }

  const getOptionTypeColor = (type: string) => {
    switch (type) {
      case 'SELL_PUT': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      case 'COVERED_CALL': return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
      case 'EXPIRED': return 'bg-muted text-muted-foreground border-border';
      case 'LOSS': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getOptionTypeIcon = (type: string) => {
    switch (type) {
      case 'SELL_PUT': return <TrendingUp className="w-4 h-4" />;
      case 'COVERED_CALL': return <TrendingDown className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const formatOptionType = (type: string) => {
    const labels: Record<string, string> = {
      'SELL_PUT': 'Sell Put',
      'COVERED_CALL': 'Covered Call',
      'EXPIRED': 'Scaduta OTM',
      'LOSS': 'Loss',
      'NO_OPTION': 'Nessuna Opzione'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">🎯 Auto-Track Opzioni Pionex</CardTitle>
              <CardDescription>
                Sincronizzazione automatica giornaliera alle 09:05 UTC
              </CardDescription>
            </div>
            <Button 
              onClick={manualSync} 
              disabled={isLoading}
              size="lg"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Sincronizzazione...' : 'Sincronizza Ora'}
            </Button>
          </div>
        </CardHeader>

        {error && (
          <CardContent>
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
              ❌ {error}
            </div>
          </CardContent>
        )}
      </Card>

      {currentBalance && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💰 Balance Corrente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">BTC Libero</p>
                <p className="text-2xl font-bold">{currentBalance.btc_free.toFixed(8)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">BTC Locked</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {currentBalance.btc_locked.toFixed(8)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">USDT Libero</p>
                <p className="text-2xl font-bold">{currentBalance.usdt_free.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valore Totale</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${currentBalance.total_value_usd.toFixed(2)}
                </p>
              </div>
            </div>
            
            {lastSync && (
              <p className="text-sm text-muted-foreground mt-4">
                Ultimo sync: {lastSync.toLocaleString('it-IT')}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {todayEntry && (
        <Card className={`border-2 ${todayEntry.premium_earned >= 0 ? 'border-green-500/20' : 'border-destructive/20'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getOptionTypeIcon(todayEntry.option_type)}
              Opzione di Oggi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Badge className={getOptionTypeColor(todayEntry.option_type)}>
                  {formatOptionType(todayEntry.option_type)}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  {new Date(todayEntry.option_date).toLocaleDateString('it-IT', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-4xl font-bold ${
                  todayEntry.premium_earned >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-destructive'
                }`}>
                  {todayEntry.premium_earned >= 0 ? '+' : ''}{todayEntry.premium_in_eur.toFixed(2)} €
                </p>
                <p className="text-sm text-muted-foreground">
                  {todayEntry.premium_earned >= 0 ? '+' : ''}{todayEntry.premium_earned.toFixed(2)} USD
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>📊 Storico Ultimi 30 Giorni</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEntries.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nessun dato disponibile. Clicca "Sincronizza Ora" per iniziare.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground">Data</th>
                    <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                    <th className="text-right py-2 px-4 text-sm font-medium text-muted-foreground">Premio EUR</th>
                    <th className="text-right py-2 px-4 text-sm font-medium text-muted-foreground">Premio USD</th>
                    <th className="text-right py-2 px-4 text-sm font-medium text-muted-foreground">BTC Locked</th>
                    <th className="text-center py-2 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEntries.map((entry) => (
                    <tr key={entry.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                      <td className="py-2 px-4 text-sm">
                        {new Date(entry.option_date).toLocaleDateString('it-IT')}
                      </td>
                      <td className="py-2 px-4">
                        <Badge className={getOptionTypeColor(entry.option_type)} variant="outline">
                          {formatOptionType(entry.option_type)}
                        </Badge>
                      </td>
                      <td className={`py-2 px-4 text-right font-semibold text-sm ${
                        entry.premium_in_eur >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-destructive'
                      }`}>
                        {entry.premium_in_eur >= 0 ? '+' : ''}{entry.premium_in_eur.toFixed(2)} €
                      </td>
                      <td className="py-2 px-4 text-right text-muted-foreground text-sm">
                        {entry.premium_earned >= 0 ? '+' : ''}{entry.premium_earned.toFixed(2)} USD
                      </td>
                      <td className="py-2 px-4 text-right text-sm">
                        {entry.btc_locked_current.toFixed(6)} BTC
                      </td>
                      <td className="py-2 px-4 text-center">
                        {entry.api_sync_status === 'SUCCESS' ? (
                          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">✅</Badge>
                        ) : entry.api_sync_status === 'ERROR' ? (
                          <Badge className="bg-destructive/10 text-destructive">❌</Badge>
                        ) : (
                          <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">⏳</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
