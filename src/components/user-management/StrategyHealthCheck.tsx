import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface StrategyHealthCheckProps {
  lastModified: string;
  createdAt: string;
  dailyReturnsCount: number;
  pacOverridesCount: number;
  actualTradesCount: number;
  expectedDays: number;
}

export const StrategyHealthCheck = ({
  lastModified,
  createdAt,
  dailyReturnsCount,
  pacOverridesCount,
  actualTradesCount,
  expectedDays,
}: StrategyHealthCheckProps) => {
  const daysSinceCreation = Math.floor(
    (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const daysSinceLastUpdate = Math.floor(
    (new Date().getTime() - new Date(lastModified).getTime()) / (1000 * 60 * 60 * 24)
  );

  const expectedUpdates = Math.min(daysSinceCreation, expectedDays);
  const updatePercentage = expectedUpdates > 0 ? (dailyReturnsCount / expectedUpdates) * 100 : 0;

  const getHealthStatus = () => {
    if (daysSinceLastUpdate > 7) return { status: 'warning', label: 'Attenzione richiesta', icon: AlertCircle, color: 'text-amber-500' };
    if (updatePercentage < 50) return { status: 'warning', label: 'Aggiornamenti insufficienti', icon: AlertCircle, color: 'text-amber-500' };
    if (updatePercentage >= 80) return { status: 'healthy', label: 'Ottimo', icon: CheckCircle, color: 'text-green-500' };
    return { status: 'ok', label: 'Buono', icon: CheckCircle, color: 'text-blue-500' };
  };

  const health = getHealthStatus();

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Stato della Strategia</h3>
          <Badge 
            variant={health.status === 'healthy' ? 'default' : health.status === 'warning' ? 'secondary' : 'outline'}
            className="flex items-center gap-1"
          >
            <health.icon className={`h-3 w-3 ${health.color}`} />
            {health.label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Ultimo aggiornamento
            </div>
            <p className="text-sm font-medium text-foreground">
              {formatDistanceToNow(new Date(lastModified), { addSuffix: true, locale: it })}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Frequenza aggiornamenti
            </div>
            <p className="text-sm font-medium text-foreground">
              {updatePercentage.toFixed(0)}% ({dailyReturnsCount}/{expectedUpdates})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{dailyReturnsCount}</p>
            <p className="text-xs text-muted-foreground">Ritorni registrati</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{pacOverridesCount}</p>
            <p className="text-xs text-muted-foreground">Modifiche PAC</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{actualTradesCount}</p>
            <p className="text-xs text-muted-foreground">Trade registrati</p>
          </div>
        </div>

        {daysSinceLastUpdate > 7 && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Questa strategia non viene aggiornata da {daysSinceLastUpdate} giorni. L'utente potrebbe aver bisogno di assistenza.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
